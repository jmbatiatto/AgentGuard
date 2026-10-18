"""Pruebas automatizadas para el Service y API REST de Agentes de IA (Agents) y AgentTool."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.agent import Agent, AgentTool
from app.models.enums import AgentStatus
from app.models.organization import Organization
from app.models.tool import Tool
from app.models.user import User
from app.schemas.agent import AgentCreate, AgentToolCreate
from app.services.agent_service import agent_service
from app.services.organization_service import organization_service
from app.services.tool_service import tool_service
from app.services.user_service import user_service


# ==============================================================================
# Pruebas de la Capa de Servicio (AgentService)
# ==============================================================================

@pytest.mark.asyncio
async def test_agent_service_create():
    """Valida creación y persistencia de un agente de IA."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    org_id = uuid.uuid4()
    user_id = uuid.uuid4()
    agent_in = AgentCreate(
        organization_id=org_id,
        owner_user_id=user_id,
        name="BillingBot",
        purpose="Automatización de cobros",
        status=AgentStatus.ACTIVE,
    )

    async def mock_refresh(instance):
        instance.id = uuid.uuid4()
        instance.created_at = datetime.now(timezone.utc)

    mock_db.refresh.side_effect = mock_refresh

    result = await agent_service.create(db=mock_db, agent_in=agent_in)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once()
    assert result.name == "BillingBot"
    assert result.status == AgentStatus.ACTIVE
    assert result.owner_user_id == user_id


@pytest.mark.asyncio
async def test_agent_service_get_by_id():
    """Valida la búsqueda de agente por UUID."""
    mock_db = AsyncMock()
    agent_id = uuid.uuid4()
    mock_agent = Agent(
        id=agent_id,
        organization_id=uuid.uuid4(),
        owner_user_id=uuid.uuid4(),
        name="SupportBot",
        status=AgentStatus.ACTIVE,
        created_at=datetime.now(timezone.utc),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_agent
    mock_db.execute.return_value = mock_result

    result = await agent_service.get_by_id(db=mock_db, agent_id=agent_id)

    mock_db.execute.assert_awaited_once()
    assert result is not None
    assert result.id == agent_id
    assert result.name == "SupportBot"


@pytest.mark.asyncio
async def test_agent_service_assign_tool():
    """Valida asignación y actualización de herramienta para un agente."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()

    # Caso 1: Asignación nueva (no existe previa)
    mock_result_none = MagicMock()
    mock_result_none.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result_none

    async def mock_refresh(instance):
        instance.id = uuid.uuid4()
        instance.created_at = datetime.now(timezone.utc)

    mock_db.refresh.side_effect = mock_refresh

    tool_in = AgentToolCreate(tool_id=tool_id, enabled=True, config={"max_per_hour": 100})
    result = await agent_service.assign_tool(db=mock_db, agent_id=agent_id, tool_in=tool_in)

    mock_db.add.assert_called_once()
    assert result.agent_id == agent_id
    assert result.tool_id == tool_id
    assert result.config["max_per_hour"] == 100


# ==============================================================================
# Pruebas de Endpoints HTTP (/api/v1/agents)
# ==============================================================================

@pytest.mark.asyncio
async def test_api_create_agent_success():
    """Valida registro exitoso de un agente con validaciones multi-tenant (201 Created)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    user_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    fake_org = Organization(id=org_id, name="Cloud Corp", created_at=now)
    fake_user = User(id=user_id, organization_id=org_id, email="lead@cloud.corp", created_at=now)
    fake_agent = Agent(
        id=agent_id,
        organization_id=org_id,
        owner_user_id=user_id,
        name="DevBot",
        status=AgentStatus.ACTIVE,
        created_at=now,
    )

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org, \
         patch.object(user_service, "get_by_id", new_callable=AsyncMock) as mock_get_user, \
         patch.object(agent_service, "create", new_callable=AsyncMock) as mock_create_agent:

        mock_get_org.return_value = fake_org
        mock_get_user.return_value = fake_user
        mock_create_agent.return_value = fake_agent

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/agents",
                json={
                    "organization_id": str(org_id),
                    "owner_user_id": str(user_id),
                    "name": "DevBot",
                },
            )

            assert response.status_code == 201
            data = response.json()
            assert data["id"] == str(agent_id)
            assert data["name"] == "DevBot"
            assert data["owner_user_id"] == str(user_id)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_create_agent_owner_different_org():
    """Valida que si el owner pertenece a otra organización retorne 400 Bad Request."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    other_org_id = uuid.uuid4()
    user_id = uuid.uuid4()

    fake_org = Organization(id=org_id, name="Tenant A")
    fake_user = User(id=user_id, organization_id=other_org_id, email="intruder@b.com")

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org, \
         patch.object(user_service, "get_by_id", new_callable=AsyncMock) as mock_get_user:

        mock_get_org.return_value = fake_org
        mock_get_user.return_value = fake_user

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/agents",
                json={
                    "organization_id": str(org_id),
                    "owner_user_id": str(user_id),
                    "name": "InvalidBot",
                },
            )

            assert response.status_code == 400
            assert "no pertenece a la organización especificada" in response.json()["detail"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_assign_tool_to_agent_success():
    """Valida asociación exitosa AgentTool (201 Created)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    fake_agent = Agent(id=agent_id, organization_id=org_id, name="SalesBot", created_at=now)
    fake_tool = Tool(id=tool_id, organization_id=org_id, name="Billing API", endpoint_url="https://api.billing", created_at=now)
    fake_agent_tool = AgentTool(
        id=uuid.uuid4(),
        agent_id=agent_id,
        tool_id=tool_id,
        enabled=True,
        config={"key": "val"},
        created_at=now,
    )

    with patch.object(agent_service, "get_by_id", new_callable=AsyncMock) as mock_get_agent, \
         patch.object(tool_service, "get_by_id", new_callable=AsyncMock) as mock_get_tool, \
         patch.object(agent_service, "assign_tool", new_callable=AsyncMock) as mock_assign:

        mock_get_agent.return_value = fake_agent
        mock_get_tool.return_value = fake_tool
        mock_assign.return_value = fake_agent_tool

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/agents/{agent_id}/tools",
                json={
                    "tool_id": str(tool_id),
                    "enabled": True,
                    "config": {"key": "val"},
                },
            )

            assert response.status_code == 201
            data = response.json()
            assert data["agent_id"] == str(agent_id)
            assert data["tool_id"] == str(tool_id)
            assert data["config"]["key"] == "val"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_assign_tool_different_org():
    """Valida que una herramienta de otro tenant sea rechazada con 400 Bad Request."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    other_org_id = uuid.uuid4()
    agent_id = uuid.uuid4()
    tool_id = uuid.uuid4()

    fake_agent = Agent(id=agent_id, organization_id=org_id, name="SalesBot")
    fake_tool = Tool(id=tool_id, organization_id=other_org_id, name="Alien API", endpoint_url="https://alien")

    with patch.object(agent_service, "get_by_id", new_callable=AsyncMock) as mock_get_agent, \
         patch.object(tool_service, "get_by_id", new_callable=AsyncMock) as mock_get_tool:

        mock_get_agent.return_value = fake_agent
        mock_get_tool.return_value = fake_tool

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/agents/{agent_id}/tools",
                json={"tool_id": str(tool_id)},
            )

            assert response.status_code == 400
            assert "no pertenece a la misma organización" in response.json()["detail"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_list_agent_tools():
    """Valida listado de herramientas asociadas a un agente (200 OK)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    agent_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    fake_agent = Agent(id=agent_id, organization_id=uuid.uuid4(), name="SalesBot")
    fake_agent_tools = [
        AgentTool(
            id=uuid.uuid4(),
            agent_id=agent_id,
            tool_id=uuid.uuid4(),
            enabled=True,
            config={},
            created_at=now,
        )
    ]

    with patch.object(agent_service, "get_by_id", new_callable=AsyncMock) as mock_get_agent, \
         patch.object(agent_service, "list_agent_tools", new_callable=AsyncMock) as mock_list_tools:

        mock_get_agent.return_value = fake_agent
        mock_list_tools.return_value = fake_agent_tools

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/agents/{agent_id}/tools")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["agent_id"] == str(agent_id)

    app.dependency_overrides.clear()
