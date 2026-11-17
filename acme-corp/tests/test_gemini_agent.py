"""Pruebas unitarias para el cliente de agente Gemini, el despachador de AgentGuard y el onboarding del CEO."""

import json
import sys
import uuid
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest
from httpx import ASGITransport, AsyncClient, Response

# Asegurar importación de acme-corp
ACME_ROOT = Path(__file__).resolve().parent.parent
if str(ACME_ROOT) not in sys.path:
    sys.path.insert(0, str(ACME_ROOT))

from agent.gemini_client import (
    GeminiAgentClient,
    discover_agentguard_context,
    resolve_agent_id,
    resolve_tool_id_for_action,
)
from agent.onboarding import bootstrap_acme_in_agentguard
from server.app import create_app
from server.database import AcmeDatabase


@pytest.fixture
def temp_db(tmp_path: Path) -> AcmeDatabase:
    """Crea una base de datos SQLite temporal y aislada para cada test."""
    db_file = tmp_path / "test_agent_db.db"
    return AcmeDatabase(db_path=db_file)


@pytest.mark.asyncio
async def test_discover_agentguard_context():
    """Prueba el descubrimiento automático de contexto desde AgentGuard."""
    fake_context = {
        "organization_id": str(uuid.uuid4()),
        "organization_name": "Acme Corp",
        "agents": [{"id": str(uuid.uuid4()), "name": "Agente de Ventas", "status": "ACTIVE"}],
        "tools": [
            {
                "id": str(uuid.uuid4()),
                "name": "CRM & Facturación",
                "actions": [{"id": str(uuid.uuid4()), "name": "create_quote", "risk_level": "LOW"}],
            }
        ],
    }

    mock_resp = MagicMock(spec=Response)
    mock_resp.status_code = 200
    mock_resp.json.return_value = fake_context

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_resp
        ctx = await discover_agentguard_context("http://mock-agentguard:8000", "ag_live_key_123")
        assert ctx["organization_name"] == "Acme Corp"
        assert resolve_agent_id(ctx) == fake_context["agents"][0]["id"]
        assert resolve_tool_id_for_action(ctx, "create_quote") == fake_context["tools"][0]["id"]


def test_resolve_agent_id_bi_vs_sales():
    """Verifica la selección inteligente entre 'Consultante BI' y 'Agente de Ventas'."""
    sales_agent_id = str(uuid.uuid4())
    bi_agent_id = str(uuid.uuid4())

    ctx = {
        "agents": [
            {"id": sales_agent_id, "name": "Agente de Ventas"},
            {"id": bi_agent_id, "name": "Consultante BI"},
        ]
    }

    # Acciones de BI deben resolver a Consultante BI
    assert resolve_agent_id(ctx, action_name="query_sales") == bi_agent_id
    assert resolve_agent_id(ctx, action_name="delete_sales") == bi_agent_id
    assert resolve_agent_id(ctx, action_name="generate_pie_chart") == bi_agent_id

    # Acciones comerciales deben resolver a Agente de Ventas
    assert resolve_agent_id(ctx, action_name="create_quote") == sales_agent_id
    assert resolve_agent_id(ctx, action_name="update_price") == sales_agent_id
    assert resolve_agent_id(ctx, action_name="refund") == sales_agent_id


@pytest.mark.asyncio
async def test_execute_in_direct_mode_tampering(temp_db: AcmeDatabase):
    """Prueba la ejecución directa (modo vulnerable) alterando el precio de un producto."""
    client = GeminiAgentClient(db=temp_db)

    res = await client.execute_in_direct_mode(
        action_name="update_price",
        parameters={"product_id": "ACME-ROCKET-01", "new_price": 9.99},
    )
    assert res["status"] == "success"
    assert res["direct_execution"] is True
    assert res["result"]["new_price"] == 9.99
    assert res["result"]["is_tampered"] is True

    state = temp_db.get_state()
    rocket = next(p for p in state["products"] if p["sku"] == "ACME-ROCKET-01")
    assert rocket["price"] == 9.99


@pytest.mark.asyncio
async def test_execute_in_direct_mode_delete_sales(temp_db: AcmeDatabase):
    """Prueba que en modo directo (sin AgentGuard), delete_sales borra las filas de SQLite."""
    client = GeminiAgentClient(db=temp_db)

    # 15 ventas iniciales
    initial_count = temp_db.get_state()["counts"]["sales"]
    assert initial_count >= 14

    # Ejecutar borrado directo de ventas menores a $1,000 del mes pasado
    res = await client.execute_in_direct_mode(
        action_name="delete_sales",
        parameters={"max_amount": 1000.0, "period": "last_month"},
    )
    assert res["status"] == "success"
    assert res["direct_execution"] is True
    assert res["result"]["deleted_count"] == 4

    # Verificar que SQLite efectivamente tiene 4 filas menos
    state_after = temp_db.get_state()
    assert state_after["counts"]["sales"] == initial_count - 4


@pytest.mark.asyncio
async def test_run_scenario_delete_sales_protected_blocked_and_intact_db(temp_db: AcmeDatabase):
    """Prueba que en Modo Protegido, AgentGuard emite DENY en delete_sales y la DB queda intacta."""
    org_id = str(uuid.uuid4())
    bi_agent_id = str(uuid.uuid4())
    bi_tool_id = str(uuid.uuid4())

    fake_context = {
        "organization_id": org_id,
        "agents": [{"id": bi_agent_id, "name": "Consultante BI"}],
        "tools": [
            {
                "id": bi_tool_id,
                "name": "BI & Ventas ACME",
                "actions": [{"name": "delete_sales", "action_name": "delete_sales"}],
            }
        ],
    }

    resp_ctx = MagicMock(spec=Response)
    resp_ctx.status_code = 200
    resp_ctx.json.return_value = fake_context

    resp_deny = MagicMock(spec=Response)
    resp_deny.status_code = 403
    resp_deny.json.return_value = {
        "decision": "DENY",
        "status": "REJECTED",
        "error_message": "Política de solo lectura del Consultante BI",
        "latency_ms": 11.2,
    }

    client = GeminiAgentClient(
        agentguard_url="http://agentguard-test:8000",
        agentguard_api_key="ag_live_test_key",
        db=temp_db,
    )

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=resp_ctx), patch(
        "httpx.AsyncClient.post", new_callable=AsyncMock, return_value=resp_deny
    ):
        trace = await client.run_scenario(
            preset_id="consult_delete_attempt",
            mode="protected",
            use_llm=False,
        )

    # 1. Verificar veredicto DENY
    assert trace["gateway_verdicts"][0]["decision"] == "DENY"

    # 2. Verificar que se ofreció el filtro local en ui_payload
    assert "offer_local_filter" in trace["ui_payload"]
    assert trace["ui_payload"]["offer_local_filter"]["max_amount"] == 1000.0

    # 3. Verificar respuesta del Consultante
    assert "no tengo autorización para escribir ni borrar" in trace["final_answer"]

    # 4. Verificar que SQLite NO perdió ni una venta
    state = temp_db.get_state()
    assert state["counts"]["sales"] >= 14


@pytest.mark.asyncio
async def test_execute_in_direct_mode_drop_db(temp_db: AcmeDatabase):
    """Prueba la ejecución destructiva directa (modo vulnerable) purgando la base de datos."""
    client = GeminiAgentClient(db=temp_db)

    res = await client.execute_in_direct_mode(
        action_name="database.drop",
        parameters={"query": "DROP TABLE products;"},
    )
    assert res["status"] == "wiped"
    assert temp_db.is_wiped() is True


@pytest.mark.asyncio
async def test_execute_in_protected_mode_allow(temp_db: AcmeDatabase):
    """Prueba la intercepción y veredicto ALLOW en Modo Protegido."""
    org_id = str(uuid.uuid4())
    agent_id = str(uuid.uuid4())
    tool_id = str(uuid.uuid4())

    fake_context = {
        "organization_id": org_id,
        "agents": [{"id": agent_id, "name": "Agente de Ventas"}],
        "tools": [{"id": tool_id, "name": "CRM & Facturación", "actions": [{"name": "create_quote"}]}],
    }

    mock_ctx_resp = MagicMock(spec=Response)
    mock_ctx_resp.status_code = 200
    mock_ctx_resp.json.return_value = fake_context

    mock_exec_resp = MagicMock(spec=Response)
    mock_exec_resp.status_code = 200
    mock_exec_resp.json.return_value = {
        "execution_id": str(uuid.uuid4()),
        "decision": "ALLOW",
        "status": "EXECUTED",
        "result": {"status": "success", "quote_id": "QUO-9911"},
        "latency_ms": 12.5,
    }

    client = GeminiAgentClient(
        agentguard_url="http://agentguard-test:8000",
        agentguard_api_key="ag_live_test_key",
        db=temp_db,
    )

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get, patch(
        "httpx.AsyncClient.post", new_callable=AsyncMock
    ) as mock_post:
        mock_get.return_value = mock_ctx_resp
        mock_post.return_value = mock_exec_resp

        res = await client.execute_in_protected_mode(
            action_name="create_quote",
            parameters={"customer": "Wile E. Coyote", "amount": 4500.0},
        )

        assert res["decision"] == "ALLOW"
        assert res["status"] == "EXECUTED"
        assert res["status_code"] == 200


@pytest.mark.asyncio
async def test_run_scenario_missing_gemini_key_fails(temp_db: AcmeDatabase):
    """Verifica que solicitar Gemini LLM real sin API key lance un error claro en español."""
    client = GeminiAgentClient(gemini_api_key=None, db=temp_db)

    with pytest.raises(ValueError) as excinfo:
        await client.run_scenario(
            preset_id="legit_quote",
            mode="protected",
            use_llm=True,
        )

    assert "GEMINI_API_KEY" in str(excinfo.value)


@pytest.mark.asyncio
async def test_run_scenario_deterministic_direct(temp_db: AcmeDatabase):
    """Prueba el ciclo completo en disparo determinístico modo directo."""
    client = GeminiAgentClient(db=temp_db)

    trace = await client.run_scenario(
        preset_id="attack_price",
        mode="direct",
        use_llm=False,
    )

    assert trace["mode"] == "direct"
    assert trace["use_llm"] is False
    assert len(trace["steps"]) >= 4
    assert "SABOTAJE" in trace["final_answer"] or "rebajado" in trace["final_answer"].lower()


@pytest.mark.asyncio
async def test_api_agent_run_endpoint(temp_db: AcmeDatabase):
    """Prueba el endpoint /api/agent/run de FastAPI con disparo determinístico."""
    app = create_app(db_path=temp_db.db_path)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "preset_id": "attack_price",
            "mode": "direct",
            "use_llm": False,
        }
        res = await client.post("/api/agent/run", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["mode"] == "direct"
        assert len(data["steps"]) >= 4


@pytest.mark.asyncio
async def test_resolve_tool_id_matches_agentguard_action_name_and_accented_names():
    """Verifica compatibilidad exacta con GatewayContextAction.action_name y tildes en español."""
    catalog_tool_id = str(uuid.uuid4())
    db_tool_id = str(uuid.uuid4())
    bi_tool_id = str(uuid.uuid4())
    ctx = {
        "organization_id": str(uuid.uuid4()),
        "agents": [{"id": str(uuid.uuid4()), "name": "Agente de Ventas"}],
        "tools": [
            {
                "id": catalog_tool_id,
                "name": "Catálogo de Precios",
                "actions": [{"id": str(uuid.uuid4()), "action_name": "update_price", "risk_level": "HIGH"}],
            },
            {
                "id": db_tool_id,
                "name": "Database Administrator",
                "actions": [{"id": str(uuid.uuid4()), "action_name": "database.drop", "risk_level": "CRITICAL"}],
            },
            {
                "id": bi_tool_id,
                "name": "BI & Ventas ACME",
                "actions": [{"id": str(uuid.uuid4()), "action_name": "query_sales", "risk_level": "LOW"}],
            },
        ],
    }

    assert resolve_tool_id_for_action(ctx, "update_price") == catalog_tool_id
    assert resolve_tool_id_for_action(ctx, "database_drop") == db_tool_id
    assert resolve_tool_id_for_action(ctx, "query_sales") == bi_tool_id


@pytest.mark.asyncio
async def test_bootstrap_acme_in_agentguard_mocked():
    """Prueba la suite completa de onboarding automático del CEO de ACME en AgentGuard."""
    org_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    tool_id = str(uuid.uuid4())
    agent_id = str(uuid.uuid4())
    policy_id = str(uuid.uuid4())

    async def mock_handler(request):
        url_str = str(request.url)
        method = request.method

        if "/api/v1/auth/login" in url_str:
            # Simular 401 para disparar register-org
            return Response(401, json={"detail": "Usuario no encontrado"})

        elif "/api/v1/auth/register-org" in url_str:
            return Response(
                201,
                json={
                    "access_token": "mock_jwt_token_123",
                    "api_key": "ag_live_key_new_ceo_12345678",
                    "user": {"id": user_id, "organization_id": org_id},
                    "organization": {"id": org_id, "name": "Acme Corp"},
                },
            )

        elif "/api/v1/demo/reset" in url_str:
            return Response(200, json={"status": "success", "access_token": "mock_jwt_token_reset"})

        elif "/api/v1/auth/me" in url_str:
            return Response(200, json={"id": user_id, "organization_id": org_id})

        elif "/api/v1/agents" in url_str and method == "GET":
            return Response(200, json=[])

        elif "/api/v1/agents" in url_str and method == "POST":
            return Response(201, json={"id": agent_id, "name": "Consultante BI", "status": "ACTIVE"})

        elif f"/api/v1/tools/{tool_id}" in url_str and method == "GET":
            return Response(200, json={"id": tool_id, "actions": []})

        elif "/api/v1/tools" in url_str and method == "GET":
            return Response(200, json=[])

        elif "/api/v1/tools" in url_str and method == "POST":
            return Response(201, json={"id": tool_id, "name": "BI & Ventas ACME"})

        elif "/api/v1/tool-actions" in url_str and method == "POST":
            req_json = json.loads(request.content)
            return Response(201, json={"id": str(uuid.uuid4()), "action_name": req_json["action_name"]})

        elif f"/api/v1/policies/{policy_id}" in url_str and method == "GET":
            return Response(200, json={"id": policy_id, "rules": []})

        elif "/api/v1/policies" in url_str and method == "GET":
            return Response(200, json=[])

        elif "/api/v1/policies" in url_str and method == "POST":
            return Response(201, json={"id": policy_id, "name": "Gobernanza Consultante BI (Solo Lectura)"})

        elif "/api/v1/policy-rules" in url_str and method == "POST":
            return Response(201, json={"id": str(uuid.uuid4()), "status": "CREATED"})

        elif "/tools" in url_str and method in ("GET", "POST"):
            return Response(201 if method == "POST" else 200, json=[])

        elif "/api/v1/gateway/context" in url_str:
            return Response(200, json={"organization_id": org_id})

        return Response(200, json={})

    original_client = httpx.AsyncClient
    transport = httpx.MockTransport(mock_handler)
    with patch("agent.onboarding.httpx.AsyncClient", side_effect=lambda *args, **kwargs: original_client(transport=transport)):
        result = await bootstrap_acme_in_agentguard(
            agentguard_url="http://mock-agentguard:8000",
            acme_public_url="http://mock-acme:9000",
            force_reset=True,
        )

    assert result["status"] == "success"
    assert result["organization_name"] == "Acme Corp"
    assert "ag_live_" in result["api_key_masked"]
