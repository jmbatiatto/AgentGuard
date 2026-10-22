"""Pruebas unitarias para el script de inicialización y semillas (seed_demo)."""

from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from app.models.agent import Agent, AgentTool
from app.models.alert import Alert
from app.models.approval import Approval
from app.models.enums import (
    AgentStatus,
    AlertSeverity,
    AlertStatus,
    ApprovalStatus,
    ExecutionStatus,
    PolicyDecision,
    RiskLevel,
    RuleEffect,
    UserRole,
)
from app.models.execution import Execution
from app.models.organization import Organization
from app.models.policy import Policy, PolicyRule
from app.models.tool import Tool, ToolAction
from app.models.user import User

from scripts.seed_demo import (
    ORG_ACME_ID,
    USER_ADMIN_ID,
    USER_APPROVER_ID,
    USER_OPERATOR_ID,
    AGENT_SALES_ID,
    TOOL_CRM_ID,
    TOOL_STRIPE_ID,
    TOOL_CATALOG_ID,
    TOOL_DB_ID,
    ACTION_CREATE_QUOTE_ID,
    ACTION_EXPORT_CUSTOMERS_ID,
    ACTION_REFUND_ID,
    ACTION_UPDATE_PRICE_ID,
    ACTION_DROP_DB_ID,
    POLICY_SALES_ID,
    POLICY_GLOBAL_SAFETY_ID,
    seed_data,
    clear_database,
)


@pytest.mark.asyncio
async def test_seed_data_fresh_creation():
    """Valida que seed_data cree todas las entidades esperadas cuando la BD está vacía."""
    mock_session = AsyncMock()
    added_entities = []

    def mock_add(entity):
        added_entities.append(entity)

    def mock_add_all(entities):
        added_entities.extend(entities)

    mock_session.add = MagicMock(side_effect=mock_add)
    mock_session.add_all = MagicMock(side_effect=mock_add_all)
    mock_session.get.return_value = None  # No existe la org previamente

    # Mock AsyncSessionLocal context manager
    mock_session_cm = AsyncMock()
    mock_session_cm.__aenter__.return_value = mock_session
    mock_session_cm.__aexit__.return_value = None

    with patch("scripts.seed_demo.AsyncSessionLocal", return_value=mock_session_cm):
        await seed_data(reset=False)

    # Validar Organization
    orgs = [e for e in added_entities if isinstance(e, Organization)]
    assert len(orgs) == 1
    assert orgs[0].id == ORG_ACME_ID
    assert orgs[0].name == "Acme Corp"

    # Validar Users
    users = [e for e in added_entities if isinstance(e, User)]
    assert len(users) == 3
    user_roles = {u.role for u in users}
    assert user_roles == {UserRole.ADMIN, UserRole.APPROVER, UserRole.OPERATOR}

    # Validar Agents
    agents = [e for e in added_entities if isinstance(e, Agent)]
    assert len(agents) == 3
    sales_agent = next(a for a in agents if a.id == AGENT_SALES_ID)
    assert sales_agent.name == "Agente de Ventas"
    assert sales_agent.status == AgentStatus.ACTIVE

    # Validar Tools
    tools = [e for e in added_entities if isinstance(e, Tool)]
    assert len(tools) == 4
    tool_names = {t.name for t in tools}
    assert "CRM & Facturación" in tool_names
    assert "Stripe Payments" in tool_names
    assert "Catálogo de Precios" in tool_names
    assert "Database Administrator" in tool_names

    # Validar ToolActions
    actions = [e for e in added_entities if isinstance(e, ToolAction)]
    assert len(actions) == 5
    action_names = {a.action_name for a in actions}
    assert action_names == {"create_quote", "export_customers", "refund", "update_price", "database.drop"}

    # Validar AgentTool (Capacidades)
    agent_tools = [e for e in added_entities if isinstance(e, AgentTool)]
    sales_tool_ids = {at.tool_id for at in agent_tools if at.agent_id == AGENT_SALES_ID and at.enabled}
    assert TOOL_CRM_ID in sales_tool_ids
    assert TOOL_STRIPE_ID in sales_tool_ids
    # Catálogo y Database Admin NO asignados al Agente de Ventas
    assert TOOL_CATALOG_ID not in sales_tool_ids

    # Validar Policies y Rules
    policies = [e for e in added_entities if isinstance(e, Policy)]
    assert len(policies) == 2
    rules = [e for e in added_entities if isinstance(e, PolicyRule)]
    assert len(rules) == 5

    # Escenario 1 Rule (create_quote < 10000 -> ALLOW)
    quote_rule = next(r for r in rules if r.tool_action_id == ACTION_CREATE_QUOTE_ID)
    assert quote_rule.effect == RuleEffect.ALLOW
    assert quote_rule.conditions == {"amount": {"lte": 10000}}

    # Escenario 3 Rule (refund >= 500 -> REQUIRE_APPROVAL)
    refund_rule = next(r for r in rules if r.tool_action_id == ACTION_REFUND_ID and r.effect == RuleEffect.REQUIRE_APPROVAL)
    assert refund_rule.conditions == {"amount": {"gte": 500}}

    # Escenario 4 Rule (export_customers -> DENY)
    export_rule = next(r for r in rules if r.tool_action_id == ACTION_EXPORT_CUSTOMERS_ID)
    assert export_rule.effect == RuleEffect.DENY

    # Validar Muestras Forenses para Frontend
    executions = [e for e in added_entities if isinstance(e, Execution)]
    assert len(executions) == 3
    approvals = [e for e in added_entities if isinstance(e, Approval)]
    assert len(approvals) == 1
    assert approvals[0].status == ApprovalStatus.PENDING
    alerts = [e for e in added_entities if isinstance(e, Alert)]
    assert len(alerts) == 1
    assert alerts[0].severity == AlertSeverity.CRITICAL
    assert alerts[0].status == AlertStatus.OPEN

    assert mock_session.commit.await_count >= 1


@pytest.mark.asyncio
async def test_seed_data_already_exists_without_reset():
    """Valida que seed_data no duplique registros si ya existen y no se pasa --reset."""
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.get.return_value = Organization(id=ORG_ACME_ID, name="Acme Corp")

    mock_session_cm = AsyncMock()
    mock_session_cm.__aenter__.return_value = mock_session
    mock_session_cm.__aexit__.return_value = None

    with patch("scripts.seed_demo.AsyncSessionLocal", return_value=mock_session_cm):
        await seed_data(reset=False)

    mock_session.add.assert_not_called()
