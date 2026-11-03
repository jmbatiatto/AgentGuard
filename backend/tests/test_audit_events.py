"""Pruebas exhaustivas para el Servicio y API REST de Eventos de Auditoría (Audit Events).

Valida:
1. Operaciones CRUD en AuditService (log, get_by_id, list_events, count_events).
2. Endpoints HTTP GET /api/v1/audit-events y GET /api/v1/audit-events/{id}.
3. Filtros por actor_type, event_type y paginación (skip, offset, limit).
4. Aislamiento multi-tenant estricto y blindaje Anti-IA (X-Agent-Id bloqueado con 403).
5. Instrumentación de mutaciones administrativas en agentes, políticas y reglas.
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.agent import Agent
from app.models.audit import AuditEvent
from app.models.enums import ActorType, AgentStatus, RuleEffect, UserRole
from app.models.organization import Organization
from app.models.policy import Policy, PolicyRule
from app.models.user import User
from app.schemas.agent import AgentCreate, AgentUpdate
from app.schemas.audit_event import AuditEventResponse
from app.schemas.policy import PolicyCreate, PolicyUpdate
from app.services.audit_service import audit_service
from app.services.agent_service import agent_service
from app.services.organization_service import organization_service
from app.services.policy_service import policy_service
from app.services.policy_rule_service import policy_rule_service
from app.services.user_service import user_service


# ==============================================================================
# 1. Pruebas de la Capa de Servicio (AuditService)
# ==============================================================================

@pytest.mark.asyncio
async def test_audit_service_log_audit_event():
    """Valida el registro inmutable de un evento de auditoría con metadatos y descripción."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    actor_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    async def mock_refresh(instance):
        instance.id = uuid.uuid4()
        instance.timestamp = now

    mock_db.refresh.side_effect = mock_refresh

    event = await audit_service.log_audit_event(
        db=mock_db,
        organization_id=org_id,
        actor_type=ActorType.USER,
        actor_id=actor_id,
        event_type="POLICY_CREATED",
        metadata={"policy_id": "test-123", "priority": 100},
        description="Nueva política de seguridad registrada",
    )

    assert mock_db.commit.called
    assert mock_db.refresh.called
    assert event.organization_id == org_id
    assert event.actor_type == ActorType.USER
    assert event.actor_id == actor_id
    assert event.event_type == "POLICY_CREATED"
    assert event.event_metadata["policy_id"] == "test-123"
    assert event.event_metadata["description"] == "Nueva política de seguridad registrada"


@pytest.mark.asyncio
async def test_audit_service_get_by_id():
    """Valida la recuperación de evento por ID y con filtro de organización."""
    mock_db = AsyncMock()
    event_id = uuid.uuid4()
    org_id = uuid.uuid4()

    fake_event = AuditEvent(
        id=event_id,
        organization_id=org_id,
        actor_type=ActorType.USER,
        actor_id=uuid.uuid4(),
        event_type="AGENT_CREATED",
        event_metadata={"name": "SupportBot"},
        timestamp=datetime.now(timezone.utc),
    )

    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = fake_event
    mock_db.execute.return_value = res_mock

    # Consulta por ID
    found = await audit_service.get_by_id(db=mock_db, event_id=event_id)
    assert found is not None
    assert found.id == event_id
    assert found.event_type == "AGENT_CREATED"

    # Consulta con tenant coincidente
    found_tenant = await audit_service.get_by_id(db=mock_db, event_id=event_id, organization_id=org_id)
    assert found_tenant is not None


@pytest.mark.asyncio
async def test_audit_service_list_and_count_events():
    """Valida listado paginado y conteo de eventos con filtros."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    events = [
        AuditEvent(
            id=uuid.uuid4(),
            organization_id=org_id,
            actor_type=ActorType.USER,
            actor_id=uuid.uuid4(),
            event_type="POLICY_RULE_CREATED",
            event_metadata={},
            timestamp=datetime.now(timezone.utc),
        ),
        AuditEvent(
            id=uuid.uuid4(),
            organization_id=org_id,
            actor_type=ActorType.SYSTEM,
            actor_id=uuid.uuid4(),
            event_type="POLICY_UPDATED",
            event_metadata={},
            timestamp=datetime.now(timezone.utc),
        ),
    ]

    res_list = MagicMock()
    res_list.scalars.return_value.all.return_value = events

    res_count = MagicMock()
    res_count.scalar.return_value = 2

    mock_db.execute.side_effect = [res_list, res_count]

    result_list = await audit_service.list_events(
        db=mock_db,
        organization_id=org_id,
        skip=0,
        limit=10,
        actor_type=ActorType.USER,
        event_type="POLICY_RULE_CREATED",
    )
    assert len(result_list) == 2

    total_count = await audit_service.count_events(
        db=mock_db,
        organization_id=org_id,
    )
    assert total_count == 2


# ==============================================================================
# 2. Pruebas de Endpoints HTTP (/api/v1/audit-events)
# ==============================================================================

@pytest.mark.asyncio
async def test_api_list_audit_events_success():
    """Valida listado exitoso de eventos con serialización correcta de metadata."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    event_id = uuid.uuid4()
    actor_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    event = AuditEvent(
        id=event_id,
        organization_id=org_id,
        actor_type=ActorType.USER,
        actor_id=actor_id,
        event_type="AGENT_SUSPENDED",
        event_metadata={"agent_id": "abc-123", "reason": "compromised"},
        timestamp=now,
    )

    with patch.object(audit_service, "list_events", new_callable=AsyncMock) as mock_list:
        mock_list.return_value = [event]

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/audit-events?organization_id={org_id}&limit=20&skip=0")

            assert res.status_code == 200
            data = res.json()
            assert len(data) == 1
            assert data[0]["id"] == str(event_id)
            assert data[0]["organization_id"] == str(org_id)
            assert data[0]["actor_type"] == "USER"
            assert data[0]["event_type"] == "AGENT_SUSPENDED"
            assert data[0]["metadata"]["agent_id"] == "abc-123"
            assert data[0]["metadata"]["reason"] == "compromised"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_list_audit_events_offset_alias_and_filters():
    """Valida soporte para parámetro offset (alias de skip) y filtros de actor_type y event_type."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()

    with patch.object(audit_service, "list_events", new_callable=AsyncMock) as mock_list:
        mock_list.return_value = []

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(
                f"/api/v1/audit-events?organization_id={org_id}&offset=15&limit=10&actor_type=AGENT&event_type=TOOL_INVOCATION"
            )

            assert res.status_code == 200
            mock_list.assert_awaited_once_with(
                db=mock_db,
                organization_id=org_id,
                skip=15,
                limit=10,
                actor_type=ActorType.AGENT,
                event_type="TOOL_INVOCATION",
            )

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_list_audit_events_tenant_isolation_forbidden():
    """Valida que un administrador humano de Tenant A no pueda consultar eventos de Tenant B (403 Forbidden)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    tenant_a_id = uuid.uuid4()
    tenant_b_id = uuid.uuid4()
    admin_user = User(
        id=uuid.uuid4(),
        organization_id=tenant_a_id,
        email="admin@tenant-a.com",
        role=UserRole.ADMIN,
    )

    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    mock_db.execute.return_value = res_user

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            # Intento de consultar Tenant B
            res = await client.get(
                f"/api/v1/audit-events?organization_id={tenant_b_id}",
                headers=headers,
            )

            assert res.status_code == 403
            assert "no pertenece a la organizaci" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_audit_events_anti_ai_shield():
    """Valida que los agentes de IA (X-Agent-Id) tengan estrictamente bloqueado el acceso a auditoría forense."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    agent_id = uuid.uuid4()
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-Agent-Id": str(agent_id)}
            res = await client.get("/api/v1/audit-events", headers=headers)
            assert res.status_code == 403
            assert "AI Agents are not permitted" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_audit_event_by_id_success():
    """Valida obtención por UUID exitosa retornando el esquema serializado."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    event_id = uuid.uuid4()
    org_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    event = AuditEvent(
        id=event_id,
        organization_id=org_id,
        actor_type=ActorType.USER,
        actor_id=uuid.uuid4(),
        event_type="POLICY_DELETED",
        event_metadata={"policy_id": "pol-xyz", "name": "Restricted Policy"},
        timestamp=now,
    )

    with patch.object(audit_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = event

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/audit-events/{event_id}")

            assert res.status_code == 200
            data = res.json()
            assert data["id"] == str(event_id)
            assert data["event_type"] == "POLICY_DELETED"
            assert data["metadata"]["policy_id"] == "pol-xyz"
            assert data["metadata"]["name"] == "Restricted Policy"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_audit_event_not_found():
    """Valida que un ID inexistente retorne 404 Not Found."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    event_id = uuid.uuid4()

    with patch.object(audit_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/audit-events/{event_id}")

            assert res.status_code == 404
            assert "no encontrado" in res.json()["detail"]

    app.dependency_overrides.clear()


# ==============================================================================
# 3. Pruebas de Instrumentación de Mutaciones Administrativas
# ==============================================================================

@pytest.mark.asyncio
async def test_mutation_agent_lifecycle_logs_audit_events():
    """Valida que el alta, actualización de estado (suspensión) y baja de agentes registren audit_events."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    user_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    fake_org = Organization(id=org_id, name="Security Org", created_at=now)
    fake_user = User(id=user_id, organization_id=org_id, email="owner@sec.io", role=UserRole.ADMIN, created_at=now)
    fake_agent = Agent(
        id=agent_id,
        organization_id=org_id,
        owner_user_id=user_id,
        name="AuditedBot",
        status=AgentStatus.ACTIVE,
        created_at=now,
    )

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org, \
         patch.object(user_service, "get_by_id", new_callable=AsyncMock) as mock_get_user, \
         patch.object(agent_service, "create", new_callable=AsyncMock) as mock_create_agent, \
         patch.object(agent_service, "update", new_callable=AsyncMock) as mock_update_agent, \
         patch.object(agent_service, "get_by_id", new_callable=AsyncMock) as mock_get_agent, \
         patch.object(agent_service, "delete", new_callable=AsyncMock) as mock_delete_agent, \
         patch.object(audit_service, "log_audit_event", new_callable=AsyncMock) as mock_log_audit:

        mock_get_org.return_value = fake_org
        mock_get_user.return_value = fake_user
        mock_create_agent.return_value = fake_agent
        mock_get_agent.return_value = fake_agent
        mock_delete_agent.return_value = True

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Crear agente
            res_create = await client.post(
                "/api/v1/agents",
                json={
                    "organization_id": str(org_id),
                    "owner_user_id": str(user_id),
                    "name": "AuditedBot",
                },
            )
            assert res_create.status_code == 201
            assert any(call.kwargs.get("event_type") == "AGENT_CREATED" for call in mock_log_audit.call_args_list)

            # 2. Suspender agente
            suspended_agent = Agent(
                id=agent_id,
                organization_id=org_id,
                owner_user_id=user_id,
                name="AuditedBot",
                status=AgentStatus.SUSPENDED,
                created_at=now,
            )
            mock_update_agent.return_value = suspended_agent

            res_update = await client.patch(
                f"/api/v1/agents/{agent_id}",
                json={"status": "SUSPENDED"},
            )
            assert res_update.status_code == 200
            assert any(call.kwargs.get("event_type") == "AGENT_SUSPENDED" for call in mock_log_audit.call_args_list)

            # 3. Eliminar agente
            res_delete = await client.delete(f"/api/v1/agents/{agent_id}")
            assert res_delete.status_code == 204
            assert any(call.kwargs.get("event_type") == "AGENT_DELETED" for call in mock_log_audit.call_args_list)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_mutation_policy_lifecycle_logs_audit_events():
    """Valida que la creación, actualización y eliminación de políticas registren audit_events."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    policy_id = uuid.uuid4()
    admin_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    admin_user = User(id=admin_id, organization_id=org_id, email="admin@audit.org", role=UserRole.ADMIN)
    fake_org = Organization(id=org_id, name="Audit Org", created_at=now)
    fake_policy = Policy(
        id=policy_id,
        organization_id=org_id,
        name="Audit Guardrail",
        priority=100,
        is_active=True,
        created_at=now,
    )

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org, \
         patch.object(policy_service, "create", new_callable=AsyncMock) as mock_create_policy, \
         patch.object(policy_service, "update", new_callable=AsyncMock) as mock_update_policy, \
         patch.object(policy_service, "get_by_id", new_callable=AsyncMock) as mock_get_policy, \
         patch.object(policy_service, "delete", new_callable=AsyncMock) as mock_delete_policy, \
         patch.object(audit_service, "log_audit_event", new_callable=AsyncMock) as mock_log_audit:

        mock_get_org.return_value = fake_org
        mock_create_policy.return_value = fake_policy
        mock_get_policy.return_value = fake_policy
        mock_delete_policy.return_value = True

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Crear política
            res_create = await client.post(
                "/api/v1/policies",
                json={
                    "organization_id": str(org_id),
                    "name": "Audit Guardrail",
                    "priority": 100,
                    "is_active": True,
                },
            )
            assert res_create.status_code == 201
            assert any(call.kwargs.get("event_type") == "POLICY_CREATED" for call in mock_log_audit.call_args_list)

            # 2. Actualizar política
            updated_policy = Policy(
                id=policy_id,
                organization_id=org_id,
                name="Audit Guardrail Updated",
                priority=150,
                is_active=True,
                created_at=now,
            )
            mock_update_policy.return_value = updated_policy

            res_update = await client.patch(
                f"/api/v1/policies/{policy_id}",
                json={"priority": 150},
            )
            assert res_update.status_code == 200
            assert any(call.kwargs.get("event_type") == "POLICY_UPDATED" for call in mock_log_audit.call_args_list)

            # 3. Eliminar política
            res_delete = await client.delete(f"/api/v1/policies/{policy_id}")
            assert res_delete.status_code == 204
            assert any(call.kwargs.get("event_type") == "POLICY_DELETED" for call in mock_log_audit.call_args_list)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_audit_event_tenant_mismatch():
    """Valida que un admin de tenant A no pueda consultar por ID un evento de tenant B (403 Forbidden)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    tenant_a_id = uuid.uuid4()
    tenant_b_id = uuid.uuid4()
    event_id = uuid.uuid4()

    admin_user = User(
        id=uuid.uuid4(),
        organization_id=tenant_a_id,
        email="admin@tenant-a.com",
        role=UserRole.ADMIN,
    )

    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    mock_db.execute.return_value = res_user

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            res = await client.get(
                f"/api/v1/audit-events/{event_id}?organization_id={tenant_b_id}",
                headers=headers,
            )
            assert res.status_code == 403
            assert "no pertenece a la organizaci" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_mutation_policy_rules_logs_audit_events():
    """Valida que la creación, actualización y eliminación de reglas registren eventos de auditoría."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    policy_id = uuid.uuid4()
    rule_id = uuid.uuid4()
    action_id = uuid.uuid4()
    admin_id = uuid.uuid4()

    admin_user = User(id=admin_id, organization_id=org_id, email="admin@corp.io", role=UserRole.ADMIN)
    fake_policy = Policy(id=policy_id, organization_id=org_id, name="Parent Policy")
    fake_rule = PolicyRule(
        id=rule_id,
        policy_id=policy_id,
        tool_action_id=action_id,
        priority=100,
        effect=RuleEffect.ALLOW,
        conditions={},
        created_at=datetime.now(timezone.utc),
    )
    fake_rule.policy = fake_policy

    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    mock_db.execute.return_value = res_user

    with patch.object(policy_rule_service, "create_rule_in_policy", new_callable=AsyncMock) as mock_create_rule, \
         patch.object(policy_rule_service, "update_rule", new_callable=AsyncMock) as mock_update_rule, \
         patch.object(policy_rule_service, "delete_rule", new_callable=AsyncMock) as mock_delete_rule, \
         patch.object(audit_service, "log_audit_event", new_callable=AsyncMock) as mock_log_audit:

        mock_create_rule.return_value = fake_rule
        mock_update_rule.return_value = fake_rule
        mock_delete_rule.return_value = True

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_id)}

            # 1. Crear regla
            res_create = await client.post(
                f"/api/v1/policies/{policy_id}/rules",
                json={
                    "tool_action_id": str(action_id),
                    "priority": 100,
                    "effect": "ALLOW",
                    "conditions": {},
                },
                headers=headers,
            )
            assert res_create.status_code == 201
            assert any(call.kwargs.get("event_type") == "POLICY_RULE_CREATED" for call in mock_log_audit.call_args_list)

            # 2. Actualizar regla
            res_update = await client.patch(
                f"/api/v1/policy-rules/{rule_id}",
                json={"priority": 200},
                headers=headers,
            )
            assert res_update.status_code == 200
            assert any(call.kwargs.get("event_type") == "POLICY_RULE_UPDATED" for call in mock_log_audit.call_args_list)

            # 3. Eliminar regla
            res_delete = await client.delete(
                f"/api/v1/policy-rules/{rule_id}",
                headers=headers,
            )
            assert res_delete.status_code == 204
            assert any(call.kwargs.get("event_type") == "POLICY_RULE_DELETED" for call in mock_log_audit.call_args_list)

    app.dependency_overrides.clear()

