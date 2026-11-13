"""Pruebas automatizadas para el Router de API REST del Gateway Interceptor (PEP)."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.enums import PolicyDecision, ExecutionStatus
from app.schemas.gateway import GatewayExecuteResponse
from tests.conftest import make_api_key_pair


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

    mock_db = AsyncMock()
    raw_key, _, res_key = make_api_key_pair(org_id)
    mock_db.execute = AsyncMock(return_value=res_key)
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
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
                res = await client.post(
                    "/api/v1/gateway/execute",
                    headers={"X-AgentGuard-Key": raw_key},
                    json=payload,
                )
                assert res.status_code == 200
                data = res.json()
                assert data["execution_id"] == str(exec_id)
                assert data["decision"] == "ALLOW"
                assert data["status"] == "EXECUTED"
                assert data["result"]["quote_id"] == "QT-1001"
    finally:
        app.dependency_overrides.clear()


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

    mock_db = AsyncMock()
    raw_key, _, res_key = make_api_key_pair(org_id)
    mock_db.execute = AsyncMock(return_value=res_key)
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
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
                res = await client.post(
                    "/api/v1/gateway/execute",
                    headers={"X-AgentGuard-Key": raw_key},
                    json=payload,
                )
                assert res.status_code == 202
                data = res.json()
                assert data["decision"] == "REQUIRE_APPROVAL"
                assert data["status"] == "PENDING_APPROVAL"
                assert data["approval_id"] == str(approval_id)
    finally:
        app.dependency_overrides.clear()


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

    mock_db = AsyncMock()
    raw_key, _, res_key = make_api_key_pair(org_id)
    mock_db.execute = AsyncMock(return_value=res_key)
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
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
                res = await client.post(
                    "/api/v1/gateway/execute",
                    headers={"X-AgentGuard-Key": raw_key},
                    json=payload,
                )
                assert res.status_code == 403
                data = res.json()
                assert data["decision"] == "DENY"
                assert data["status"] == "REJECTED"
                assert "no tiene autorizada" in data["error_message"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_gateway_execute_validation_error():
    """Valida que un payload con campos requeridos faltantes devuelva HTTP 422."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Falta organization_id, agent_id, tool_id
        res = await client.post(
            "/api/v1/gateway/execute",
            headers={"X-AgentGuard-Key": "ag_live_dummy_key_123456"},
            json={"action_name": "ping"},
        )
        assert res.status_code == 422


@pytest.mark.asyncio
async def test_gateway_execute_missing_api_key_returns_401():
    """Valida rechazo fail-closed 401 si falta la cabecera X-AgentGuard-Key."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "organization_id": str(uuid.uuid4()),
                "agent_id": str(uuid.uuid4()),
                "tool_id": str(uuid.uuid4()),
                "action_name": "create_quote",
                "parameters": {"amount": 100},
            }
            res = await client.post("/api/v1/gateway/execute", json=payload)
            assert res.status_code == 401
            assert "X-AgentGuard-Key" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_gateway_execute_invalid_api_key_returns_401():
    """Valida rechazo fail-closed 401 si la API Key es inválida o revocada."""
    mock_db = AsyncMock()
    res_empty = MagicMock()
    res_empty.scalar_one_or_none.return_value = None
    mock_db.execute = AsyncMock(return_value=res_empty)
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "organization_id": str(uuid.uuid4()),
                "agent_id": str(uuid.uuid4()),
                "tool_id": str(uuid.uuid4()),
                "action_name": "create_quote",
                "parameters": {"amount": 100},
            }
            res = await client.post(
                "/api/v1/gateway/execute",
                headers={"X-AgentGuard-Key": "ag_live_invalid_secret_key_000"},
                json=payload,
            )
            assert res.status_code == 401
            assert "inválida" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_gateway_execute_org_mismatch_returns_403():
    """Valida rechazo 403 anti-IDOR si organization_id no coincide con la API Key."""
    key_org_id = uuid.uuid4()
    other_org_id = uuid.uuid4()
    mock_db = AsyncMock()
    raw_key, _, res_key = make_api_key_pair(key_org_id)
    mock_db.execute = AsyncMock(return_value=res_key)
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "organization_id": str(other_org_id),
                "agent_id": str(uuid.uuid4()),
                "tool_id": str(uuid.uuid4()),
                "action_name": "create_quote",
                "parameters": {"amount": 100},
            }
            res = await client.post(
                "/api/v1/gateway/execute",
                headers={"X-AgentGuard-Key": raw_key},
                json=payload,
            )
            assert res.status_code == 403
            assert "organización" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()
