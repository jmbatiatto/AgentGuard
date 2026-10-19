"""Pruebas automatizadas para el Router de API REST del Gateway Interceptor (PEP)."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.enums import PolicyDecision, ExecutionStatus
from app.schemas.gateway import GatewayExecuteResponse


@pytest.mark.asyncio
async def test_gateway_execute_endpoint_allow():
    """Valida que una decisión ALLOW devuelva HTTP 200 OK y el resultado despachado."""
    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    exec_id = uuid.uuid4()

    mock_resp = GatewayExecuteResponse(
        execution_id=exec_id,
        organization_id=org_id,
        agent_id=agent_id,
        tool_id=tool_id,
        action_name="create_quote",
        decision=PolicyDecision.ALLOW,
        status=ExecutionStatus.EXECUTED,
        result={"quote_id": "QT-1001", "total": 4500},
        timestamp=datetime.now(timezone.utc),
    )

    with patch("app.api.gateway.pep_gateway_service.execute", new_callable=AsyncMock) as mock_exec:
        mock_exec.return_value = mock_resp

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "organization_id": str(org_id),
                "agent_id": str(agent_id),
                "tool_id": str(tool_id),
                "action_name": "create_quote",
                "parameters": {"amount": 4500},
            }
            res = await client.post("/api/v1/gateway/execute", json=payload)
            assert res.status_code == 200
            data = res.json()
            assert data["execution_id"] == str(exec_id)
            assert data["decision"] == "ALLOW"
            assert data["status"] == "EXECUTED"
            assert data["result"]["quote_id"] == "QT-1001"


@pytest.mark.asyncio
async def test_gateway_execute_endpoint_require_approval():
    """Valida que una decisión REQUIRE_APPROVAL devuelva HTTP 202 Accepted y el ticket de aprobación."""
    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    exec_id = uuid.uuid4()
    approval_id = uuid.uuid4()

    mock_resp = GatewayExecuteResponse(
        execution_id=exec_id,
        organization_id=org_id,
        agent_id=agent_id,
        tool_id=tool_id,
        action_name="refund",
        decision=PolicyDecision.REQUIRE_APPROVAL,
        status=ExecutionStatus.PENDING_APPROVAL,
        approval_id=approval_id,
        timestamp=datetime.now(timezone.utc),
    )

    with patch("app.api.gateway.pep_gateway_service.execute", new_callable=AsyncMock) as mock_exec:
        mock_exec.return_value = mock_resp

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "organization_id": str(org_id),
                "agent_id": str(agent_id),
                "tool_id": str(tool_id),
                "action_name": "refund",
                "parameters": {"amount": 2500},
            }
            res = await client.post("/api/v1/gateway/execute", json=payload)
            assert res.status_code == 202
            data = res.json()
            assert data["decision"] == "REQUIRE_APPROVAL"
            assert data["status"] == "PENDING_APPROVAL"
            assert data["approval_id"] == str(approval_id)


@pytest.mark.asyncio
async def test_gateway_execute_endpoint_deny():
    """Valida que una decisión DENY devuelva HTTP 403 Forbidden con el cuerpo explicativo."""
    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    exec_id = uuid.uuid4()

    mock_resp = GatewayExecuteResponse(
        execution_id=exec_id,
        organization_id=org_id,
        agent_id=agent_id,
        tool_id=tool_id,
        action_name="update_price",
        decision=PolicyDecision.DENY,
        status=ExecutionStatus.REJECTED,
        error_message="El agente no tiene autorizada la herramienta",
        timestamp=datetime.now(timezone.utc),
    )

    with patch("app.api.gateway.pep_gateway_service.execute", new_callable=AsyncMock) as mock_exec:
        mock_exec.return_value = mock_resp

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "organization_id": str(org_id),
                "agent_id": str(agent_id),
                "tool_id": str(tool_id),
                "action_name": "update_price",
                "parameters": {"product_id": "P-99", "new_price": 50},
            }
            res = await client.post("/api/v1/gateway/execute", json=payload)
            assert res.status_code == 403
            data = res.json()
            assert data["decision"] == "DENY"
            assert data["status"] == "REJECTED"
            assert "no tiene autorizada" in data["error_message"]


@pytest.mark.asyncio
async def test_gateway_execute_validation_error():
    """Valida que un payload con campos requeridos faltantes devuelva HTTP 422."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Falta organization_id, agent_id, tool_id
        res = await client.post("/api/v1/gateway/execute", json={"action_name": "ping"})
        assert res.status_code == 422
