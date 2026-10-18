"""Pruebas automatizadas para el Service y API REST de Reglas de Política (PolicyRules)."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.agent import Agent
from app.models.enums import RiskLevel, RuleEffect
from app.models.policy import Policy, PolicyRule
from app.models.tool import Tool, ToolAction
from app.schemas.policy_rule import PolicyRuleCreate
from app.services.agent_service import agent_service
from app.services.policy_rule_service import policy_rule_service
from app.services.policy_service import policy_service
from app.services.tool_action_service import tool_action_service
from app.services.tool_service import tool_service


# ==============================================================================
# Pruebas de la Capa de Servicio (PolicyRuleService)
# ==============================================================================

@pytest.mark.asyncio
async def test_policy_rule_service_create():
    """Valida creación y persistencia de una regla determinista con principio Fail-Closed."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    policy_id = uuid.uuid4()
    action_id = uuid.uuid4()

    rule_in = PolicyRuleCreate(
        policy_id=policy_id,
        tool_action_id=action_id,
        priority=150,
        effect=RuleEffect.DENY,
        conditions={"max_amount": 1000},
    )

    async def mock_refresh(instance):
        instance.id = uuid.uuid4()
        instance.created_at = datetime.now(timezone.utc)

    mock_db.refresh.side_effect = mock_refresh

    result = await policy_rule_service.create(db=mock_db, rule_in=rule_in)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once()
    assert result.priority == 150
    assert result.effect == RuleEffect.DENY
    assert result.conditions["max_amount"] == 1000


@pytest.mark.asyncio
async def test_policy_rule_service_get_by_id():
    """Valida la búsqueda de regla por UUID."""
    mock_db = AsyncMock()
    rule_id = uuid.uuid4()
    mock_rule = PolicyRule(
        id=rule_id,
        policy_id=uuid.uuid4(),
        tool_action_id=uuid.uuid4(),
        priority=100,
        effect=RuleEffect.ALLOW,
        conditions={},
        created_at=datetime.now(timezone.utc),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_rule
    mock_db.execute.return_value = mock_result

    result = await policy_rule_service.get_by_id(db=mock_db, rule_id=rule_id)

    mock_db.execute.assert_awaited_once()
    assert result is not None
    assert result.id == rule_id
    assert result.effect == RuleEffect.ALLOW


@pytest.mark.asyncio
async def test_policy_rule_service_list_rules():
    """Valida listado de reglas ordenadas por prioridad con filtro por política."""
    mock_db = AsyncMock()
    policy_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    mock_rules = [
        PolicyRule(
            id=uuid.uuid4(),
            policy_id=policy_id,
            tool_action_id=uuid.uuid4(),
            priority=200 - i * 10,
            effect=RuleEffect.DENY,
            conditions={},
            created_at=now,
        )
        for i in range(2)
    ]

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_rules
    mock_db.execute.return_value = mock_result

    result = await policy_rule_service.list_rules(db=mock_db, policy_id=policy_id, skip=0, limit=10)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 2
    assert result[0].priority == 200


# ==============================================================================
# Pruebas de Endpoints HTTP (/api/v1/policy-rules) — Ruta Separada
# ==============================================================================

@pytest.mark.asyncio
async def test_api_create_policy_rule_success():
    """Valida registro exitoso de una regla de política (201 Created)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    policy_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    rule_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    fake_policy = Policy(id=policy_id, organization_id=org_id, name="Security Policy", priority=100)
    fake_tool = Tool(id=tool_id, organization_id=org_id, name="Billing API", endpoint_url="https://billing")
    fake_action = ToolAction(id=action_id, tool_id=tool_id, action_name="refund", risk_level=RiskLevel.HIGH)
    fake_agent = Agent(id=agent_id, organization_id=org_id, name="BillingBot")
    fake_rule = PolicyRule(
        id=rule_id,
        policy_id=policy_id,
        tool_action_id=action_id,
        target_agent_id=agent_id,
        priority=100,
        effect=RuleEffect.REQUIRE_APPROVAL,
        conditions={"max_amount": 500},
        created_at=now,
    )

    with patch.object(policy_service, "get_by_id", new_callable=AsyncMock) as mock_get_policy, \
         patch.object(tool_action_service, "get_by_id", new_callable=AsyncMock) as mock_get_action, \
         patch.object(tool_service, "get_by_id", new_callable=AsyncMock) as mock_get_tool, \
         patch.object(agent_service, "get_by_id", new_callable=AsyncMock) as mock_get_agent, \
         patch.object(policy_rule_service, "create", new_callable=AsyncMock) as mock_create_rule:

        mock_get_policy.return_value = fake_policy
        mock_get_action.return_value = fake_action
        mock_get_tool.return_value = fake_tool
        mock_get_agent.return_value = fake_agent
        mock_create_rule.return_value = fake_rule

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/policy-rules",
                json={
                    "policy_id": str(policy_id),
                    "tool_action_id": str(action_id),
                    "target_agent_id": str(agent_id),
                    "priority": 100,
                    "effect": "REQUIRE_APPROVAL",
                    "conditions": {"max_amount": 500},
                },
            )

            assert response.status_code == 201
            data = response.json()
            assert data["id"] == str(rule_id)
            assert data["effect"] == "REQUIRE_APPROVAL"
            assert data["conditions"]["max_amount"] == 500

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_create_policy_rule_policy_not_found():
    """Valida que si la política no existe devuelva 404."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    missing_policy_id = uuid.uuid4()
    action_id = uuid.uuid4()

    with patch.object(policy_service, "get_by_id", new_callable=AsyncMock) as mock_get_policy:
        mock_get_policy.return_value = None

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/policy-rules",
                json={
                    "policy_id": str(missing_policy_id),
                    "tool_action_id": str(action_id),
                },
            )

            assert response.status_code == 404
            assert "no encontrada" in response.json()["detail"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_create_policy_rule_target_agent_different_org():
    """Valida que si el agente pertenece a otra organización retorne 400 Bad Request."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    other_org_id = uuid.uuid4()
    policy_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()
    alien_agent_id = uuid.uuid4()

    fake_policy = Policy(id=policy_id, organization_id=org_id, name="Security Policy")
    fake_tool = Tool(id=tool_id, organization_id=org_id, name="Tool", endpoint_url="https://tool")
    fake_action = ToolAction(id=action_id, tool_id=tool_id, action_name="refund")
    fake_alien_agent = Agent(id=alien_agent_id, organization_id=other_org_id, name="AlienBot")

    with patch.object(policy_service, "get_by_id", new_callable=AsyncMock) as mock_get_policy, \
         patch.object(tool_action_service, "get_by_id", new_callable=AsyncMock) as mock_get_action, \
         patch.object(tool_service, "get_by_id", new_callable=AsyncMock) as mock_get_tool, \
         patch.object(agent_service, "get_by_id", new_callable=AsyncMock) as mock_get_agent:

        mock_get_policy.return_value = fake_policy
        mock_get_action.return_value = fake_action
        mock_get_tool.return_value = fake_tool
        mock_get_agent.return_value = fake_alien_agent

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/policy-rules",
                json={
                    "policy_id": str(policy_id),
                    "tool_action_id": str(action_id),
                    "target_agent_id": str(alien_agent_id),
                },
            )

            assert response.status_code == 400
            assert "no pertenece a la misma organización de la política" in response.json()["detail"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_list_policy_rules():
    """Valida listado de reglas filtradas por política."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    policy_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    fake_rules = [
        PolicyRule(
            id=uuid.uuid4(),
            policy_id=policy_id,
            tool_action_id=uuid.uuid4(),
            priority=100 + i,
            effect=RuleEffect.DENY,
            conditions={},
            created_at=now,
        )
        for i in range(2)
    ]

    with patch.object(policy_rule_service, "list_rules", new_callable=AsyncMock) as mock_list:
        mock_list.return_value = fake_rules

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/policy-rules?policy_id={policy_id}&skip=0&limit=10")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["effect"] == "DENY"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_policy_rule_found():
    """Valida consulta de regla existente por UUID."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    rule_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    fake_rule = PolicyRule(
        id=rule_id,
        policy_id=uuid.uuid4(),
        tool_action_id=uuid.uuid4(),
        priority=180,
        effect=RuleEffect.ALLOW,
        conditions={"role": "ADMIN"},
        created_at=now,
    )

    with patch.object(policy_rule_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = fake_rule

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/policy-rules/{rule_id}")

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == str(rule_id)
            assert data["effect"] == "ALLOW"
            assert data["conditions"]["role"] == "ADMIN"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_policy_rule_not_found():
    """Valida consulta de regla inexistente (404)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    with patch.object(policy_rule_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None

        random_id = uuid.uuid4()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/policy-rules/{random_id}")

            assert response.status_code == 404
            assert "no encontrada" in response.json()["detail"]

    app.dependency_overrides.clear()
