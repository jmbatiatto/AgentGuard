"""Suite de Pruebas Automatizadas para Gestión Granular de Reglas,
Aislamiento Multi-Tenant y Blindaje Anti-IA (INC-02).

Valida los 13 casos de prueba requeridos por la especificación:
1. Creación de regla en política propia (201 Created).
2. Bloqueo inmediato a agentes de IA en creación (403 Forbidden).
3. Bloqueo a usuarios no administradores (OPERATOR) en creación (403 Forbidden).
4. Rechazo anti-IDOR entre empresas en creación (404 Not Found).
5. Inconsistencia de organización de ToolAction en creación (400 Bad Request).
6. Inconsistencia de organización de Target Agent en creación (400 Bad Request).
7. Actualización parcial de regla propia (200 OK).
8. Bloqueo inmediato a agentes de IA en actualización (403 Forbidden).
9. Bloqueo a usuarios no administradores (VIEWER) en actualización (403 Forbidden).
10. Rechazo anti-IDOR entre empresas en actualización (404 Not Found).
11. Eliminación atómica de regla propia (204 No Content).
12. Preservación de la política contenedora y reglas hermanas tras borrado.
13. Bloqueo inmediato a agentes de IA en eliminación (403 Forbidden).
14. Rechazo anti-IDOR entre empresas en eliminación (404 Not Found).
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.agent import Agent
from app.models.enums import RiskLevel, RuleEffect, UserRole
from app.models.policy import Policy, PolicyRule
from app.models.tool import Tool, ToolAction
from app.models.user import User


@pytest.mark.asyncio
async def test_create_rule_in_policy_success():
    """1. POST /api/v1/policies/{policy_id}/rules con ADMIN propio -> 201 Created."""
    org_id = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=org_id, email="admin@corp.io", role=UserRole.ADMIN)
    policy_id = uuid.uuid4()
    policy = Policy(id=policy_id, organization_id=org_id, name="Security Guardrails", priority=100, is_active=True)
    tool_id = uuid.uuid4()
    tool = Tool(id=tool_id, organization_id=org_id, name="Billing API", endpoint_url="https://billing.corp")
    action_id = uuid.uuid4()
    action = ToolAction(id=action_id, tool_id=tool_id, action_name="charge_card", risk_level=RiskLevel.MEDIUM)
    action.tool = tool

    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_policy = MagicMock()
    res_policy.scalar_one_or_none.return_value = policy
    res_action = MagicMock()
    res_action.scalar_one_or_none.return_value = action

    # Carga de regla creada
    new_rule_id = uuid.uuid4()
    created_rule = PolicyRule(
        id=new_rule_id,
        policy_id=policy_id,
        tool_action_id=action_id,
        priority=150,
        effect=RuleEffect.REQUIRE_APPROVAL,
        conditions={"max_amount": 1000},
        created_at=datetime.now(timezone.utc),
    )
    created_rule.policy = policy
    created_rule.tool_action = action
    created_rule.target_agent = None

    res_get_rule = MagicMock()
    res_get_rule.scalar_one_or_none.return_value = created_rule

    mock_db.execute.side_effect = [res_user, res_policy, res_action, res_get_rule]

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            payload = {
                "tool_action_id": str(action_id),
                "priority": 150,
                "effect": "REQUIRE_APPROVAL",
                "conditions": {"max_amount": 1000},
            }
            res = await client.post(f"/api/v1/policies/{policy_id}/rules", json=payload, headers=headers)

            assert res.status_code == 201
            data = res.json()
            assert data["id"] == str(new_rule_id)
            assert data["policy_id"] == str(policy_id)
            assert data["priority"] == 150
            assert data["effect"] == "REQUIRE_APPROVAL"
            assert data["conditions"] == {"max_amount": 1000}
            assert mock_db.add.called
            assert mock_db.commit.called
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_rule_in_policy_anti_ai_blocked():
    """2. POST /api/v1/policies/{policy_id}/rules con X-Agent-Id -> 403 Forbidden."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-Agent-Id": str(uuid.uuid4())}
            payload = {
                "tool_action_id": str(uuid.uuid4()),
                "priority": 100,
                "effect": "DENY",
            }
            res = await client.post(f"/api/v1/policies/{uuid.uuid4()}/rules", json=payload, headers=headers)

            assert res.status_code == 403
            assert "AI Agents are not permitted to manage governance policies or rules" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_rule_in_policy_non_admin_forbidden():
    """3. POST /api/v1/policies/{policy_id}/rules con usuario OPERATOR -> 403 Forbidden."""
    operator_user = User(id=uuid.uuid4(), organization_id=uuid.uuid4(), email="op@corp.io", role=UserRole.OPERATOR)
    mock_db = AsyncMock()
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = operator_user
    mock_db.execute.side_effect = [res_user]

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(operator_user.id)}
            payload = {
                "tool_action_id": str(uuid.uuid4()),
                "priority": 100,
                "effect": "DENY",
            }
            res = await client.post(f"/api/v1/policies/{uuid.uuid4()}/rules", json=payload, headers=headers)

            assert res.status_code == 403
            assert "no tiene privilegios de ADMIN" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_rule_in_policy_cross_tenant_rejected():
    """4. POST /api/v1/policies/{policy_id}/rules con policy de otra org -> 404 Not Found."""
    org_1 = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=org_1, email="admin1@corp.io", role=UserRole.ADMIN)

    mock_db = AsyncMock()
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_policy = MagicMock()
    res_policy.scalar_one_or_none.return_value = None  # No encontrada en el tenant org_1

    mock_db.execute.side_effect = [res_user, res_policy]
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            alien_policy_id = uuid.uuid4()
            payload = {
                "tool_action_id": str(uuid.uuid4()),
                "priority": 100,
                "effect": "DENY",
            }
            res = await client.post(f"/api/v1/policies/{alien_policy_id}/rules", json=payload, headers=headers)

            assert res.status_code == 404
            assert "no encontrada" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_rule_tool_action_from_different_org():
    """5. POST /api/v1/policies/{policy_id}/rules con tool_action de otra org -> 400 Bad Request."""
    org_1 = uuid.uuid4()
    org_2 = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=org_1, email="admin1@corp.io", role=UserRole.ADMIN)
    policy_id = uuid.uuid4()
    policy = Policy(id=policy_id, organization_id=org_1, name="Policy Org 1", priority=100, is_active=True)

    alien_tool = Tool(id=uuid.uuid4(), organization_id=org_2, name="Alien Tool", endpoint_url="https://alien.corp")
    action_id = uuid.uuid4()
    alien_action = ToolAction(id=action_id, tool_id=alien_tool.id, action_name="alien_action", risk_level=RiskLevel.LOW)
    alien_action.tool = alien_tool

    mock_db = AsyncMock()
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_policy = MagicMock()
    res_policy.scalar_one_or_none.return_value = policy
    res_action = MagicMock()
    res_action.scalar_one_or_none.return_value = alien_action

    mock_db.execute.side_effect = [res_user, res_policy, res_action]
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            payload = {
                "tool_action_id": str(action_id),
                "priority": 100,
                "effect": "DENY",
            }
            res = await client.post(f"/api/v1/policies/{policy_id}/rules", json=payload, headers=headers)

            assert res.status_code == 400
            assert "no pertenece a la misma organización" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_rule_target_agent_from_different_org():
    """6. POST /api/v1/policies/{policy_id}/rules con target_agent de otra org -> 400 Bad Request."""
    org_1 = uuid.uuid4()
    org_2 = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=org_1, email="admin1@corp.io", role=UserRole.ADMIN)
    policy_id = uuid.uuid4()
    policy = Policy(id=policy_id, organization_id=org_1, name="Policy Org 1", priority=100, is_active=True)

    tool = Tool(id=uuid.uuid4(), organization_id=org_1, name="Tool Org 1", endpoint_url="https://tool.corp")
    action_id = uuid.uuid4()
    action = ToolAction(id=action_id, tool_id=tool.id, action_name="action_1", risk_level=RiskLevel.LOW)
    action.tool = tool

    alien_agent_id = uuid.uuid4()
    alien_agent = Agent(id=alien_agent_id, organization_id=org_2, name="Alien Agent")

    mock_db = AsyncMock()
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_policy = MagicMock()
    res_policy.scalar_one_or_none.return_value = policy
    res_action = MagicMock()
    res_action.scalar_one_or_none.return_value = action
    res_agent = MagicMock()
    res_agent.scalar_one_or_none.return_value = alien_agent

    mock_db.execute.side_effect = [res_user, res_policy, res_action, res_agent]
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            payload = {
                "tool_action_id": str(action_id),
                "target_agent_id": str(alien_agent_id),
                "priority": 100,
                "effect": "DENY",
            }
            res = await client.post(f"/api/v1/policies/{policy_id}/rules", json=payload, headers=headers)

            assert res.status_code == 400
            assert "no pertenece a la misma organización" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_policy_rule_success():
    """7. PATCH /api/v1/policy-rules/{rule_id} con admin -> 200 OK y mutación de campos."""
    org_id = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=org_id, email="admin@corp.io", role=UserRole.ADMIN)
    policy = Policy(id=uuid.uuid4(), organization_id=org_id, name="Main Policy", priority=100, is_active=True)
    tool = Tool(id=uuid.uuid4(), organization_id=org_id, name="Billing API", endpoint_url="https://api.corp")
    action = ToolAction(id=uuid.uuid4(), tool_id=tool.id, action_name="refund", risk_level=RiskLevel.HIGH)
    action.tool = tool

    rule_id = uuid.uuid4()
    rule = PolicyRule(
        id=rule_id,
        policy_id=policy.id,
        tool_action_id=action.id,
        priority=100,
        effect=RuleEffect.DENY,
        conditions={"max_amount": 500},
        created_at=datetime.now(timezone.utc),
    )
    rule.policy = policy
    rule.tool_action = action
    rule.target_agent = None

    mock_db = AsyncMock()
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_rule = MagicMock()
    res_rule.scalar_one_or_none.return_value = rule

    mock_db.execute.side_effect = [res_user, res_rule]
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            payload = {
                "priority": 250,
                "effect": "ALLOW",
                "conditions": {"max_amount": 2500},
            }
            res = await client.patch(f"/api/v1/policy-rules/{rule_id}", json=payload, headers=headers)

            assert res.status_code == 200
            data = res.json()
            assert data["priority"] == 250
            assert data["effect"] == "ALLOW"
            assert data["conditions"] == {"max_amount": 2500}
            assert mock_db.commit.called
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_policy_rule_anti_ai_blocked():
    """8. PATCH /api/v1/policy-rules/{rule_id} con X-Agent-Id -> 403 Forbidden."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-Agent-Id": str(uuid.uuid4())}
            payload = {"priority": 300}
            res = await client.patch(f"/api/v1/policy-rules/{uuid.uuid4()}", json=payload, headers=headers)

            assert res.status_code == 403
            assert "AI Agents are not permitted to manage governance policies or rules" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_policy_rule_non_admin_forbidden():
    """9. PATCH /api/v1/policy-rules/{rule_id} con usuario VIEWER -> 403 Forbidden."""
    viewer_user = User(id=uuid.uuid4(), organization_id=uuid.uuid4(), email="viewer@corp.io", role=UserRole.VIEWER)
    mock_db = AsyncMock()
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = viewer_user
    mock_db.execute.side_effect = [res_user]

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(viewer_user.id)}
            payload = {"priority": 200}
            res = await client.patch(f"/api/v1/policy-rules/{uuid.uuid4()}", json=payload, headers=headers)

            assert res.status_code == 403
            assert "no tiene privilegios de ADMIN" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_policy_rule_cross_tenant_rejected():
    """10. PATCH /api/v1/policy-rules/{rule_id} sobre regla de otra org -> 404 Not Found."""
    org_1 = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=org_1, email="admin1@corp.io", role=UserRole.ADMIN)

    mock_db = AsyncMock()
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_rule = MagicMock()
    res_rule.scalar_one_or_none.return_value = None  # Regla de otra empresa -> filtrada por JOIN tenant

    mock_db.execute.side_effect = [res_user, res_rule]
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            alien_rule_id = uuid.uuid4()
            payload = {"priority": 200}
            res = await client.patch(f"/api/v1/policy-rules/{alien_rule_id}", json=payload, headers=headers)

            assert res.status_code == 404
            assert "no encontrada" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_delete_policy_rule_individual_success():
    """11. DELETE /api/v1/policy-rules/{rule_id} con admin -> 204 No Content."""
    org_id = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=org_id, email="admin@corp.io", role=UserRole.ADMIN)
    policy = Policy(id=uuid.uuid4(), organization_id=org_id, name="Container Policy")

    rule_id = uuid.uuid4()
    rule = PolicyRule(id=rule_id, policy_id=policy.id, priority=100)
    rule.policy = policy

    mock_db = AsyncMock()
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_rule = MagicMock()
    res_rule.scalar_one_or_none.return_value = rule

    mock_db.execute.side_effect = [res_user, res_rule]
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            res = await client.delete(f"/api/v1/policy-rules/{rule_id}", headers=headers)

            assert res.status_code == 204
            assert mock_db.delete.called
            assert mock_db.commit.called
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_delete_policy_rule_preserves_policy_and_sister_rules():
    """12. Comprueba que al eliminar una regla, la política y las otras reglas hermanas sobreviven."""
    org_id = uuid.uuid4()
    policy_id = uuid.uuid4()
    rule_1_id = uuid.uuid4()
    rule_2_id = uuid.uuid4()

    policy = Policy(id=policy_id, organization_id=org_id, name="Multi-Rule Policy")
    rule_1 = PolicyRule(id=rule_1_id, policy_id=policy_id, priority=100)
    rule_2 = PolicyRule(id=rule_2_id, policy_id=policy_id, priority=200)
    rule_1.policy = policy
    rule_2.policy = policy
    policy.rules = [rule_1, rule_2]

    mock_db = AsyncMock()
    res_rule = MagicMock()
    res_rule.scalar_one_or_none.return_value = rule_1

    deleted_objects = []
    mock_db.delete = MagicMock(side_effect=lambda obj: deleted_objects.append(obj))
    mock_db.execute.return_value = res_rule

    from app.services.policy_rule_service import policy_rule_service

    result = await policy_rule_service.delete_rule(
        db=mock_db,
        rule_id=rule_1_id,
        organization_id=org_id,
    )

    assert result is True
    # Solo rule_1 fue eliminada
    assert len(deleted_objects) == 1
    assert deleted_objects[0].id == rule_1_id
    # La política no fue borrada
    assert policy not in deleted_objects
    assert rule_2 not in deleted_objects


@pytest.mark.asyncio
async def test_delete_policy_rule_anti_ai_blocked():
    """13. DELETE /api/v1/policy-rules/{rule_id} con X-Agent-Id -> 403 Forbidden."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-Agent-Id": str(uuid.uuid4())}
            res = await client.delete(f"/api/v1/policy-rules/{uuid.uuid4()}", headers=headers)

            assert res.status_code == 403
            assert "AI Agents are not permitted to manage governance policies or rules" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_delete_policy_rule_cross_tenant_rejected():
    """14. DELETE /api/v1/policy-rules/{rule_id} sobre regla de otra empresa -> 404 Not Found."""
    org_1 = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=org_1, email="admin1@corp.io", role=UserRole.ADMIN)

    mock_db = AsyncMock()
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_rule = MagicMock()
    res_rule.scalar_one_or_none.return_value = None  # No pertenece a org_1

    mock_db.execute.side_effect = [res_user, res_rule]
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            alien_rule_id = uuid.uuid4()
            res = await client.delete(f"/api/v1/policy-rules/{alien_rule_id}", headers=headers)

            assert res.status_code == 404
            assert "no encontrada" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()
