"""Pruebas unitarias para el Motor Evaluador de Políticas (PDP)."""

import uuid
from unittest.mock import AsyncMock, MagicMock
import pytest

from app.models.enums import PolicyDecision, RuleEffect
from app.models.policy import Policy, PolicyRule
from app.services.pdp_engine import PDPEngine, pdp_engine


def test_matches_conditions_empty():
    """Condiciones vacías aplican incondicionalmente."""
    assert PDPEngine.matches_conditions({}, {"amount": 500}) is True
    assert PDPEngine.matches_conditions({}, {}) is True


def test_matches_conditions_numeric():
    """Prueba operadores numéricos (max_amount, min_amount, _lt, _gte)."""
    # max_amount
    conds = {"max_amount": 10000}
    assert PDPEngine.matches_conditions(conds, {"amount": 2500}) is True
    assert PDPEngine.matches_conditions(conds, {"amount": 10000}) is True
    assert PDPEngine.matches_conditions(conds, {"amount": 10001}) is False
    assert PDPEngine.matches_conditions(conds, {}) is False  # Falta parámetro

    # min_amount
    conds_min = {"min_amount": 500}
    assert PDPEngine.matches_conditions(conds_min, {"amount": 4500}) is True
    assert PDPEngine.matches_conditions(conds_min, {"amount": 500}) is True
    assert PDPEngine.matches_conditions(conds_min, {"amount": 499}) is False

    # sufijo _lt y _gte
    conds_suffix = {"price_lt": 100, "qty_gte": 5}
    assert PDPEngine.matches_conditions(conds_suffix, {"price": 50, "qty": 10}) is True
    assert PDPEngine.matches_conditions(conds_suffix, {"price": 100, "qty": 10}) is False
    assert PDPEngine.matches_conditions(conds_suffix, {"price": 50, "qty": 4}) is False


def test_matches_conditions_destinations():
    """Prueba listas y pertenencia de destinos homologados."""
    conds = {"allowed_destinations": ["https://crm.corp.internal", "https://api.stripe.com"]}
    assert PDPEngine.matches_conditions(conds, {"dest": "https://crm.corp.internal"}) is True
    assert PDPEngine.matches_conditions(conds, {"dest": "https://attacker.io"}) is False
    assert PDPEngine.matches_conditions(conds, {}) is False


@pytest.mark.asyncio
async def test_pdp_evaluate_allow():
    """Simula Escenario 1: Operación autorizada (ALLOW)."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    action_id = uuid.uuid4()
    rule_id = uuid.uuid4()

    rule = PolicyRule(
        id=rule_id,
        priority=100,
        effect=RuleEffect.ALLOW,
        conditions={"max_amount": 10000},
    )

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [rule]
    mock_db.execute.return_value = mock_result

    verdict = await pdp_engine.evaluate(
        db=mock_db,
        organization_id=org_id,
        agent_id=agent_id,
        tool_action_id=action_id,
        parameters={"amount": 2500},
    )

    assert verdict.decision == PolicyDecision.ALLOW
    assert verdict.evaluated_policy_rule_id == rule_id


@pytest.mark.asyncio
async def test_pdp_evaluate_deny_fail_closed():
    """Simula principio Fail-Closed: Sin reglas que coincidan -> DENY."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    action_id = uuid.uuid4()

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []  # Sin reglas
    mock_db.execute.return_value = mock_result

    verdict = await pdp_engine.evaluate(
        db=mock_db,
        organization_id=org_id,
        agent_id=agent_id,
        tool_action_id=action_id,
        parameters={"amount": 2500},
    )

    assert verdict.decision == PolicyDecision.DENY
    assert verdict.evaluated_policy_rule_id is None
    assert "Fail-Closed" in verdict.reason


@pytest.mark.asyncio
async def test_pdp_evaluate_require_approval():
    """Simula Escenario 3: Operación sensible (REQUIRE_APPROVAL)."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    action_id = uuid.uuid4()
    rule_id = uuid.uuid4()

    rule = PolicyRule(
        id=rule_id,
        priority=150,
        effect=RuleEffect.REQUIRE_APPROVAL,
        conditions={"min_amount": 500},
    )

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [rule]
    mock_db.execute.return_value = mock_result

    verdict = await pdp_engine.evaluate(
        db=mock_db,
        organization_id=org_id,
        agent_id=agent_id,
        tool_action_id=action_id,
        parameters={"amount": 4500},
    )

    assert verdict.decision == PolicyDecision.REQUIRE_APPROVAL
    assert verdict.evaluated_policy_rule_id == rule_id


@pytest.mark.asyncio
async def test_pdp_evaluate_priority_tie_deny_wins():
    """Valida principio Fail-Closed: ante empate de prioridad entre ALLOW y DENY, DENY siempre gana."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    action_id = uuid.uuid4()
    deny_rule_id = uuid.uuid4()
    allow_rule_id = uuid.uuid4()

    deny_rule = PolicyRule(
        id=deny_rule_id,
        priority=100,
        effect=RuleEffect.DENY,
        conditions={"amount": {"gt": 500}},
    )
    allow_rule = PolicyRule(
        id=allow_rule_id,
        priority=100,
        effect=RuleEffect.ALLOW,
        conditions={"amount": {"gt": 500}},
    )

    # El order_by de SQLAlchemy ubica la regla DENY primera ante empate de prioridad
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [deny_rule, allow_rule]
    mock_db.execute.return_value = mock_result

    verdict = await pdp_engine.evaluate(
        db=mock_db,
        organization_id=org_id,
        agent_id=agent_id,
        tool_action_id=action_id,
        parameters={"amount": 1000},
    )

    assert verdict.decision == PolicyDecision.DENY
    assert verdict.evaluated_policy_rule_id == deny_rule_id

