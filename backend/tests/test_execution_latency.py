"""Pruebas automatizadas de persistencia y serialización de latencia real (INC-04).

Valida de forma rigurosa:
1. Medición de alta precisión con time.perf_counter() en runtime por el Gateway PEP.
2. Persistencia atómica de latency_ms en la entidad Execution en base de datos.
3. Persistencia de latency_ms tanto en decisiones permitidas como en denegaciones por capacidad.
4. Variabilidad dinámica de latencia real entre llamadas (no repetido/hardcodeado).
5. Serialización fiel en la API REST de auditoría (GET /api/v1/executions y GET /api/v1/executions/{id})
   sin valores estáticos (eliminación de 21.5 y 24.0).
"""

import time
import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.agent import Agent, AgentTool
from app.models.enums import AgentStatus, ExecutionStatus, PolicyDecision, RiskLevel
from app.models.execution import Execution
from app.models.tool import Tool, ToolAction
from app.schemas.gateway import GatewayExecuteRequest
from app.services.pdp_engine import PDPDecisionResult
from app.services.pep_gateway_service import pep_gateway_service


@pytest.mark.asyncio
async def test_pep_gateway_records_real_latency_in_db():
    """Valida que PEPGatewayService calcule y guarde latency_ms > 0 en la entidad Execution."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()

    agent = Agent(id=agent_id, organization_id=org_id, status=AgentStatus.ACTIVE, name="Latency Test Agent")
    tool = Tool(id=tool_id, organization_id=org_id, name="Test CRM", endpoint_url="https://crm.api.corp")
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
        parameters={"amount": 100},
    )

    with patch("app.services.pep_gateway_service.pdp_engine.evaluate") as mock_pdp:
        mock_pdp.return_value = PDPDecisionResult(
            decision=PolicyDecision.ALLOW,
            evaluated_policy_rule_id=uuid.uuid4(),
            reason="Regla de prueba aprobada",
        )

        response = await pep_gateway_service.execute(db=mock_db, request=request)

        # 1. Verificar retorno en GatewayExecuteResponse
        assert response.latency_ms is not None
        assert isinstance(response.latency_ms, float)
        assert response.latency_ms > 0.0
        assert response.latency_ms != 21.5  # No debe ser el valor hardcodeado antiguo de API
        assert response.latency_ms != 24.0  # No debe ser el valor por defecto antiguo del schema

        # 2. Verificar que la entidad Execution agregada a mock_db tenga latency_ms persistida
        added_execution = None
        for call_args in mock_db.add.call_args_list:
            arg = call_args[0][0]
            if isinstance(arg, Execution):
                added_execution = arg
                break

        assert added_execution is not None, "Execution entity was not added to the database session"
        assert added_execution.latency_ms is not None
        assert isinstance(added_execution.latency_ms, float)
        assert added_execution.latency_ms > 0.0
        assert added_execution.latency_ms == response.latency_ms


@pytest.mark.asyncio
async def test_pep_gateway_records_latency_on_capability_denial():
    """Valida que una denegación por falta de capacidad (AgentTool ausente) también persista latency_ms."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()

    agent = Agent(id=agent_id, organization_id=org_id, status=AgentStatus.ACTIVE, name="Unauthorized Agent")
    tool = Tool(id=tool_id, organization_id=org_id, name="Sensitive DB", endpoint_url="https://db.api.corp")
    action = ToolAction(id=action_id, tool_id=tool_id, action_name="drop_table", risk_level=RiskLevel.CRITICAL)

    res_agent = MagicMock()
    res_agent.scalar_one_or_none.return_value = agent
    res_tool = MagicMock()
    res_tool.scalar_one_or_none.return_value = tool
    res_action = MagicMock()
    res_action.scalar_one_or_none.return_value = action
    res_agent_tool = MagicMock()
    res_agent_tool.scalar_one_or_none.return_value = None  # Sin capacidad asignada

    mock_db.execute.side_effect = [res_agent, res_tool, res_action, res_agent_tool]

    request = GatewayExecuteRequest(
        organization_id=org_id,
        agent_id=agent_id,
        tool_id=tool_id,
        action_name="drop_table",
        parameters={},
    )

    response = await pep_gateway_service.execute(db=mock_db, request=request)

    assert response.decision == PolicyDecision.DENY
    assert response.latency_ms is not None
    assert isinstance(response.latency_ms, float)
    assert response.latency_ms > 0.0

    # Verificar entidad persistida
    added_execution = None
    for call_args in mock_db.add.call_args_list:
        arg = call_args[0][0]
        if isinstance(arg, Execution):
            added_execution = arg
            break

    assert added_execution is not None
    assert added_execution.latency_ms == response.latency_ms
    assert added_execution.decision == PolicyDecision.DENY


@pytest.mark.asyncio
async def test_pep_gateway_latency_is_dynamic_across_invocations():
    """Valida que la latencia medida varíe dinámicamente según el tiempo de ejecución real."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()

    agent = Agent(id=agent_id, organization_id=org_id, status=AgentStatus.ACTIVE, name="Dynamic Agent")
    tool = Tool(id=tool_id, organization_id=org_id, name="Test Tool", endpoint_url="https://tool.api.corp")
    action = ToolAction(id=action_id, tool_id=tool_id, action_name="test_action", risk_level=RiskLevel.LOW)
    agent_tool = AgentTool(agent_id=agent_id, tool_id=tool_id, enabled=True)

    latencies = []

    for delay in (0.005, 0.015):
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
            action_name="test_action",
            parameters={},
        )

        def mock_eval(*args, **kwargs):
            time.sleep(delay)
            return PDPDecisionResult(
                decision=PolicyDecision.ALLOW,
                evaluated_policy_rule_id=uuid.uuid4(),
                reason="Evaluación simulada",
            )

        with patch("app.services.pep_gateway_service.pdp_engine.evaluate", side_effect=mock_eval):
            resp = await pep_gateway_service.execute(db=mock_db, request=request)
            latencies.append(resp.latency_ms)

    # Las latencias deben ser dinámicas y la segunda debe ser notablemente mayor debido a time.sleep(0.015)
    assert len(latencies) == 2
    assert latencies[0] != latencies[1], "Latencies must be dynamic, not constant"
    assert latencies[1] > latencies[0], "Second invocation should have higher latency due to longer delay"


@pytest.mark.asyncio
async def test_executions_api_list_serializes_db_latency_not_hardcoded():
    """Valida que GET /api/v1/executions devuelva el latency_ms de la BD y no 21.5 ni 24.0."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    expected_latency = 52.84  # Valor arbitrario representativo

    fake_exec = Execution(
        id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        agent_id=uuid.uuid4(),
        tool_id=uuid.uuid4(),
        tool_action_id=uuid.uuid4(),
        resource="test/resource",
        request_context={"amount": 500},
        decision=PolicyDecision.ALLOW,
        status=ExecutionStatus.EXECUTED,
        timestamp=datetime.now(timezone.utc),
        latency_ms=expected_latency,
    )
    fake_exec.agent = Agent(name="Latency Agent")
    fake_exec.tool = Tool(name="CRM")
    fake_exec.tool_action = ToolAction(action_name="create_quote")
    fake_exec.evaluated_policy_rule = None
    fake_exec.approval = None

    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [fake_exec]
    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    mock_db.execute = AsyncMock(return_value=mock_result)

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/v1/executions")
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["latency_ms"] == expected_latency
            assert data[0]["latency_ms"] != 21.5
            assert data[0]["latency_ms"] != 24.0
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_executions_api_get_by_id_serializes_db_latency():
    """Valida que GET /api/v1/executions/{id} devuelva el latency_ms persistido en BD."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    exec_id = uuid.uuid4()
    expected_latency = 98.76

    fake_exec = Execution(
        id=exec_id,
        organization_id=uuid.uuid4(),
        agent_id=uuid.uuid4(),
        tool_id=uuid.uuid4(),
        tool_action_id=uuid.uuid4(),
        resource="quotes/QT-44",
        request_context={"amount": 350},
        decision=PolicyDecision.ALLOW,
        status=ExecutionStatus.EXECUTED,
        timestamp=datetime.now(timezone.utc),
        latency_ms=expected_latency,
    )
    fake_exec.agent = Agent(name="Latency Agent")
    fake_exec.tool = Tool(name="CRM")
    fake_exec.tool_action = ToolAction(action_name="create_quote")
    fake_exec.evaluated_policy_rule = None
    fake_exec.approval = None

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_exec
    mock_db.execute = AsyncMock(return_value=mock_result)

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/executions/{exec_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == str(exec_id)
            assert data["latency_ms"] == expected_latency
            assert data["latency_ms"] != 21.5
            assert data["latency_ms"] != 24.0
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_gateway_execute_endpoint_serializes_real_latency():
    """Valida que POST /api/v1/gateway/execute retorne latency_ms real dinámico en la respuesta HTTP."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()

    agent = Agent(id=agent_id, organization_id=org_id, status=AgentStatus.ACTIVE, name="HTTP Agent")
    tool = Tool(id=tool_id, organization_id=org_id, name="Payment Gateway", endpoint_url="https://pay.api.corp")
    action = ToolAction(id=action_id, tool_id=tool_id, action_name="process_payment", risk_level=RiskLevel.MEDIUM)
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

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        with patch("app.services.pep_gateway_service.pdp_engine.evaluate") as mock_pdp:
            mock_pdp.return_value = PDPDecisionResult(
                decision=PolicyDecision.ALLOW,
                evaluated_policy_rule_id=uuid.uuid4(),
                reason="Pago permitido",
            )

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                payload = {
                    "organization_id": str(org_id),
                    "agent_id": str(agent_id),
                    "tool_id": str(tool_id),
                    "action_name": "process_payment",
                    "parameters": {"amount": 200},
                }
                res = await client.post("/api/v1/gateway/execute", json=payload)
                assert res.status_code == 200
                data = res.json()
                assert "latency_ms" in data
                assert data["latency_ms"] is not None
                assert isinstance(data["latency_ms"], float)
                assert data["latency_ms"] > 0.0
                assert data["latency_ms"] != 21.5
                assert data["latency_ms"] != 24.0
    finally:
        app.dependency_overrides.clear()
