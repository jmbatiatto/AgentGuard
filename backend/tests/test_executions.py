"""Pruebas automatizadas para el endpoint de Trazas Forenses (/api/v1/executions)."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.enums import PolicyDecision, ExecutionStatus, UserRole
from app.models.execution import Execution
from app.models.agent import Agent
from app.models.tool import Tool, ToolAction
from app.models.user import User
from tests.conftest import make_admin_jwt


def _make_auth(org_id=None):
    user = User(
        id=uuid.uuid4(),
        organization_id=org_id or uuid.uuid4(),
        email="admin@test.com",
        role=UserRole.ADMIN,
    )
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = user
    return res_user, make_admin_jwt(user)


@pytest.mark.asyncio
async def test_list_executions_endpoint():
    """Valida la consulta de trazas forenses de ejecucion con status 200."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    fake_exec = Execution(
        id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        agent_id=uuid.uuid4(),
        tool_id=uuid.uuid4(),
        tool_action_id=uuid.uuid4(),
        resource="test/resource",
        request_context={"amount": 100},
        decision=PolicyDecision.ALLOW,
        status=ExecutionStatus.EXECUTED,
        timestamp=datetime.now(timezone.utc),
    )
    fake_exec.agent = Agent(name="Sales Bot")
    fake_exec.tool = Tool(name="CRM")
    fake_exec.tool_action = ToolAction(action_name="quote")

    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [fake_exec]
    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    res_user, headers = _make_auth()
    mock_db.execute = AsyncMock(side_effect=[res_user, mock_result])

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/v1/executions", headers=headers)
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            assert len(data) == 1
            assert data[0]["decision"] == "ALLOW"
            assert data[0]["agent_name"] == "Sales Bot"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_execution_by_id_not_found():
    """Valida que un ID inexistente retorne 404."""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    res_user, headers = _make_auth()
    mock_db.execute = AsyncMock(side_effect=[res_user, mock_result])
    app.dependency_overrides[get_db] = lambda: mock_db

    fake_id = uuid.uuid4()
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/executions/{fake_id}", headers=headers)
            assert response.status_code == 404
            assert "no encontrada" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()
