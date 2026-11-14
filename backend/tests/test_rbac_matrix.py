"""Suite de Pruebas de Matriz RBAC Estricto, Anti-IDOR Multi-Tenant y Bloqueo Anti-IA.

Verifica el cumplimiento estricto de los 5 roles de negocio (ADMIN, APPROVER, OPERATOR,
AUDITOR, VIEWER), el aislamiento por organization_id en todas las rutas del Control Plane
y el rechazo obligatorio (403 Forbidden) ante cabeceras X-Agent-Id.
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.agent import Agent
from app.models.alert import Alert
from app.models.approval import Approval
from app.models.enums import (
    AgentStatus,
    AlertSeverity,
    AlertStatus,
    ApprovalStatus,
    ExecutionStatus,
    PolicyDecision,
    UserRole,
)
from app.models.execution import Execution
from app.models.organization import Organization
from app.models.policy import Policy
from app.models.user import User
from app.schemas.analytics import AnalyticsOverviewResponse
from app.schemas.gateway import GatewayExecuteResponse
from app.services.agent_service import agent_service
from app.services.analytics_service import analytics_service
from app.services.audit_service import audit_service
from app.services.organization_service import organization_service
from app.services.pep_gateway_service import pep_gateway_service
from app.services.policy_service import policy_service
from tests.conftest import make_admin_jwt


@pytest.fixture(autouse=True)
def clear_overrides():
    yield
    app.dependency_overrides.clear()


def _mock_user_auth(role: UserRole, org_id: uuid.UUID, alert_obj=None, exec_obj=None):
    user = User(
        id=uuid.uuid4(),
        organization_id=org_id,
        email=f"{role.value.lower()}@acmecorp.com",
        role=role,
        created_at=datetime.now(timezone.utc),
    )
    mock_db = AsyncMock()

    async def mock_execute(stmt):
        stmt_str = str(stmt)
        res = MagicMock()
        if "FROM users" in stmt_str:
            res.scalar_one_or_none.return_value = user
        elif "FROM alerts" in stmt_str:
            res.scalar_one_or_none.return_value = alert_obj
            res.scalars.return_value.all.return_value = [alert_obj] if alert_obj else []
        elif "FROM executions" in stmt_str:
            res.scalar_one_or_none.return_value = exec_obj
            res.scalars.return_value.all.return_value = [exec_obj] if exec_obj else []
        else:
            res.scalar_one_or_none.return_value = None
            res.scalars.return_value.all.return_value = []
        return res

    mock_db.execute = AsyncMock(side_effect=mock_execute)
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db
    return user, make_admin_jwt(user), mock_db


ALL_ROLES = [
    UserRole.ADMIN,
    UserRole.APPROVER,
    UserRole.OPERATOR,
    UserRole.AUDITOR,
    UserRole.VIEWER,
]


@pytest.mark.asyncio
@pytest.mark.parametrize("role", ALL_ROLES)
async def test_rbac_matrix_admin_only_mutations_and_settings(role: UserRole):
    """Solo ADMIN puede mutar recursos y gestionar usuarios/API keys/settings/reset."""
    org_id = uuid.uuid4()
    _, headers, _ = _mock_user_auth(role, org_id)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        agent_resp = await client.post(
            "/api/v1/agents",
            headers=headers,
            json={"organization_id": str(org_id), "name": "New Agent"},
        )
        tool_resp = await client.post(
            "/api/v1/tools",
            headers=headers,
            json={
                "organization_id": str(org_id),
                "name": "CRM Tool",
                "endpoint_url": "https://crm.example.com",
            },
        )
        policy_resp = await client.post(
            "/api/v1/policies",
            headers=headers,
            json={"organization_id": str(org_id), "name": "Strict Policy"},
        )
        rule_resp = await client.post(
            "/api/v1/policy-rules",
            headers=headers,
            json={
                "policy_id": str(uuid.uuid4()),
                "tool_action_id": str(uuid.uuid4()),
                "effect": "DENY",
            },
        )

        users_resp = await client.get(
            f"/api/v1/users?organization_id={org_id}", headers=headers
        )
        keys_resp = await client.get(
            f"/api/v1/api-keys?organization_id={org_id}", headers=headers
        )
        settings_resp = await client.get(
            f"/api/v1/organizations/{org_id}/settings", headers=headers
        )
        reset_resp = await client.post("/api/v1/demo/reset", headers=headers)

        if role != UserRole.ADMIN:
            assert agent_resp.status_code == 403
            assert tool_resp.status_code == 403
            assert policy_resp.status_code == 403
            assert rule_resp.status_code == 403
            assert users_resp.status_code == 403
            assert keys_resp.status_code == 403
            assert settings_resp.status_code == 403
            assert reset_resp.status_code == 403
        else:
            # ADMIN de otro tenant distinto a Acme tampoco puede ejecutar demo/reset
            assert reset_resp.status_code == 403


@pytest.mark.asyncio
@pytest.mark.parametrize("role", ALL_ROLES)
async def test_rbac_matrix_audit_events(role: UserRole):
    """Solo ADMIN y AUDITOR pueden consultar el log inmutable /api/v1/audit-events."""
    org_id = uuid.uuid4()
    _, headers, _ = _mock_user_auth(role, org_id)

    with patch.object(audit_service, "list_events", new_callable=AsyncMock) as mock_list:
        mock_list.return_value = []
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                f"/api/v1/audit-events?organization_id={org_id}", headers=headers
            )

    if role in (UserRole.ADMIN, UserRole.AUDITOR):
        assert resp.status_code == 200
        mock_list.assert_awaited_once()
    else:
        assert resp.status_code == 403
        mock_list.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize("role", ALL_ROLES)
async def test_rbac_matrix_approvals_resolve(role: UserRole):
    """Solo ADMIN y APPROVER pueden resolver aprobaciones HITL."""
    org_id = uuid.uuid4()
    user, headers, _ = _mock_user_auth(role, org_id)
    approval_id = uuid.uuid4()
    fake_approval = Approval(
        id=approval_id,
        execution_id=uuid.uuid4(),
        assigned_approver_id=user.id,
        status=ApprovalStatus.APPROVED,
        resolution_reason="Validado por cumplimiento",
        resolved_at=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
    )

    with patch.object(
        pep_gateway_service, "resolve_approval", new_callable=AsyncMock
    ) as mock_resolve:
        mock_resolve.return_value = fake_approval
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                f"/api/v1/approvals/{approval_id}/resolve",
                headers=headers,
                json={"decision": "APPROVED", "resolution_reason": "Aprobado en prueba"},
            )

    if role in (UserRole.ADMIN, UserRole.APPROVER):
        assert resp.status_code == 200
        mock_resolve.assert_awaited_once()
        assert mock_resolve.call_args.kwargs["approver_user_id"] == user.id
        assert mock_resolve.call_args.kwargs["organization_id"] == org_id
    else:
        assert resp.status_code == 403
        mock_resolve.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize("role", ALL_ROLES)
async def test_rbac_matrix_alerts_triage(role: UserRole):
    """Solo ADMIN, APPROVER y OPERATOR pueden cambiar estado de alertas."""
    org_id = uuid.uuid4()
    alert_id = uuid.uuid4()
    fake_alert = Alert(
        id=alert_id,
        organization_id=org_id,
        title="Exfiltración",
        severity=AlertSeverity.CRITICAL,
        status=AlertStatus.OPEN,
        created_at=datetime.now(timezone.utc),
    )
    user, headers, _ = _mock_user_auth(role, org_id, alert_obj=fake_alert)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.patch(
            f"/api/v1/alerts/{alert_id}/status",
            headers=headers,
            json={"status": "RESOLVED"},
        )

    if role in (UserRole.ADMIN, UserRole.APPROVER, UserRole.OPERATOR):
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "RESOLVED"
        assert data["resolved_by_user_id"] == str(user.id)
    else:
        assert resp.status_code == 403


@pytest.mark.asyncio
@pytest.mark.parametrize("role", ALL_ROLES)
async def test_rbac_matrix_gateway_simulate(role: UserRole):
    """Solo ADMIN y OPERATOR pueden ejecutar simulaciones en /gateway/simulate."""
    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    _, headers, _ = _mock_user_auth(role, org_id)

    with patch.object(
        pep_gateway_service, "execute", new_callable=AsyncMock
    ) as mock_sim:
        mock_sim.return_value = GatewayExecuteResponse(
            execution_id=uuid.uuid4(),
            organization_id=org_id,
            agent_id=agent_id,
            tool_id=tool_id,
            action_name="create_quote",
            decision=PolicyDecision.ALLOW,
            status=ExecutionStatus.EXECUTED,
            latency_ms=4.2,
            result={"simulated": True},
            is_simulation=True,
            simulation_explanation="OK",
        )
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/v1/gateway/simulate",
                headers=headers,
                json={
                    "organization_id": str(org_id),
                    "agent_id": str(agent_id),
                    "tool_id": str(tool_id),
                    "action_name": "create_quote",
                    "parameters": {"amount": 100},
                },
            )

    if role in (UserRole.ADMIN, UserRole.OPERATOR):
        assert resp.status_code == 200
        mock_sim.assert_awaited_once()
    else:
        assert resp.status_code == 403
        mock_sim.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize("role", ALL_ROLES)
async def test_rbac_matrix_operational_reads_allowed_for_all_roles(role: UserRole):
    """Todos los roles autenticados del tenant pueden leer métricas, agentes, trazas, HITL y alertas."""
    org_id = uuid.uuid4()
    _, headers, _ = _mock_user_auth(role, org_id)
    fake_org = Organization(id=org_id, name="Acme Corp", created_at=datetime.now(timezone.utc))

    with patch.object(agent_service, "list_by_org", new_callable=AsyncMock, return_value=[]), \
         patch.object(pep_gateway_service, "list_approvals", new_callable=AsyncMock, return_value=[]), \
         patch.object(organization_service, "get_by_id", new_callable=AsyncMock, return_value=fake_org), \
         patch.object(
             analytics_service,
             "get_overview",
             new_callable=AsyncMock,
             return_value=AnalyticsOverviewResponse(),
         ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            assert (await client.get(f"/api/v1/agents?organization_id={org_id}", headers=headers)).status_code == 200
            assert (await client.get(f"/api/v1/executions?organization_id={org_id}", headers=headers)).status_code == 200
            assert (await client.get(f"/api/v1/approvals?organization_id={org_id}", headers=headers)).status_code == 200
            assert (await client.get(f"/api/v1/alerts?organization_id={org_id}", headers=headers)).status_code == 200
            assert (await client.get(f"/api/v1/analytics/overview?organization_id={org_id}", headers=headers)).status_code == 200


@pytest.mark.asyncio
async def test_anti_idor_cross_tenant_blocked_with_403():
    """Un ADMIN de org_a nunca puede leer ni mutar recursos de org_b (Anti-IDOR)."""
    org_a = uuid.uuid4()
    org_b = uuid.uuid4()

    foreign_agent = Agent(
        id=uuid.uuid4(),
        organization_id=org_b,
        name="Alien Bot",
        status=AgentStatus.ACTIVE,
        created_at=datetime.now(timezone.utc),
    )
    foreign_policy = Policy(
        id=uuid.uuid4(),
        organization_id=org_b,
        name="Foreign Policy",
        priority=100,
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )
    foreign_exec = Execution(
        id=uuid.uuid4(),
        organization_id=org_b,
        agent_id=foreign_agent.id,
        tool_id=uuid.uuid4(),
        tool_action_id=uuid.uuid4(),
        timestamp=datetime.now(timezone.utc),
    )
    _, headers, _ = _mock_user_auth(UserRole.ADMIN, org_a, exec_obj=foreign_exec)

    with patch.object(agent_service, "get_by_id", new_callable=AsyncMock, return_value=foreign_agent), \
         patch.object(policy_service, "get_by_id", new_callable=AsyncMock, return_value=foreign_policy), \
         patch.object(
             pep_gateway_service,
             "resolve_approval",
             new_callable=AsyncMock,
             side_effect=PermissionError("Acceso denegado: otro tenant"),
         ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            assert (await client.get(f"/api/v1/organizations/{org_b}", headers=headers)).status_code == 403
            assert (await client.get(f"/api/v1/organizations/{org_b}/settings", headers=headers)).status_code == 403
            assert (await client.get(f"/api/v1/agents?organization_id={org_b}", headers=headers)).status_code == 403
            assert (await client.get(f"/api/v1/agents/{foreign_agent.id}", headers=headers)).status_code == 403
            assert (await client.get(f"/api/v1/policies/{foreign_policy.id}", headers=headers)).status_code == 403
            assert (await client.get(f"/api/v1/executions/{foreign_exec.id}", headers=headers)).status_code == 403
            assert (await client.get(f"/api/v1/users?organization_id={org_b}", headers=headers)).status_code == 403
            assert (await client.get(f"/api/v1/api-keys?organization_id={org_b}", headers=headers)).status_code == 403
            assert (
                await client.post(
                    f"/api/v1/approvals/{uuid.uuid4()}/resolve",
                    headers=headers,
                    json={"decision": "APPROVED", "resolution_reason": "Intento cross-tenant"},
                )
            ).status_code == 403
            assert (
                await client.post(
                    "/api/v1/gateway/simulate",
                    headers=headers,
                    json={
                        "organization_id": str(org_b),
                        "agent_id": str(uuid.uuid4()),
                        "tool_id": str(uuid.uuid4()),
                        "action_name": "create_quote",
                        "parameters": {},
                    },
                )
            ).status_code == 403


@pytest.mark.asyncio
async def test_anti_ai_agent_header_blocked_on_all_control_plane_routes():
    """Enviar X-Agent-Id con un JWT válido debe rechazar con 403 Forbidden en rutas del Control Plane."""
    org_id = uuid.uuid4()
    _, base_headers, _ = _mock_user_auth(UserRole.ADMIN, org_id)
    spoof_headers = {**base_headers, "X-Agent-Id": str(uuid.uuid4())}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        assert (await client.get(f"/api/v1/agents?organization_id={org_id}", headers=spoof_headers)).status_code == 403
        assert (await client.get(f"/api/v1/audit-events?organization_id={org_id}", headers=spoof_headers)).status_code == 403
        assert (await client.get(f"/api/v1/analytics/overview?organization_id={org_id}", headers=spoof_headers)).status_code == 403
        assert (
            await client.post(
                f"/api/v1/approvals/{uuid.uuid4()}/resolve",
                headers=spoof_headers,
                json={"decision": "APPROVED", "resolution_reason": "Auto-aprobación agente"},
            )
        ).status_code == 403
        assert (
            await client.post(
                "/api/v1/gateway/simulate",
                headers=spoof_headers,
                json={
                    "organization_id": str(org_id),
                    "agent_id": str(uuid.uuid4()),
                    "tool_id": str(uuid.uuid4()),
                    "action_name": "create_quote",
                    "parameters": {},
                },
            )
        ).status_code == 403
