"""Pruebas automatizadas para el Service y API REST de Acciones Atómicas (ToolActions)."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.enums import RiskLevel
from app.models.tool import Tool, ToolAction
from app.schemas.tool_action import ToolActionCreate
from app.services.tool_service import tool_service
from app.services.tool_action_service import tool_action_service


# ==============================================================================
# Pruebas de la Capa de Servicio (ToolActionService)
# ==============================================================================

@pytest.mark.asyncio
async def test_tool_action_service_create():
    """Valida la creación y persistencia de una acción atómica."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    tool_id = uuid.uuid4()
    action_in = ToolActionCreate(
        tool_id=tool_id,
        action_name="refund_payment",
        risk_level=RiskLevel.HIGH,
        description="Reembolso de órdenes de compra",
    )

    async def mock_refresh(instance):
        instance.id = uuid.uuid4()
        instance.created_at = datetime.now(timezone.utc)

    mock_db.refresh.side_effect = mock_refresh

    result = await tool_action_service.create(db=mock_db, action_in=action_in)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once()
    assert result.action_name == "refund_payment"
    assert result.risk_level == RiskLevel.HIGH
    assert result.tool_id == tool_id


@pytest.mark.asyncio
async def test_tool_action_service_get_by_id():
    """Valida la búsqueda de acción por UUID."""
    mock_db = AsyncMock()
    action_id = uuid.uuid4()
    mock_action = ToolAction(
        id=action_id,
        tool_id=uuid.uuid4(),
        action_name="create_quote",
        risk_level=RiskLevel.LOW,
        created_at=datetime.now(timezone.utc),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_action
    mock_db.execute.return_value = mock_result

    result = await tool_action_service.get_by_id(db=mock_db, action_id=action_id)

    mock_db.execute.assert_awaited_once()
    assert result is not None
    assert result.id == action_id
    assert result.action_name == "create_quote"


@pytest.mark.asyncio
async def test_tool_action_service_get_by_tool_and_name():
    """Valida búsqueda de acción por tool_id y action_name para control de duplicados."""
    mock_db = AsyncMock()
    tool_id = uuid.uuid4()
    mock_action = ToolAction(
        id=uuid.uuid4(),
        tool_id=tool_id,
        action_name="export_csv",
        risk_level=RiskLevel.CRITICAL,
        created_at=datetime.now(timezone.utc),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_action
    mock_db.execute.return_value = mock_result

    result = await tool_action_service.get_by_tool_and_name(db=mock_db, tool_id=tool_id, action_name="export_csv")

    mock_db.execute.assert_awaited_once()
    assert result is not None
    assert result.action_name == "export_csv"


@pytest.mark.asyncio
async def test_tool_action_service_list_actions():
    """Valida listado de acciones con filtro por herramienta."""
    mock_db = AsyncMock()
    tool_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    mock_actions = [
        ToolAction(
            id=uuid.uuid4(),
            tool_id=tool_id,
            action_name=f"action_{i}",
            risk_level=RiskLevel.MEDIUM,
            created_at=now,
        )
        for i in range(2)
    ]

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_actions
    mock_db.execute.return_value = mock_result

    result = await tool_action_service.list_actions(db=mock_db, tool_id=tool_id, skip=0, limit=10)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 2
    assert result[0].action_name == "action_0"


# ==============================================================================
# Pruebas de Endpoints HTTP (/api/v1/tool-actions) — Ruta Separada
# ==============================================================================

@pytest.mark.asyncio
async def test_api_create_tool_action_success():
    """Valida registro exitoso de una acción atómica (201 Created)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    tool_id = uuid.uuid4()
    action_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    fake_tool = Tool(
        id=tool_id,
        organization_id=uuid.uuid4(),
        name="Sales API",
        endpoint_url="https://sales.corp",
        created_at=now,
    )
    fake_action = ToolAction(
        id=action_id,
        tool_id=tool_id,
        action_name="update_price",
        risk_level=RiskLevel.HIGH,
        description="Actualización masiva de precios",
        created_at=now,
    )

    with patch.object(tool_service, "get_by_id", new_callable=AsyncMock) as mock_get_tool, \
         patch.object(tool_action_service, "get_by_tool_and_name", new_callable=AsyncMock) as mock_get_existing, \
         patch.object(tool_action_service, "create", new_callable=AsyncMock) as mock_create_action:

        mock_get_tool.return_value = fake_tool
        mock_get_existing.return_value = None
        mock_create_action.return_value = fake_action

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/tool-actions",
                json={
                    "tool_id": str(tool_id),
                    "action_name": "update_price",
                    "risk_level": "HIGH",
                    "description": "Actualización masiva de precios",
                },
            )

            assert response.status_code == 201
            data = response.json()
            assert data["id"] == str(action_id)
            assert data["action_name"] == "update_price"
            assert data["risk_level"] == "HIGH"
            assert data["tool_id"] == str(tool_id)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_create_tool_action_tool_not_found():
    """Valida que si la herramienta padre no existe devuelva 404."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    missing_tool_id = uuid.uuid4()

    with patch.object(tool_service, "get_by_id", new_callable=AsyncMock) as mock_get_tool:
        mock_get_tool.return_value = None

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/tool-actions",
                json={
                    "tool_id": str(missing_tool_id),
                    "action_name": "orphan_action",
                },
            )

            assert response.status_code == 404
            assert "no encontrada" in response.json()["detail"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_create_tool_action_duplicate_conflict():
    """Valida que si ya existe una acción con el mismo nombre en la herramienta devuelva 409 Conflict."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    tool_id = uuid.uuid4()
    fake_tool = Tool(id=tool_id, organization_id=uuid.uuid4(), name="ERP", endpoint_url="https://erp.corp")
    existing_action = ToolAction(id=uuid.uuid4(), tool_id=tool_id, action_name="duplicate_act", risk_level=RiskLevel.LOW)

    with patch.object(tool_service, "get_by_id", new_callable=AsyncMock) as mock_get_tool, \
         patch.object(tool_action_service, "get_by_tool_and_name", new_callable=AsyncMock) as mock_get_existing:

        mock_get_tool.return_value = fake_tool
        mock_get_existing.return_value = existing_action

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/tool-actions",
                json={
                    "tool_id": str(tool_id),
                    "action_name": "duplicate_act",
                },
            )

            assert response.status_code == 409
            assert "Ya existe una acción" in response.json()["detail"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_list_tool_actions():
    """Valida listado de acciones atómicas con filtro por herramienta."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    tool_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    fake_actions = [
        ToolAction(
            id=uuid.uuid4(),
            tool_id=tool_id,
            action_name=f"action_{i}",
            risk_level=RiskLevel.LOW,
            created_at=now,
        )
        for i in range(2)
    ]

    with patch.object(tool_action_service, "list_actions", new_callable=AsyncMock) as mock_list:
        mock_list.return_value = fake_actions

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/tool-actions?tool_id={tool_id}&skip=0&limit=10")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["action_name"] == "action_0"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_tool_action_found():
    """Valida consulta de acción atómica existente por UUID."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    action_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    fake_action = ToolAction(
        id=action_id,
        tool_id=uuid.uuid4(),
        action_name="export_data",
        risk_level=RiskLevel.CRITICAL,
        created_at=now,
    )

    with patch.object(tool_action_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = fake_action

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/tool-actions/{action_id}")

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == str(action_id)
            assert data["action_name"] == "export_data"
            assert data["risk_level"] == "CRITICAL"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_tool_action_not_found():
    """Valida consulta de acción atómica inexistente (404)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    with patch.object(tool_action_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None

        random_id = uuid.uuid4()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/tool-actions/{random_id}")

            assert response.status_code == 404
            assert "no encontrada" in response.json()["detail"]

    app.dependency_overrides.clear()
