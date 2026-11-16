"""Pruebas unitarias para el script de inicialización y semillas (seed_demo)."""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from app.core.database import get_db
from tests.conftest import make_admin_jwt

from app.models.agent import Agent, AgentTool
from app.models.enums import (
    AgentStatus,
    PolicyDecision,
    ExecutionStatus,
    RiskLevel,
    RuleEffect,
    UserRole,
)
from app.models.organization import Organization
from app.models.policy import Policy, PolicyRule
from app.models.tool import Tool, ToolAction
from app.models.user import User
from app.schemas.gateway import GatewayExecuteResponse

from scripts.seed_demo import (
    CANONICAL_ORG_NAME,
    CANONICAL_ADMIN_EMAIL,
    CANONICAL_ACME_USERS,
    seed_data,
    clear_database,
    _resolve_demo_org,
)


@pytest.mark.asyncio
async def test_seed_data_fresh_creation():
    """Valida que seed_data cree todas las entidades esperadas con UUIDs generados y ejecute las 3 trazas reales."""
    mock_session = AsyncMock()
    added_entities = []

    def mock_add(entity):
        if getattr(entity, "id", None) is None:
            entity.id = uuid.uuid4()
        added_entities.append(entity)

    def mock_add_all(entities):
        for e in entities:
            mock_add(e)

    mock_session.add = MagicMock(side_effect=mock_add)
    mock_session.add_all = MagicMock(side_effect=mock_add_all)

    # Simular flush asignando IDs si no los tienen
    async def mock_flush():
        for e in added_entities:
            if getattr(e, "id", None) is None:
                e.id = uuid.uuid4()

    mock_session.flush = AsyncMock(side_effect=mock_flush)

    # _resolve_demo_org devuelve None (no existe la org previamente)
    empty_res = MagicMock()
    empty_res.scalar_one_or_none.return_value = None
    mock_session.execute = AsyncMock(return_value=empty_res)
    mock_session.get.return_value = None

    # Mock AsyncSessionLocal context manager
    mock_session_cm = AsyncMock()
    mock_session_cm.__aenter__.return_value = mock_session
    mock_session_cm.__aexit__.return_value = None

    mock_quote_res = GatewayExecuteResponse(
        execution_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        agent_id=uuid.uuid4(),
        tool_id=uuid.uuid4(),
        action_name="create_quote",
        decision=PolicyDecision.ALLOW,
        status=ExecutionStatus.EXECUTED,
        latency_ms=15.2,
    )
    mock_refund_res = GatewayExecuteResponse(
        execution_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        agent_id=uuid.uuid4(),
        tool_id=uuid.uuid4(),
        action_name="refund",
        decision=PolicyDecision.REQUIRE_APPROVAL,
        status=ExecutionStatus.PENDING_APPROVAL,
        approval_id=uuid.uuid4(),
        latency_ms=22.1,
    )
    mock_export_res = GatewayExecuteResponse(
        execution_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        agent_id=uuid.uuid4(),
        tool_id=uuid.uuid4(),
        action_name="export_customers",
        decision=PolicyDecision.DENY,
        status=ExecutionStatus.REJECTED,
        alert_id=uuid.uuid4(),
        latency_ms=11.4,
    )

    with patch("scripts.seed_demo.AsyncSessionLocal", return_value=mock_session_cm):
        with patch(
            "scripts.seed_demo.pep_gateway_service.execute",
            new_callable=AsyncMock,
            side_effect=[mock_quote_res, mock_refund_res, mock_export_res],
        ) as mock_pep_execute:
            org_id = await seed_data(reset=False)

    assert isinstance(org_id, uuid.UUID)

    # Validar Organization
    orgs = [e for e in added_entities if isinstance(e, Organization)]
    assert len(orgs) == 1
    assert orgs[0].name == CANONICAL_ORG_NAME
    assert orgs[0].id == org_id

    # Validar Users (los 5 roles RBAC con contraseña hasheada)
    users = [e for e in added_entities if isinstance(e, User)]
    assert len(users) == 5
    user_roles = {u.role for u in users}
    assert user_roles == {
        UserRole.ADMIN,
        UserRole.APPROVER,
        UserRole.OPERATOR,
        UserRole.AUDITOR,
        UserRole.VIEWER,
    }
    assert all(u.hashed_password for u in users)
    assert all(u.organization_id == org_id for u in users)

    # Validar Agents
    agents = [e for e in added_entities if isinstance(e, Agent)]
    assert len(agents) == 3
    sales_agent = next(a for a in agents if a.name == "Agente de Ventas")
    assert sales_agent.status == AgentStatus.ACTIVE
    assert sales_agent.organization_id == org_id

    # Validar Tools
    tools = [e for e in added_entities if isinstance(e, Tool)]
    assert len(tools) == 4
    tool_names = {t.name for t in tools}
    assert tool_names == {
        "CRM & Facturación",
        "Stripe Payments",
        "Catálogo de Precios",
        "Database Administrator",
    }
    crm_tool = next(t for t in tools if t.name == "CRM & Facturación")
    stripe_tool = next(t for t in tools if t.name == "Stripe Payments")

    # Validar ToolActions
    actions = [e for e in added_entities if isinstance(e, ToolAction)]
    assert len(actions) == 5
    action_names = {a.action_name for a in actions}
    assert action_names == {"create_quote", "export_customers", "refund", "update_price", "database.drop"}

    # Validar AgentTool (Capacidades)
    agent_tools = [e for e in added_entities if isinstance(e, AgentTool)]
    sales_tool_ids = {at.tool_id for at in agent_tools if at.agent_id == sales_agent.id and at.enabled}
    assert crm_tool.id in sales_tool_ids
    assert stripe_tool.id in sales_tool_ids

    # Validar Policies y Rules
    policies = [e for e in added_entities if isinstance(e, Policy)]
    assert len(policies) == 2
    rules = [e for e in added_entities if isinstance(e, PolicyRule)]
    assert len(rules) == 5

    # Validar que las 3 trazas iniciales se ejecutaron realmente con PEPGatewayService
    assert mock_pep_execute.await_count == 3
    call_args_list = mock_pep_execute.call_args_list

    # Traza 1: create_quote (ALLOW)
    req1 = call_args_list[0].kwargs["request"]
    assert req1.action_name == "create_quote"
    assert req1.organization_id == org_id
    assert req1.agent_id == sales_agent.id
    assert req1.tool_id == crm_tool.id
    assert req1.dry_run is False

    # Traza 2: refund (REQUIRE_APPROVAL)
    req2 = call_args_list[1].kwargs["request"]
    assert req2.action_name == "refund"
    assert req2.organization_id == org_id
    assert req2.agent_id == sales_agent.id
    assert req2.tool_id == stripe_tool.id
    assert req2.dry_run is False

    # Traza 3: export_customers (DENY)
    req3 = call_args_list[2].kwargs["request"]
    assert req3.action_name == "export_customers"
    assert req3.organization_id == org_id
    assert req3.agent_id == sales_agent.id
    assert req3.tool_id == crm_tool.id
    assert req3.dry_run is False

    assert mock_session.commit.await_count >= 1


@pytest.mark.asyncio
async def test_seed_data_already_exists_without_reset():
    """Valida que seed_data no duplique registros si los 5 usuarios canónicos ya existen."""
    org_id = uuid.uuid4()
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_org = Organization(id=org_id, name=CANONICAL_ORG_NAME)

    # 1st execute for _resolve_demo_org admin query -> return admin user with org_id
    admin_user = User(id=uuid.uuid4(), organization_id=org_id, email=CANONICAL_ADMIN_EMAIL, role=UserRole.ADMIN)
    res_admin = MagicMock()
    res_admin.scalar_one_or_none.return_value = admin_user
    mock_session.get.return_value = mock_org

    # 2nd execute for ensure_canonical_demo_users
    existing_users = [
        User(id=uuid.uuid4(), organization_id=org_id, email=email, hashed_password="h", role=role)
        for email, role in CANONICAL_ACME_USERS
    ]
    mock_result_users = MagicMock()
    mock_result_users.scalars.return_value.all.return_value = existing_users

    mock_session.execute = AsyncMock(side_effect=[res_admin, mock_result_users])

    mock_session_cm = AsyncMock()
    mock_session_cm.__aenter__.return_value = mock_session
    mock_session_cm.__aexit__.return_value = None

    with patch("scripts.seed_demo.AsyncSessionLocal", return_value=mock_session_cm):
        result_org_id = await seed_data(reset=False)

    assert result_org_id == org_id
    mock_session.add.assert_not_called()
    mock_session.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_seed_data_syncs_missing_canonical_users_without_reset():
    """Si Acme Corp existe con esquema viejo (3 usuarios), agrega auditor y viewer sin resetear."""
    org_id = uuid.uuid4()
    mock_session = AsyncMock()
    added_entities = []
    mock_session.add = MagicMock(side_effect=lambda entity: added_entities.append(entity))
    mock_org = Organization(id=org_id, name=CANONICAL_ORG_NAME)

    admin_user = User(
        id=uuid.uuid4(),
        organization_id=org_id,
        email="admin@acmecorp.com",
        hashed_password=None,
        role=UserRole.ADMIN,
    )
    res_admin = MagicMock()
    res_admin.scalar_one_or_none.return_value = admin_user
    mock_session.get.return_value = mock_org

    legacy_approver = User(
        id=uuid.uuid4(),
        organization_id=org_id,
        email="approver@acmecorp.com",
        hashed_password="h",
        role=UserRole.APPROVER,
    )
    legacy_operator = User(
        id=uuid.uuid4(),
        organization_id=org_id,
        email="operator@acmecorp.com",
        hashed_password="h",
        role=UserRole.OPERATOR,
    )
    mock_result_users = MagicMock()
    mock_result_users.scalars.return_value.all.return_value = [
        admin_user,
        legacy_approver,
        legacy_operator,
    ]
    mock_session.execute = AsyncMock(side_effect=[res_admin, mock_result_users])

    mock_session_cm = AsyncMock()
    mock_session_cm.__aenter__.return_value = mock_session
    mock_session_cm.__aexit__.return_value = None

    with patch("scripts.seed_demo.AsyncSessionLocal", return_value=mock_session_cm):
        with patch("scripts.seed_demo.clear_database", new_callable=AsyncMock) as mock_clear:
            res_org_id = await seed_data(reset=False)
            mock_clear.assert_not_awaited()

    assert res_org_id == org_id
    added_users = [e for e in added_entities if isinstance(e, User)]
    assert {u.email for u in added_users} == {"auditor@acmecorp.com", "viewer@acmecorp.com"}
    assert {u.role for u in added_users} == {UserRole.AUDITOR, UserRole.VIEWER}
    assert all(u.hashed_password for u in added_users)
    assert admin_user.hashed_password
    mock_session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_api_reset_demo_success():
    """Valida el endpoint POST /api/v1/demo/reset cuando el seeder completa correctamente."""
    from httpx import ASGITransport, AsyncClient
    from app.main import app

    org_id = uuid.uuid4()
    mock_db = AsyncMock()
    admin_user = User(
        id=uuid.uuid4(),
        organization_id=org_id,
        email="admin@acmecorp.com",
        role=UserRole.ADMIN,
    )
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    mock_db.execute = AsyncMock(return_value=res_user)
    app.dependency_overrides[get_db] = lambda: mock_db
    headers = make_admin_jwt(admin_user)

    try:
        with patch("app.api.demo.seed_data", new_callable=AsyncMock, return_value=org_id) as mock_seed:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.post("/api/v1/demo/reset", headers=headers)
                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "success"
                assert str(org_id) in data["organization_id"]
                mock_seed.assert_awaited_once_with(reset=True)
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_reset_demo_reissues_jwt_for_new_db_uuids():
    """Verifica que POST /api/v1/demo/reset reemita JWT y organización con los nuevos UUIDs."""
    from datetime import datetime, timezone
    from httpx import ASGITransport, AsyncClient
    from app.main import app

    old_org_id = uuid.uuid4()
    new_org_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    old_admin = User(
        id=uuid.uuid4(),
        organization_id=old_org_id,
        email="admin@acmecorp.com",
        role=UserRole.ADMIN,
        created_at=now,
    )
    new_admin = User(
        id=uuid.uuid4(),
        organization_id=new_org_id,
        email="admin@acmecorp.com",
        role=UserRole.ADMIN,
        created_at=now,
    )
    new_org = Organization(
        id=new_org_id,
        name="Acme Corp",
        created_at=now,
    )

    res_old_admin = MagicMock()
    res_old_admin.scalar_one_or_none.return_value = old_admin
    res_new_admin = MagicMock()
    res_new_admin.scalar_one_or_none.return_value = new_admin
    res_new_org = MagicMock()
    res_new_org.scalar_one_or_none.return_value = new_org

    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(side_effect=[res_old_admin, res_new_admin, res_new_org])
    app.dependency_overrides[get_db] = lambda: mock_db
    headers = make_admin_jwt(old_admin)

    try:
        with patch("app.api.demo.seed_data", new_callable=AsyncMock, return_value=new_org_id):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.post("/api/v1/demo/reset", headers=headers)
                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "success"
                assert data["organization_id"] == str(new_org_id)
                assert data["token_type"] == "bearer"
                assert data["access_token"]
                assert data["user"]["id"] == str(new_admin.id)
                assert data["user"]["organization_id"] == str(new_org_id)
                assert data["organization"]["id"] == str(new_org_id)
                assert data["organization"]["name"] == "Acme Corp"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_clear_database_executes_cascaded_deletes():
    """Valida que clear_database ejecute las sentencias de borrado filtrando por org_id."""
    mock_session = AsyncMock()
    test_org_id = uuid.uuid4()

    await clear_database(mock_session, test_org_id)

    assert mock_session.execute.await_count >= 10
    mock_session.commit.assert_awaited_once()
