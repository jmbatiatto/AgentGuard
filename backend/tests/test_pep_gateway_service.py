"""Pruebas unitarias para el Servicio Central del Gateway PEP."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from app.models.agent import Agent, AgentTool
from app.models.enums import (
    AgentStatus,
    ApprovalStatus,
    ExecutionStatus,
    PolicyDecision,
    RiskLevel,
    RuleEffect,
)
from app.models.policy import PolicyRule
from app.models.tool import Tool, ToolAction
from app.schemas.gateway import GatewayExecuteRequest
from app.services.pdp_engine import PDPDecisionResult
from app.services.pep_gateway_service import pep_gateway_service


@pytest.mark.asyncio
async def test_pep_execute_allow_flow():
    """Valida el flujo ALLOW: valida agente, PDP emite ALLOW, persiste y despacha."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()

    agent = Agent(id=agent_id, organization_id=org_id, status=AgentStatus.ACTIVE, name="Sales Agent")
    tool = Tool(id=tool_id, organization_id=org_id, name="CRM", endpoint_url="https://crm.api.corp")
    action = ToolAction(id=action_id, tool_id=tool_id, action_name="create_quote", risk_level=RiskLevel.LOW)
    agent_tool = AgentTool(agent_id=agent_id, tool_id=tool_id, enabled=True)

    # Configurar respuestas secuenciales de mock_db.execute
    res_agent = MagicMock()
    res_agent.scalar_one_or_none.return_value = agent

    res_tool = MagicMock()
    res_tool.scalar_one_or_none.return_value = tool

    res_action = MagicMock()
    res_action.scalar_one_or_none.return_value = action

    res_agent_tool = MagicMock()
    res_agent_tool.scalar_one_or_none.return_value = agent_tool

    mock_db.execute.side_effect = [res_agent, res_tool, res_action, res_agent_tool]

    request = GatewayExecuteRequest(
        organization_id=org_id,
        agent_id=agent_id,
        tool_id=tool_id,
        action_name="create_quote",
        parameters={"amount": 2500, "customer": "Acme"},
    )

    with patch("app.services.pep_gateway_service.pdp_engine.evaluate") as mock_pdp:
        mock_pdp.return_value = PDPDecisionResult(
            decision=PolicyDecision.ALLOW,
            evaluated_policy_rule_id=uuid.uuid4(),
            reason="Regla de cotización aprobada",
        )

        response = await pep_gateway_service.execute(db=mock_db, request=request)

        assert response.decision == PolicyDecision.ALLOW
        assert response.status == ExecutionStatus.EXECUTED
        assert response.result is not None
        assert response.result["status"] == "success"
        mock_db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_pep_execute_deny_capability_abuse():
    """Valida el Escenario 2: Agente sin herramienta asignada en AgentTool resulta en DENY."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()

    agent = Agent(id=agent_id, organization_id=org_id, status=AgentStatus.ACTIVE, name="Sales Agent")
    tool = Tool(id=tool_id, organization_id=org_id, name="Pricing DB", endpoint_url="https://pricing.api.corp")
    action = ToolAction(id=action_id, tool_id=tool_id, action_name="update_price", risk_level=RiskLevel.HIGH)

    res_agent = MagicMock()
    res_agent.scalar_one_or_none.return_value = agent

    res_tool = MagicMock()
    res_tool.scalar_one_or_none.return_value = tool

    res_action = MagicMock()
    res_action.scalar_one_or_none.return_value = action

    res_agent_tool = MagicMock()
    res_agent_tool.scalar_one_or_none.return_value = None  # No asignada en AgentTool!

    mock_db.execute.side_effect = [res_agent, res_tool, res_action, res_agent_tool]

    request = GatewayExecuteRequest(
        organization_id=org_id,
        agent_id=agent_id,
        tool_id=tool_id,
        action_name="update_price",
        parameters={"product_id": 88, "new_price": 10},
    )

    response = await pep_gateway_service.execute(db=mock_db, request=request)

    assert response.decision == PolicyDecision.DENY
    assert response.status == ExecutionStatus.REJECTED
    assert "Agent lacks capability" in response.error_message
    mock_db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_pep_execute_require_approval_flow():
    """Valida el Escenario 3: PDP emite REQUIRE_APPROVAL y crea ticket pendiente."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()

    agent = Agent(id=agent_id, organization_id=org_id, status=AgentStatus.ACTIVE, name="Refund Agent")
    tool = Tool(id=tool_id, organization_id=org_id, name="Stripe Payments", endpoint_url="https://stripe.api.corp")
    action = ToolAction(id=action_id, tool_id=tool_id, action_name="refund", risk_level=RiskLevel.HIGH)
    agent_tool = AgentTool(agent_id=agent_id, tool_id=tool_id, enabled=True)

    res_agent = MagicMock()
    res_agent.scalar_one_or_none.return_value = agent

    res_tool = MagicMock()
    res_tool.scalar_one_or_none.return_value = tool

    res_action = MagicMock()
    res_action.scalar_one_or_none.return_value = action

    res_agent_tool = MagicMock()
    res_agent_tool.scalar_one_or_none.return_value = agent_tool

    mock_db.execute.side_effect = [res_agent, res_tool, res_action, res_agent_tool]

    request = GatewayExecuteRequest(
        organization_id=org_id,
        agent_id=agent_id,
        tool_id=tool_id,
        action_name="refund",
        parameters={"amount": 4500, "reason": "damaged"},
    )

    with patch("app.services.pep_gateway_service.pdp_engine.evaluate") as mock_pdp:
        mock_pdp.return_value = PDPDecisionResult(
            decision=PolicyDecision.REQUIRE_APPROVAL,
            evaluated_policy_rule_id=uuid.uuid4(),
            reason="Reembolso mayor a $500 requiere intervención humana",
        )

        response = await pep_gateway_service.execute(db=mock_db, request=request)

        assert response.decision == PolicyDecision.REQUIRE_APPROVAL
        assert response.status == ExecutionStatus.PENDING_APPROVAL
        assert response.approval_id is not None
        assert mock_db.add.call_count == 2  # Approval y Execution


@pytest.mark.asyncio
async def test_pep_execute_critical_alert_generation():
    """Valida el Escenario 4: Bloqueo en acción crítica genera registro en alerts."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()

    agent = Agent(id=agent_id, organization_id=org_id, status=AgentStatus.ACTIVE, name="Compromised Agent")
    tool = Tool(id=tool_id, organization_id=org_id, name="Data Exporter", endpoint_url="https://data.api.corp")
    action = ToolAction(id=action_id, tool_id=tool_id, action_name="export_customers", risk_level=RiskLevel.CRITICAL)
    agent_tool = AgentTool(agent_id=agent_id, tool_id=tool_id, enabled=True)

    res_agent = MagicMock()
    res_agent.scalar_one_or_none.return_value = agent

    res_tool = MagicMock()
    res_tool.scalar_one_or_none.return_value = tool

    res_action = MagicMock()
    res_action.scalar_one_or_none.return_value = action

    res_agent_tool = MagicMock()
    res_agent_tool.scalar_one_or_none.return_value = agent_tool

    mock_db.execute.side_effect = [res_agent, res_tool, res_action, res_agent_tool]

    request = GatewayExecuteRequest(
        organization_id=org_id,
        agent_id=agent_id,
        tool_id=tool_id,
        action_name="export_customers",
        parameters={"dest": "https://attacker.io"},
    )

    with patch("app.services.pep_gateway_service.pdp_engine.evaluate") as mock_pdp:
        mock_pdp.return_value = PDPDecisionResult(
            decision=PolicyDecision.DENY,
            evaluated_policy_rule_id=uuid.uuid4(),
            reason="Exfiltración de clientes bloqueada",
        )

        response = await pep_gateway_service.execute(db=mock_db, request=request)

        assert response.decision == PolicyDecision.DENY
        assert response.status == ExecutionStatus.REJECTED
        assert mock_db.add.call_count == 2  # Alert y Execution
