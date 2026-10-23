"""Pruebas automatizadas para el endpoint de Trazas Forenses (/api/v1/executions)."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.enums import PolicyDecision, ExecutionStatus
from app.models.execution import Execution
from app.models.agent import Agent
from app.models.tool import Tool, ToolAction


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
    mock_db.execute = AsyncMock(return_value=mock_result)

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/v1/executions")
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
    mock_db.execute = AsyncMock(return_value=mock_result)
    app.dependency_overrides[get_db] = lambda: mock_db

    fake_id = uuid.uuid4()
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/executions/{fake_id}")
            assert response.status_code == 404
            assert "no encontrada" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()
