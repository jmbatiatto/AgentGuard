"""Suite de Pruebas Automatizadas para la Fase 5:
- Switcher Multitenant (INC-17)
- Dispatcher y Test de Webhooks SIEM (INC-18)
- Simulación y Sandbox DB Real para Agentes (INC-19)
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.agent import Agent, AgentTool
from app.models.enums import (
    AgentStatus,
    PolicyDecision,
    RiskLevel,
    UserRole,
)
from app.models.organization import Organization
from app.models.tool import Tool, ToolAction
from app.models.user import User


@pytest.fixture(autouse=True)
def cleanup_overrides():
    """Limpia los dependency_overrides antes y después de cada test."""
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_list_organizations_success():
    """1. GET /api/v1/organizations retorna el listado de organizaciones registradas (INC-17)."""
    org1 = Organization(id=uuid.uuid4(), name="Acme Corp", created_at=datetime.now(timezone.utc))
    org2 = Organization(id=uuid.uuid4(), name="Stark Industries", created_at=datetime.now(timezone.utc))

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [org1, org2]
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/organizations")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Acme Corp"
    assert data[1]["name"] == "Stark Industries"


@pytest.mark.asyncio
async def test_siem_webhook_settings_update():
    """2. PATCH /api/v1/organizations/{id}/settings actualiza configuración de Webhook SIEM (INC-18)."""
    org_id = uuid.uuid4()
    admin_user = User(
        id=uuid.uuid4(),
        organization_id=org_id,
        email="admin@acme.corp",
        role=UserRole.ADMIN,
    )
    org = Organization(
        id=org_id,
        name="Acme Corp",
        settings={
            "fail_closed": True,
            "mask_sensitive": True,
            "max_autonomous_amount": 5000.0,
            "retention_days": 90,
        },
    )

    mock_db = AsyncMock()

    async def mock_execute(stmt):
        stmt_str = str(stmt)
        result = MagicMock()
        if "FROM users" in stmt_str:
            result.scalar_one_or_none.return_value = admin_user
        elif "FROM organizations" in stmt_str:
            result.scalar_one_or_none.return_value = org
        else:
            result.scalar_one_or_none.return_value = None
        return result

    mock_db.execute = AsyncMock(side_effect=mock_execute)
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.patch(
            f"/api/v1/organizations/{org_id}/settings",
            headers={"X-User-Id": str(admin_user.id)},
            json={
                "siem_webhook_url": "https://siem.internal/alerts",
                "siem_webhook_enabled": True,
                "siem_webhook_secret": "SuperSecretHmacKey2026",
                "siem_webhook_events": ["ALERT_CRITICAL", "POLICY_VIOLATION"],
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["siem_webhook_url"] == "https://siem.internal/alerts"
    assert data["siem_webhook_enabled"] is True
    assert data["siem_webhook_secret"] == "SuperSecretHmacKey2026"
    assert "ALERT_CRITICAL" in data["siem_webhook_events"]


@pytest.mark.asyncio
async def test_siem_webhook_test_ping_success():
    """3. POST /api/v1/organizations/{id}/settings/webhooks/test despacha ping con éxito (INC-18)."""
    org_id = uuid.uuid4()
    admin_user = User(
        id=uuid.uuid4(),
        organization_id=org_id,
        email="admin@acme.corp",
        role=UserRole.ADMIN,
    )
    org = Organization(
        id=org_id,
        name="Acme Corp",
        settings={
            "siem_webhook_url": "https://siem.internal/hooks",
            "siem_webhook_enabled": True,
            "siem_webhook_secret": "KeySecret123",
        },
    )

    mock_db = AsyncMock()

    async def mock_execute(stmt):
        stmt_str = str(stmt)
        result = MagicMock()
        if "FROM users" in stmt_str:
            result.scalar_one_or_none.return_value = admin_user
        elif "FROM organizations" in stmt_str:
            result.scalar_one_or_none.return_value = org
        else:
            result.scalar_one_or_none.return_value = None
        return result

    mock_db.execute = AsyncMock(side_effect=mock_execute)

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            f"/api/v1/organizations/{org_id}/settings/webhooks/test",
            headers={"X-User-Id": str(admin_user.id)},
            json={
                "webhook_url": "https://siem.internal/hooks",
                "secret": "KeySecret123",
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "entregado" in data["message"].lower() or "exitosamente" in data["message"].lower()
    assert data["target_url"] == "https://siem.internal/hooks"


@pytest.mark.asyncio
async def test_siem_webhook_test_ping_missing_url():
    """4. POST /api/v1/organizations/{id}/settings/webhooks/test falla si no hay URL configurada."""
    org_id = uuid.uuid4()
    admin_user = User(
        id=uuid.uuid4(),
        organization_id=org_id,
        email="admin@acme.corp",
        role=UserRole.ADMIN,
    )
    org = Organization(
        id=org_id,
        name="Acme Corp",
        settings={},
    )

    mock_db = AsyncMock()

    async def mock_execute(stmt):
        stmt_str = str(stmt)
        result = MagicMock()
        if "FROM users" in stmt_str:
            result.scalar_one_or_none.return_value = admin_user
        elif "FROM organizations" in stmt_str:
            result.scalar_one_or_none.return_value = org
        else:
            result.scalar_one_or_none.return_value = None
        return result

    mock_db.execute = AsyncMock(side_effect=mock_execute)

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            f"/api/v1/organizations/{org_id}/settings/webhooks/test",
            headers={"X-User-Id": str(admin_user.id)},
            json={},
        )

    assert response.status_code == 400
    assert "No se proporcionó una URL de webhook" in response.json()["detail"]


@pytest.mark.asyncio
async def test_gateway_simulate_endpoint():
    """5. POST /api/v1/gateway/simulate evalúa en modo sandbox (dry-run) sin red externa (INC-19)."""
    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()

    agent = Agent(id=agent_id, organization_id=org_id, status=AgentStatus.ACTIVE, name="Sales Agent")
    tool = Tool(id=tool_id, organization_id=org_id, name="CRM Facturación", endpoint_url="https://crm.api.corp")
    action = ToolAction(id=action_id, tool_id=tool_id, action_name="create_quote", risk_level=RiskLevel.LOW)
    agent_tool = AgentTool(id=uuid.uuid4(), agent_id=agent_id, tool_id=tool_id, enabled=True, config={})

    mock_db = AsyncMock()

    async def mock_execute(stmt):
        stmt_str = str(stmt)
        result = MagicMock()
        if "FROM agents" in stmt_str:
            result.scalar_one_or_none.return_value = agent
        elif "FROM tools" in stmt_str:
            result.scalar_one_or_none.return_value = tool
        elif "FROM tool_actions" in stmt_str:
            result.scalar_one_or_none.return_value = action
        elif "FROM agent_tools" in stmt_str:
            result.scalar_one_or_none.return_value = agent_tool
        elif "FROM organizations" in stmt_str:
            result.scalar_one_or_none.return_value = Organization(id=org_id, name="Acme")
        else:
            result.scalar_one_or_none.return_value = None
            result.scalars.return_value.all.return_value = []
        return result

    mock_db.execute = AsyncMock(side_effect=mock_execute)
    mock_db.add = MagicMock()
    mock_db.commit = AsyncMock()

    app.dependency_overrides[get_db] = lambda: mock_db

    # Mock del PDP Engine para devolver ALLOW
    from app.services.pdp_engine import PDPDecisionResult, pdp_engine
    with patch.object(
        pdp_engine,
        "evaluate",
        new=AsyncMock(return_value=PDPDecisionResult(
            decision=PolicyDecision.ALLOW,
            evaluated_policy_rule_id=None,
            reason="Allow sales quote simulation under 10k",
        )),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/gateway/simulate",
                json={
                    "organization_id": str(org_id),
                    "agent_id": str(agent_id),
                    "tool_id": str(tool_id),
                    "action_name": "create_quote",
                    "parameters": {"amount": 2500, "customer_id": "cus_991"},
                },
            )

    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "ALLOW"
    assert data["status"] == "EXECUTED"
    assert data["is_simulation"] is True
    assert data["result"]["simulated"] is True
    assert "sandbox" in data["result"]["message"].lower()
    assert data["simulation_explanation"] is not None
    assert mock_db.commit.called
