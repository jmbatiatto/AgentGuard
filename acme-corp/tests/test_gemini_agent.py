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
from server.app import create_app, ensure_acme_onboarded_if_needed
from server.config import settings
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
    """Prueba el onboarding completo y verifica que tras /demo/reset use los UUIDs y API Key regenerados."""
    pre_reset_org_id = str(uuid.uuid4())
    pre_reset_user_id = str(uuid.uuid4())
    post_reset_org_id = str(uuid.uuid4())
    post_reset_user_id = str(uuid.uuid4())
    tool_id = str(uuid.uuid4())
    agent_id = str(uuid.uuid4())
    policy_id = str(uuid.uuid4())
    captured_agent_payload = {}

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
                    "api_key": "ag_live_key_pre_reset_deleted_9999",
                    "user": {"id": pre_reset_user_id, "organization_id": pre_reset_org_id},
                    "organization": {"id": pre_reset_org_id, "name": "Acme Corp"},
                },
            )

        elif "/api/v1/demo/reset" in url_str:
            return Response(
                200,
                json={
                    "status": "success",
                    "access_token": "mock_jwt_token_reset",
                    "organization_id": post_reset_org_id,
                    "user": {"id": post_reset_user_id, "organization_id": post_reset_org_id},
                },
            )

        elif "/api/v1/auth/me" in url_str:
            return Response(200, json={"id": post_reset_user_id, "organization_id": post_reset_org_id})

        elif "/api/v1/agents" in url_str and method == "GET":
            return Response(200, json=[])

        elif "/api/v1/agents" in url_str and method == "POST":
            captured_agent_payload.update(json.loads(request.content))
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

        elif "/api/v1/api-keys" in url_str and method == "POST":
            req_json = json.loads(request.content)
            assert req_json["organization_id"] == post_reset_org_id
            return Response(201, json={"api_key": "ag_live_key_post_reset_5678"})

        elif "/tools" in url_str and method in ("GET", "POST"):
            return Response(201 if method == "POST" else 200, json=[])

        elif "/api/v1/gateway/context" in url_str:
            return Response(401, json={"detail": "Clave obsoleta"})

        return Response(200, json={})

    original_client = httpx.AsyncClient
    original_key = settings.AGENTGUARD_API_KEY
    transport = httpx.MockTransport(mock_handler)
    persist_mock = MagicMock()
    try:
        with (
            patch(
                "agent.onboarding.httpx.AsyncClient",
                side_effect=lambda *args, **kwargs: original_client(transport=transport),
            ),
            patch("agent.onboarding.persist_api_key_to_env", persist_mock),
        ):
            result = await bootstrap_acme_in_agentguard(
                agentguard_url="http://mock-agentguard:8000",
                acme_public_url="http://mock-acme:9000",
                force_reset=True,
            )
    finally:
        settings.AGENTGUARD_API_KEY = original_key

    assert captured_agent_payload["owner_user_id"] == post_reset_user_id
    assert captured_agent_payload["organization_id"] == post_reset_org_id
    persist_mock.assert_called_once_with("ag_live_key_post_reset_5678")
    assert result["status"] == "success"
    assert result["organization_id"] == post_reset_org_id
    assert result["organization_name"] == "Acme Corp"
    assert result["api_key_masked"] == "ag_live_key_...5678"


@pytest.mark.asyncio
async def test_ensure_acme_onboarded_relinks_on_stale_api_key():
    """Verifica que si .env conserva una clave obsoleta (HTTP 401), ACME re-vincula al CEO automáticamente."""
    original_key = settings.AGENTGUARD_API_KEY
    settings.AGENTGUARD_API_KEY = "ag_live_stale_key_from_wiped_docker_db"

    def mock_handler(request: httpx.Request) -> Response:
        url_str = str(request.url)
        if url_str.endswith("/health"):
            return Response(200, json={"status": "healthy"})
        if "/api/v1/gateway/context" in url_str:
            return Response(401, json={"detail": "API Key inválida o expirada"})
        return Response(404, json={})

    original_client = httpx.AsyncClient
    transport = httpx.MockTransport(mock_handler)
    bootstrap_mock = AsyncMock(
        return_value={
            "status": "success",
            "organization_id": str(uuid.uuid4()),
            "api_key_masked": "ag_live_new_...1234",
        }
    )

    try:
        with (
            patch(
                "server.app.httpx.AsyncClient",
                side_effect=lambda *args, **kwargs: original_client(transport=transport),
            ),
            patch("server.app.bootstrap_acme_in_agentguard", bootstrap_mock),
        ):
            ran = await ensure_acme_onboarded_if_needed(
                agentguard_url="http://mock-agentguard:8000",
                acme_public_url="http://mock-acme:9000",
            )

        assert ran is True
        bootstrap_mock.assert_awaited_once_with(
            agentguard_url="http://mock-agentguard:8000",
            acme_public_url="http://mock-acme:9000",
            force_reset=False,
        )
        assert getattr(settings, "AGENTGUARD_API_KEY") is None
    finally:
        settings.AGENTGUARD_API_KEY = original_key


@pytest.mark.asyncio
async def test_ensure_acme_onboarded_skips_when_key_valid_and_consultante_present():
    """Verifica que no se re-ejecuta el onboarding si la API Key actual responde 200 con Consultante BI."""
    original_key = settings.AGENTGUARD_API_KEY
    settings.AGENTGUARD_API_KEY = "ag_live_valid_existing_key"

    def mock_handler(request: httpx.Request) -> Response:
        url_str = str(request.url)
        if url_str.endswith("/health"):
            return Response(200, json={"status": "healthy"})
        if "/api/v1/gateway/context" in url_str:
            return Response(
                200,
                json={
                    "organization_id": str(uuid.uuid4()),
                    "agents": [{"id": str(uuid.uuid4()), "name": "Consultante BI"}],
                },
            )
        return Response(404, json={})

    original_client = httpx.AsyncClient
    transport = httpx.MockTransport(mock_handler)
    bootstrap_mock = AsyncMock()

    try:
        with (
            patch(
                "server.app.httpx.AsyncClient",
                side_effect=lambda *args, **kwargs: original_client(transport=transport),
            ),
            patch("server.app.bootstrap_acme_in_agentguard", bootstrap_mock),
        ):
            ran = await ensure_acme_onboarded_if_needed(
                agentguard_url="http://mock-agentguard:8000",
                acme_public_url="http://mock-acme:9000",
            )

        assert ran is False
        bootstrap_mock.assert_not_awaited()
    finally:
        settings.AGENTGUARD_API_KEY = original_key


@pytest.mark.asyncio
async def test_run_scenario_gemini3_fallback_and_thought_signature(temp_db: AcmeDatabase):
    """Verifica fallback 404 a gemini-3.8-flash y preservación de thoughtSignature en Turno 2."""
    captured_turn2_payload = {}
    called_models = []

    def mock_handler(request: httpx.Request) -> Response:
        url_str = str(request.url)
        body = json.loads(request.content)
        if "models/gemini-2.5-flash:generateContent" in url_str:
            called_models.append("gemini-2.5-flash")
            return Response(404, json={"error": {"code": 404, "status": "NOT_FOUND"}})
        if "models/gemini-3.8-flash:generateContent" in url_str:
            called_models.append("gemini-3.8-flash")
            if len(body["contents"]) == 1:
                return Response(
                    200,
                    json={
                        "candidates": [
                            {
                                "content": {
                                    "role": "model",
                                    "parts": [
                                        {"thought": True, "text": "Razonamiento interno"},
                                        {
                                            "functionCall": {
                                                "name": "query_sales",
                                                "args": {"min_amount": 1000.0, "period": "last_month"},
                                            },
                                            "thoughtSignature": "sig_gemini3_opaque_xyz",
                                        },
                                    ],
                                }
                            }
                        ]
                    },
                )
            captured_turn2_payload.update(body)
            return Response(
                200,
                json={
                    "candidates": [
                        {
                            "content": {
                                "role": "model",
                                "parts": [
                                    {"thought": True, "text": "Pensando síntesis"},
                                    {"text": "Se encontraron 4 ventas mayores a $1,000."},
                                ],
                            }
                        }
                    ]
                },
            )
        return Response(500, json={})

    original_client = httpx.AsyncClient
    transport = httpx.MockTransport(mock_handler)
    client = GeminiAgentClient(
        gemini_api_key="test-gemini-key",
        gemini_model="gemini-2.5-flash",
        db=temp_db,
    )

    with patch(
        "agent.gemini_client.httpx.AsyncClient",
        side_effect=lambda *args, **kwargs: original_client(transport=transport),
    ):
        trace = await client.run_scenario(
            prompt="Dame las ventas mayores a 1000 del mes pasado",
            mode="direct",
            use_llm=True,
        )

    assert called_models == ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.8-flash"]
    assert trace["model_used"] == "gemini-3.8-flash"
    assert trace["final_answer"] == "Se encontraron 4 ventas mayores a $1,000."
    model_parts_turn2 = captured_turn2_payload["contents"][1]["parts"]
    assert any(p.get("thoughtSignature") == "sig_gemini3_opaque_xyz" for p in model_parts_turn2)
    assert captured_turn2_payload["contents"][2]["role"] == "user"
    assert captured_turn2_payload["contents"][2]["parts"][0]["functionResponse"]["name"] == "query_sales"
    sys_inst = captured_turn2_payload["systemInstruction"]["parts"][0]["text"]
    assert "Tabla de Resultados" in sys_inst
    assert "resumen ejecutivo breve" in sys_inst


@pytest.mark.asyncio
async def test_run_scenario_gemini_turn2_parallel_calls_and_http_400_fallback(temp_db: AcmeDatabase):
    """Verifica que Turno 2 use role='user', empareje llamadas paralelas y no oculte el motivo de AgentGuard ante HTTP 400."""
    org_id = str(uuid.uuid4())
    bi_agent_id = str(uuid.uuid4())
    bi_tool_id = str(uuid.uuid4())
    captured_turn2_payload = {}

    def mock_handler(request: httpx.Request) -> Response:
        url_str = str(request.url)
        if "/api/v1/gateway/context" in url_str:
            return Response(
                200,
                json={
                    "organization_id": org_id,
                    "agents": [{"id": bi_agent_id, "name": "Consultante BI"}],
                    "tools": [
                        {
                            "id": bi_tool_id,
                            "name": "BI & Ventas ACME",
                            "actions": [{"action_name": "query_sales"}],
                        }
                    ],
                },
            )
        if "/api/v1/gateway/execute" in url_str:
            return Response(
                403,
                json={
                    "decision": "DENY",
                    "status": "REJECTED",
                    "error_message": "El agente se encuentra en estado 'SUSPENDED' y no puede operar",
                    "latency_ms": 5.1,
                },
            )
        if "models/gemini-3.8-flash:generateContent" in url_str:
            body = json.loads(request.content)
            if len(body["contents"]) == 1:
                return Response(
                    200,
                    json={
                        "candidates": [
                            {
                                "content": {
                                    "role": "model",
                                    "parts": [
                                        {
                                            "functionCall": {
                                                "id": "call_1",
                                                "name": "query_sales",
                                                "args": {"min_amount": 1000.0, "period": "last_month"},
                                            },
                                            "thoughtSignature": "sig_parallel_1",
                                        },
                                        {
                                            "functionCall": {
                                                "id": "call_2",
                                                "name": "generate_pie_chart",
                                                "args": {"min_amount": 1000.0, "period": "last_month"},
                                            },
                                        },
                                    ],
                                }
                            }
                        ]
                    },
                )
            captured_turn2_payload.update(body)
            return Response(400, json={"error": {"code": 400, "message": "Invalid argument mock"}})
        return Response(500, json={})

    original_client = httpx.AsyncClient
    transport = httpx.MockTransport(mock_handler)
    client = GeminiAgentClient(
        gemini_api_key="test-gemini-key",
        gemini_model="gemini-3.8-flash",
        agentguard_url="http://agentguard-test:8000",
        agentguard_api_key="ag_live_test_key",
        db=temp_db,
    )

    with patch(
        "agent.gemini_client.httpx.AsyncClient",
        side_effect=lambda *args, **kwargs: original_client(transport=transport),
    ):
        trace = await client.run_scenario(
            prompt="Dame las ventas mayores a $1,000 del mes pasado",
            mode="protected",
            use_llm=True,
        )

    turn2_user_msg = captured_turn2_payload["contents"][2]
    assert turn2_user_msg["role"] == "user"
    assert len(turn2_user_msg["parts"]) == 2
    assert turn2_user_msg["parts"][0]["functionResponse"]["id"] == "call_1"
    assert turn2_user_msg["parts"][0]["functionResponse"]["name"] == "query_sales"
    assert turn2_user_msg["parts"][1]["functionResponse"]["id"] == "call_2"
    assert turn2_user_msg["parts"][1]["functionResponse"]["response"]["status"] == "skipped"

    assert "SUSPENDED" in trace["final_answer"]
    assert "HTTP 400 en la síntesis" not in trace["final_answer"]
    assert any("HTTP 400" in s["title"] for s in trace["steps"])


@pytest.mark.asyncio
async def test_run_scenario_gemini_timeout_fallback_and_nonempty_error(temp_db: AcmeDatabase):
    """Verifica fallback automático ante ReadTimeout('') en gemini-3.8-flash y detalle claro ante timeout total."""
    seen_configs = []

    def mock_handler(request: httpx.Request) -> Response:
        url_str = str(request.url)
        body = json.loads(request.content)
        seen_configs.append(body.get("generationConfig"))
        if "models/gemini-3.8-flash:generateContent" in url_str:
            raise httpx.ReadTimeout("", request=request)
        if "models/gemini-3.5-flash-lite:generateContent" in url_str:
            return Response(
                200,
                json={
                    "candidates": [
                        {
                            "content": {
                                "role": "model",
                                "parts": [{"text": "Respuesta rápida vía fallback lite."}],
                            }
                        }
                    ]
                },
            )
        return Response(500, json={})

    original_client = httpx.AsyncClient
    transport = httpx.MockTransport(mock_handler)
    client = GeminiAgentClient(
        gemini_api_key="test-gemini-key",
        gemini_model="gemini-3.8-flash",
        db=temp_db,
    )

    with patch(
        "agent.gemini_client.httpx.AsyncClient",
        side_effect=lambda *args, **kwargs: original_client(transport=transport),
    ):
        trace = await client.run_scenario(
            prompt="Dame un resumen",
            mode="direct",
            use_llm=True,
        )

    assert trace["model_used"] == "gemini-3.5-flash-lite"
    assert trace["final_answer"] == "Respuesta rápida vía fallback lite."
    assert seen_configs[0] == {"temperature": 0.2, "thinkingConfig": {"thinkingLevel": "low"}}

    # Ahora verificar que si todos expiran con ReadTimeout(""), /api/agent/run devuelve mensaje legible
    app = create_app(db_path=temp_db.db_path)
    with patch("server.app.GeminiAgentClient.run_scenario", side_effect=httpx.ReadTimeout("")):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as api_client:
            resp = await api_client.post(
                "/api/agent/run",
                json={"prompt": "test", "mode": "protected", "use_llm": True, "gemini_api_key": "k"},
            )

    assert resp.status_code == 504
    assert "Tiempo de espera agotado" in resp.json()["detail"]
