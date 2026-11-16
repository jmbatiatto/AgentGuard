"""Pruebas unitarias para el cliente de agente Gemini y el despachador de AgentGuard."""

import json
import sys
import uuid
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

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


@pytest.mark.asyncio
async def test_execute_in_direct_mode_tampering(temp_db: AcmeDatabase):
    """Prueba la ejecución directa (modo vulnerable) alterando el precio de un producto."""
    client = GeminiAgentClient(db=temp_db)

    # 1. Ejecutar alteración de precio directa
    res = await client.execute_in_direct_mode(
        action_name="update_price",
        parameters={"product_id": "ACME-ROCKET-01", "new_price": 9.99},
    )
    assert res["status"] == "success"
    assert res["direct_execution"] is True
    assert res["result"]["new_price"] == 9.99
    assert res["result"]["is_tampered"] is True

    # 2. Verificar que SQLite realmente sufrió la alteración
    state = temp_db.get_state()
    rocket = next(p for p in state["products"] if p["sku"] == "ACME-ROCKET-01")
    assert rocket["price"] == 9.99


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
        ],
    }

    assert resolve_tool_id_for_action(ctx, "update_price") == catalog_tool_id
    assert resolve_tool_id_for_action(ctx, "database_drop") == db_tool_id


@pytest.mark.asyncio
async def test_run_scenario_gemini_llm_two_turns_protected(temp_db: AcmeDatabase):
    """Valida flujo real de 2 turnos Gemini functionCall -> AgentGuard DENY -> functionResponse sin contaminar args."""
    org_id = str(uuid.uuid4())
    agent_id = str(uuid.uuid4())
    catalog_tool_id = str(uuid.uuid4())

    fake_context = {
        "organization_id": org_id,
        "agents": [{"id": agent_id, "name": "Agente de Ventas"}],
        "tools": [
            {
                "id": catalog_tool_id,
                "name": "Catálogo de Precios",
                "actions": [{"id": str(uuid.uuid4()), "action_name": "update_price", "risk_level": "HIGH"}],
            }
        ],
    }

    resp_gemini_1 = MagicMock(spec=Response)
    resp_gemini_1.status_code = 200
    resp_gemini_1.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "functionCall": {
                                "name": "update_price",
                                "args": {"product_id": "ACME-ROCKET-01", "new_price": 1.0},
                            }
                        }
                    ]
                }
            }
        ]
    }

    resp_agentguard_deny = MagicMock(spec=Response)
    resp_agentguard_deny.status_code = 403
    resp_agentguard_deny.json.return_value = {
        "execution_id": str(uuid.uuid4()),
        "decision": "DENY",
        "status": "REJECTED",
        "error_message": "Capacidad no asignada en AgentTool",
        "latency_ms": 9.4,
    }

    resp_gemini_2 = MagicMock(spec=Response)
    resp_gemini_2.status_code = 200
    resp_gemini_2.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {"text": "AgentGuard bloqueó la modificación de precio a $1 USD."}
                    ]
                }
            }
        ]
    }

    resp_ctx = MagicMock(spec=Response)
    resp_ctx.status_code = 200
    resp_ctx.json.return_value = fake_context

    client = GeminiAgentClient(
        gemini_api_key="fake_gemini_key",
        agentguard_url="http://agentguard-test:8000",
        agentguard_api_key="ag_live_test_key",
        db=temp_db,
    )

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=resp_ctx), patch(
        "httpx.AsyncClient.post",
        new_callable=AsyncMock,
        side_effect=[resp_gemini_1, resp_agentguard_deny, resp_gemini_2],
    ) as mock_post:
        trace = await client.run_scenario(
            preset_id="legit_quote",
            prompt="Baja el precio del Cohete a 1 dólar",
            mode="protected",
            use_llm=True,
        )

    assert trace["use_llm"] is True
    assert trace["llm_tool_calls"][0]["action_name"] == "update_price"
    # No debe contaminarse con customer/amount del preset legit_quote
    assert trace["llm_tool_calls"][0]["parameters"] == {"product_id": "ACME-ROCKET-01", "new_price": 1.0}
    assert trace["gateway_verdicts"][0]["decision"] == "DENY"
    assert "bloqueó" in trace["final_answer"].lower()
    # Verificar que se envió el request de AgentGuard con el tool_id real de Catálogo de Precios
    ag_payload = mock_post.call_args_list[1].kwargs["json"]
    assert ag_payload["tool_id"] == catalog_tool_id
    assert ag_payload["action_name"] == "update_price"
