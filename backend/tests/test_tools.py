"""Pruebas automatizadas para el Service y API REST de Herramientas (Tools)."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.organization import Organization
from app.models.tool import Tool
from app.schemas.tool import ToolCreate
from app.services.organization_service import organization_service
from app.services.tool_service import tool_service


# ==============================================================================
# Pruebas de la Capa de Servicio (ToolService)
# ==============================================================================

@pytest.mark.asyncio
async def test_tool_service_create():
    """Valida la creación y persistencia de una herramienta."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    org_id = uuid.uuid4()
    tool_in = ToolCreate(
        organization_id=org_id,
        name="CRM Gateway",
        protocol="REST",
        endpoint_url="https://crm.internal.corp/api",
        description="Gestor de clientes",
    )

    async def mock_refresh(instance):
        instance.id = uuid.uuid4()
        instance.created_at = datetime.now(timezone.utc)

    mock_db.refresh.side_effect = mock_refresh

    result = await tool_service.create(db=mock_db, tool_in=tool_in)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once()
    assert result.name == "CRM Gateway"
    assert result.protocol == "REST"
    assert result.endpoint_url == "https://crm.internal.corp/api"
    assert result.organization_id == org_id


@pytest.mark.asyncio
async def test_tool_service_get_by_id():
    """Valida la búsqueda de herramienta por UUID."""
    mock_db = AsyncMock()
    tool_id = uuid.uuid4()
    mock_tool = Tool(
        id=tool_id,
        organization_id=uuid.uuid4(),
        name="Payment Processor",
        protocol="REST",
        endpoint_url="https://pay.internal.corp",
        created_at=datetime.now(timezone.utc),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_tool
    mock_db.execute.return_value = mock_result

    result = await tool_service.get_by_id(db=mock_db, tool_id=tool_id)

    mock_db.execute.assert_awaited_once()
    assert result is not None
    assert result.id == tool_id
    assert result.name == "Payment Processor"


@pytest.mark.asyncio
async def test_tool_service_list_by_org():
    """Valida el listado con filtro multi-tenant."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    mock_tools = [
        Tool(
            id=uuid.uuid4(),
            organization_id=org_id,
            name=f"Tool {i}",
            protocol="REST",
            endpoint_url=f"https://tool{i}.corp",
            created_at=now,
        )
        for i in range(2)
    ]

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_tools
    mock_db.execute.return_value = mock_result

    result = await tool_service.list_by_org(db=mock_db, organization_id=org_id, skip=0, limit=10)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 2
    assert result[0].name == "Tool 0"


# ==============================================================================
# Pruebas de Endpoints HTTP (/api/v1/tools)
# ==============================================================================

@pytest.mark.asyncio
async def test_api_create_tool_success():
    """Valida registro exitoso de una herramienta (201 Created)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    fake_tool_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    fake_org = Organization(id=org_id, name="Logistics Inc", created_at=now)
    fake_tool = Tool(
        id=fake_tool_id,
        organization_id=org_id,
        name="Warehouse API",
        protocol="REST",
        endpoint_url="https://wh.logistics.corp",
        description="Sistema de inventario",
        created_at=now,
    )

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org, \
         patch.object(tool_service, "create", new_callable=AsyncMock) as mock_create_tool:

        mock_get_org.return_value = fake_org
        mock_create_tool.return_value = fake_tool

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/tools",
                json={
                    "organization_id": str(org_id),
                    "name": "Warehouse API",
                    "protocol": "REST",
                    "endpoint_url": "https://wh.logistics.corp",
                    "description": "Sistema de inventario",
                },
            )

            assert response.status_code == 201
            data = response.json()
            assert data["id"] == str(fake_tool_id)
            assert data["name"] == "Warehouse API"
            assert data["endpoint_url"] == "https://wh.logistics.corp"
            assert data["organization_id"] == str(org_id)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_create_tool_organization_not_found():
    """Valida que si la organización no existe devuelva 404."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    missing_org_id = uuid.uuid4()

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org:
        mock_get_org.return_value = None

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/tools",
                json={
                    "organization_id": str(missing_org_id),
                    "name": "Orphan Tool",
                    "endpoint_url": "https://orphan.tool",
                },
            )

            assert response.status_code == 404
            assert "no encontrada" in response.json()["detail"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_list_tools():
    """Valida listado de herramientas con parámetro de filtro por organización."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    fake_tools = [
        Tool(
            id=uuid.uuid4(),
            organization_id=org_id,
            name=f"Tool {i}",
            protocol="REST",
            endpoint_url=f"https://tool{i}.corp",
            created_at=now,
        )
        for i in range(2)
    ]

    with patch.object(tool_service, "list_by_org", new_callable=AsyncMock) as mock_list:
        mock_list.return_value = fake_tools

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/tools?organization_id={org_id}&skip=0&limit=10")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["name"] == "Tool 0"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_tool_found():
    """Valida consulta de herramienta existente por UUID."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    tool_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    fake_tool = Tool(
        id=tool_id,
        organization_id=uuid.uuid4(),
        name="Target Tool",
        protocol="REST",
        endpoint_url="https://target.tool.corp",
        created_at=now,
    )

    with patch.object(tool_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = fake_tool

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/tools/{tool_id}")

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == str(tool_id)
            assert data["name"] == "Target Tool"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_tool_not_found():
    """Valida consulta de herramienta inexistente (404)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    with patch.object(tool_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None

        random_id = uuid.uuid4()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/tools/{random_id}")

            assert response.status_code == 404
            assert "no encontrada" in response.json()["detail"]

    app.dependency_overrides.clear()
