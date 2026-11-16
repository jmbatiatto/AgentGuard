"""Pruebas unitarias para el endpoint de auto-discovery Data Plane GET /api/v1/gateway/context."""

import uuid
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.agent import Agent
from app.models.enums import AgentStatus, RiskLevel
from app.models.organization import Organization
from app.models.tool import Tool, ToolAction
from tests.conftest import make_api_key_pair


@pytest.fixture(autouse=True)
def cleanup_overrides():
    """Limpia los dependency_overrides de FastAPI antes y después de cada prueba."""
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_gateway_context_missing_header_returns_401():
    """Valida que una llamada sin cabecera X-AgentGuard-Key sea rechazada con 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/gateway/context")
        assert resp.status_code == 401
        data = resp.json()
        assert "X-AgentGuard-Key" in data["detail"]


@pytest.mark.asyncio
async def test_gateway_context_invalid_api_key_returns_401():
    """Valida que una API Key inexistente o revocada sea rechazada con 401."""
    mock_db = AsyncMock()
    # Mock verify_api_key returning None (key not found)
    res_key = MagicMock()
    res_key.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = res_key
    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/v1/gateway/context",
            headers={"X-AgentGuard-Key": "ag_live_invalidkey12345678901234567890"},
        )
        assert resp.status_code == 401
        data = resp.json()
        assert "inválida" in data["detail"]


@pytest.mark.asyncio
async def test_gateway_context_success_isolated_by_org():
    """Valida que un agente descubra solo los agentes y herramientas de su propia organización (200 OK)."""
    org_a_id = uuid.uuid4()
    org_a = Organization(id=org_a_id, name="Acme Corp")

    agent_1 = Agent(
        id=uuid.uuid4(),
        organization_id=org_a_id,
        name="Agente de Ventas",
        status=AgentStatus.ACTIVE,
    )
    agent_2 = Agent(
        id=uuid.uuid4(),
        organization_id=org_a_id,
        name="Finance Copilot",
        status=AgentStatus.ACTIVE,
    )

    tool_crm = Tool(
        id=uuid.uuid4(),
        organization_id=org_a_id,
        name="CRM & Facturación",
        protocol="REST",
        endpoint_url="https://crm.api.corp",
    )
    act_quote = ToolAction(
        id=uuid.uuid4(),
        tool_id=tool_crm.id,
        action_name="create_quote",
        risk_level=RiskLevel.LOW,
    )
    act_export = ToolAction(
        id=uuid.uuid4(),
        tool_id=tool_crm.id,
        action_name="export_customers",
        risk_level=RiskLevel.CRITICAL,
    )
    tool_crm.actions = [act_quote, act_export]

    tool_stripe = Tool(
        id=uuid.uuid4(),
        organization_id=org_a_id,
        name="Stripe Payments",
        protocol="REST",
        endpoint_url="https://stripe.api.corp",
    )
    act_refund = ToolAction(
        id=uuid.uuid4(),
        tool_id=tool_stripe.id,
        action_name="refund",
        risk_level=RiskLevel.HIGH,
    )
    tool_stripe.actions = [act_refund]

    raw_key, _, res_key = make_api_key_pair(org_a_id)

    res_org = MagicMock()
    res_org.scalar_one_or_none.return_value = org_a

    res_agents = MagicMock()
    res_agents.scalars.return_value.all.return_value = [agent_1, agent_2]

    res_tools = MagicMock()
    res_tools.scalars.return_value.all.return_value = [tool_crm, tool_stripe]

    mock_db = AsyncMock()
    mock_db.execute.side_effect = [res_key, res_org, res_agents, res_tools]
    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/v1/gateway/context",
            headers={"X-AgentGuard-Key": raw_key},
        )
        assert resp.status_code == 200
        data = resp.json()

        assert data["organization_id"] == str(org_a_id)
        assert data["organization_name"] == "Acme Corp"

        # Validar agentes retornados
        agent_names = {a["name"] for a in data["agents"]}
        assert agent_names == {"Agente de Ventas", "Finance Copilot"}
        assert all(a["status"] == "ACTIVE" for a in data["agents"])

        # Validar herramientas y sus acciones atómicas
        tool_names = {t["name"] for t in data["tools"]}
        assert tool_names == {"CRM & Facturación", "Stripe Payments"}
        crm_data = next(t for t in data["tools"] if t["name"] == "CRM & Facturación")
        assert len(crm_data["actions"]) == 2
        crm_action_names = {a["action_name"] for a in crm_data["actions"]}
        assert crm_action_names == {"create_quote", "export_customers"}

        stripe_data = next(t for t in data["tools"] if t["name"] == "Stripe Payments")
        assert len(stripe_data["actions"]) == 1
        assert stripe_data["actions"][0]["action_name"] == "refund"
        assert stripe_data["actions"][0]["risk_level"] == "HIGH"

        # Blindaje Anti-Data Leaks: validar que nunca se expongan usuarios, políticas ni auditoría
        assert "users" not in data
        assert "policies" not in data
        assert "audit_events" not in data
        assert "rules" not in data


@pytest.mark.asyncio
async def test_gateway_context_org_not_found_returns_404():
    """Valida 404 si la organización vinculada a la API Key no existe."""
    org_id = uuid.uuid4()
    raw_key, _, res_key = make_api_key_pair(org_id)

    res_org = MagicMock()
    res_org.scalar_one_or_none.return_value = None

    mock_db = AsyncMock()
    mock_db.execute.side_effect = [res_key, res_org]
    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/v1/gateway/context",
            headers={"X-AgentGuard-Key": raw_key},
        )
        assert resp.status_code == 404
        data = resp.json()
        assert "no encontrada" in data["detail"]
