"""Pruebas unitarias para el Servicio Central del Gateway PEP."""

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import httpx
import pytest

from app.models.agent import Agent, AgentTool
from app.models.approval import Approval
from app.models.enums import (
    AgentStatus,
    ApprovalStatus,
    ExecutionStatus,
    PolicyDecision,
    RiskLevel,
    RuleEffect,
    UserRole,
)
from app.models.execution import Execution
from app.models.policy import PolicyRule
from app.models.tool import Tool, ToolAction
from app.models.user import User
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


@pytest.mark.asyncio
async def test_pep_resolve_approval_approved_with_for_update():
    """Valida que resolve_approval(APPROVED) use FOR UPDATE, no falle con NameError y re-despache."""
    org_id = uuid.uuid4()
    approver_id = uuid.uuid4()
    approval_id = uuid.uuid4()
    exec_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    tool = Tool(id=uuid.uuid4(), organization_id=org_id, name="Stripe", endpoint_url="https://stripe.api.corp")
    action = ToolAction(id=uuid.uuid4(), tool_id=tool.id, action_name="refund", risk_level=RiskLevel.HIGH)
    execution = Execution(
        id=exec_id,
        organization_id=org_id,
        agent_id=uuid.uuid4(),
        tool_id=tool.id,
        tool_action_id=action.id,
        decision=PolicyDecision.REQUIRE_APPROVAL,
        status=ExecutionStatus.PENDING_APPROVAL,
        request_context={"amount": 4500},
        timestamp=now,
    )
    execution.tool = tool
    execution.tool_action = action

    approval = Approval(
        id=approval_id,
        execution_id=exec_id,
        status=ApprovalStatus.PENDING,
        created_at=now,
    )
    approval.execution = execution

    approver = User(id=approver_id, organization_id=org_id, email="approver@acmecorp.com", role=UserRole.APPROVER)

    captured_stmts = []

    async def mock_execute(stmt):
        captured_stmts.append(str(stmt))
        res = MagicMock()
        if len(captured_stmts) == 1:
            res.scalar_one_or_none.return_value = approval
        else:
            res.scalar_one_or_none.return_value = approver
        return res

    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(side_effect=mock_execute)
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    with patch("app.services.pep_gateway_service.PEPGatewayService._dispatch_to_tool", new_callable=AsyncMock) as mock_dispatch, \
         patch("app.services.pep_gateway_service.ws_manager.broadcast", new_callable=AsyncMock) as mock_ws:
        mock_dispatch.return_value = {"status": "success"}

        result = await pep_gateway_service.resolve_approval(
            db=mock_db,
            approval_id=approval_id,
            approver_user_id=approver_id,
            decision=ApprovalStatus.APPROVED,
            resolution_reason="Aprobado por finanzas",
        )

    assert result is approval
    assert "FOR UPDATE" in captured_stmts[0].upper()
    assert approval.status == ApprovalStatus.APPROVED
    assert approval.assigned_approver_id == approver_id
    assert approval.resolution_reason == "Aprobado por finanzas"
    assert execution.status == ExecutionStatus.EXECUTED
    mock_dispatch.assert_awaited_once()
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(approval)
    mock_ws.assert_awaited_once()


@pytest.mark.asyncio
async def test_pep_resolve_approval_rejected():
    """Valida que resolve_approval(REJECTED) rechace sin despachar a herramienta."""
    org_id = uuid.uuid4()
    approver_id = uuid.uuid4()
    approval_id = uuid.uuid4()
    exec_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    tool = Tool(id=uuid.uuid4(), organization_id=org_id, name="Stripe", endpoint_url="https://stripe.api.corp")
    action = ToolAction(id=uuid.uuid4(), tool_id=tool.id, action_name="refund", risk_level=RiskLevel.HIGH)
    execution = Execution(
        id=exec_id,
        organization_id=org_id,
        agent_id=uuid.uuid4(),
        tool_id=tool.id,
        tool_action_id=action.id,
        decision=PolicyDecision.REQUIRE_APPROVAL,
        status=ExecutionStatus.PENDING_APPROVAL,
        request_context={"amount": 4500},
        timestamp=now,
    )
    execution.tool = tool
    execution.tool_action = action

    approval = Approval(
        id=approval_id,
        execution_id=exec_id,
        status=ApprovalStatus.PENDING,
        created_at=now,
    )
    approval.execution = execution

    approver = User(id=approver_id, organization_id=org_id, email="approver@acmecorp.com", role=UserRole.APPROVER)

    res_approval = MagicMock()
    res_approval.scalar_one_or_none.return_value = approval
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = approver

    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(side_effect=[res_approval, res_user])
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    with patch("app.services.pep_gateway_service.PEPGatewayService._dispatch_to_tool", new_callable=AsyncMock) as mock_dispatch, \
         patch("app.services.pep_gateway_service.ws_manager.broadcast", new_callable=AsyncMock) as mock_ws:
        result = await pep_gateway_service.resolve_approval(
            db=mock_db,
            approval_id=approval_id,
            approver_user_id=approver_id,
            decision=ApprovalStatus.REJECTED,
            resolution_reason="Operación sospechosa",
        )

    assert result is approval
    assert approval.status == ApprovalStatus.REJECTED
    assert execution.status == ExecutionStatus.REJECTED
    mock_dispatch.assert_not_awaited()
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(approval)
    mock_ws.assert_awaited_once()


@pytest.mark.asyncio
async def test_pep_resolve_approval_expired_ttl():
    """Valida expiración TTL >15 min en resolve_approval sin NameError."""
    org_id = uuid.uuid4()
    approver_id = uuid.uuid4()
    approval_id = uuid.uuid4()
    exec_id = uuid.uuid4()
    expired_time = datetime.now(timezone.utc) - timedelta(minutes=20)

    execution = Execution(
        id=exec_id,
        organization_id=org_id,
        agent_id=uuid.uuid4(),
        tool_id=uuid.uuid4(),
        tool_action_id=uuid.uuid4(),
        decision=PolicyDecision.REQUIRE_APPROVAL,
        status=ExecutionStatus.PENDING_APPROVAL,
        request_context={"amount": 4500},
        timestamp=expired_time,
    )
    approval = Approval(
        id=approval_id,
        execution_id=exec_id,
        status=ApprovalStatus.PENDING,
        created_at=expired_time,
    )
    approval.execution = execution

    approver = User(id=approver_id, organization_id=org_id, email="approver@acmecorp.com", role=UserRole.APPROVER)

    res_approval = MagicMock()
    res_approval.scalar_one_or_none.return_value = approval
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = approver

    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(side_effect=[res_approval, res_user])
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    result = await pep_gateway_service.resolve_approval(
        db=mock_db,
        approval_id=approval_id,
        approver_user_id=approver_id,
        decision=ApprovalStatus.APPROVED,
        resolution_reason="Intento tardío",
    )

    assert result is approval
    assert approval.status == ApprovalStatus.EXPIRED
    assert execution.status == ExecutionStatus.REJECTED
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(approval)


@pytest.mark.asyncio
async def test_pep_execute_dry_run_does_not_persist_or_broadcast_and_explains_cleanly():
    """Valida aislamiento completo de dry_run=True y explicación limpia sin falsos positivos."""
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
        dry_run=True,
    )

    with patch("app.services.pep_gateway_service.pdp_engine.evaluate") as mock_pdp, \
         patch("app.services.pep_gateway_service.ws_manager.broadcast", new_callable=AsyncMock) as mock_ws:
        mock_pdp.return_value = PDPDecisionResult(
            decision=PolicyDecision.ALLOW,
            evaluated_policy_rule_id=uuid.uuid4(),
            reason="Regla de cotización aprobada",
        )

        response = await pep_gateway_service.execute(db=mock_db, request=request)

    assert response.decision == PolicyDecision.ALLOW
    assert response.status == ExecutionStatus.EXECUTED
    assert response.is_simulation is True
    assert response.simulation_explanation is not None
    assert "Acción permitida por el motor PDP" in response.simulation_explanation
    assert "Vector hostil detectado" not in response.simulation_explanation
    assert mock_db.add.call_count == 0
    assert mock_db.commit.await_count == 0
    mock_ws.assert_not_awaited()


@pytest.mark.asyncio
async def test_pep_dispatch_to_tool_fail_closed_http_error_and_exception():
    """Valida que _dispatch_to_tool devuelva status='error' ante HTTP >= 400 o fallo de conexión."""
    tool = Tool(
        id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        name="External ERP",
        endpoint_url="https://api.external-service.com/v1",
    )

    mock_http_error_resp = MagicMock()
    mock_http_error_resp.status_code = 502

    mock_client_error = AsyncMock()
    mock_client_error.__aenter__.return_value.post = AsyncMock(return_value=mock_http_error_resp)

    with patch("app.services.pep_gateway_service.httpx.AsyncClient", return_value=mock_client_error):
        res_http = await pep_gateway_service._dispatch_to_tool(tool, "create_invoice", {"amount": 100})

    assert res_http["status"] == "error"
    assert res_http["status_code"] == 502
    assert "502" in res_http["error"]

    mock_client_exc = AsyncMock()
    mock_client_exc.__aenter__.return_value.post = AsyncMock(
        side_effect=httpx.ConnectError("Connection refused")
    )

    with patch("app.services.pep_gateway_service.httpx.AsyncClient", return_value=mock_client_exc):
        res_exc = await pep_gateway_service._dispatch_to_tool(tool, "create_invoice", {"amount": 100})

    assert res_exc["status"] == "error"
    assert "Connection refused" in res_exc["error"]
