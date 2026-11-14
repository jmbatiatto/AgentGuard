"""Pruebas automatizadas para el Service y API REST de Organizaciones."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.enums import UserRole
from app.models.organization import Organization
from app.models.user import User
from app.schemas.organization import OrganizationCreate
from app.services.organization_service import organization_service
from tests.conftest import make_admin_jwt


@pytest.mark.asyncio
async def test_organization_service_create():
    """Valida la creación y persistencia a través del service."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    org_in = OrganizationCreate(name="Tenant Alpha")

    # Simulamos refresh asignando id y created_at
    async def mock_refresh(instance):
        instance.id = uuid.uuid4()
        instance.created_at = datetime.now(timezone.utc)

    mock_db.refresh.side_effect = mock_refresh

    result = await organization_service.create(db=mock_db, org_in=org_in)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once()
    assert result.name == "Tenant Alpha"
    assert result.id is not None


@pytest.mark.asyncio
async def test_organization_service_get_by_id():
    """Valida la búsqueda por UUID a través del service."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    mock_org = Organization(id=org_id, name="Tenant Beta", created_at=datetime.now(timezone.utc))

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_org
    mock_db.execute.return_value = mock_result

    result = await organization_service.get_by_id(db=mock_db, org_id=org_id)

    mock_db.execute.assert_awaited_once()
    assert result is not None
    assert result.id == org_id
    assert result.name == "Tenant Beta"


@pytest.mark.asyncio
async def test_organization_service_list_all():
    """Valida el listado paginado a través del service."""
    mock_db = AsyncMock()
    now = datetime.now(timezone.utc)
    mock_orgs = [
        Organization(id=uuid.uuid4(), name=f"Tenant {i}", created_at=now)
        for i in range(3)
    ]

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_orgs
    mock_db.execute.return_value = mock_result

    result = await organization_service.list_all(db=mock_db, skip=0, limit=10)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 3
    assert result[0].name == "Tenant 0"


# ==============================================================================
# Pruebas de Endpoints HTTP (/api/v1/organizations)
# ==============================================================================

def _setup_admin_auth(mock_db, org_id=None):
    admin_user = User(
        id=uuid.uuid4(),
        organization_id=org_id or uuid.uuid4(),
        email="admin@test.com",
        role=UserRole.ADMIN,
    )
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    mock_db.execute = AsyncMock(return_value=res_user)
    return make_admin_jwt(admin_user)


@pytest.mark.asyncio
async def test_api_create_organization_success():
    """Valida endpoint POST /api/v1/organizations con respuesta 201."""
    mock_db = AsyncMock()
    headers = _setup_admin_auth(mock_db)
    app.dependency_overrides[get_db] = lambda: mock_db

    fake_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    fake_org = Organization(id=fake_id, name="Security Operations LLC", created_at=now)

    with patch.object(organization_service, "create", new_callable=AsyncMock) as mock_create:
        mock_create.return_value = fake_org

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/organizations",
                headers=headers,
                json={"name": "Security Operations LLC"},
            )

            assert response.status_code == 201
            data = response.json()
            assert data["id"] == str(fake_id)
            assert data["name"] == "Security Operations LLC"
            assert "created_at" in data

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_create_organization_validation_error():
    """Valida que un payload inválido retorne 422 Unprocessable Entity."""
    mock_db = AsyncMock()
    headers = _setup_admin_auth(mock_db)
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Enviar payload vacío
            response = await client.post("/api/v1/organizations", headers=headers, json={})
            assert response.status_code == 422
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_list_organizations():
    """Valida endpoint GET /api/v1/organizations con aislamiento multi-tenant."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    headers = _setup_admin_auth(mock_db, org_id)
    app.dependency_overrides[get_db] = lambda: mock_db

    now = datetime.now(timezone.utc)
    fake_org = Organization(id=org_id, name="Tenant 0", created_at=now)

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = fake_org

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/v1/organizations?skip=0&limit=10", headers=headers)

            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            assert len(data) == 1
            assert data[0]["name"] == "Tenant 0"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_organization_found():
    """Valida endpoint GET /api/v1/organizations/{id} cuando existe."""
    mock_db = AsyncMock()
    fake_id = uuid.uuid4()
    headers = _setup_admin_auth(mock_db, fake_id)
    app.dependency_overrides[get_db] = lambda: mock_db

    now = datetime.now(timezone.utc)
    fake_org = Organization(id=fake_id, name="Acme Cloud", created_at=now)

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = fake_org

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/organizations/{fake_id}", headers=headers)

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == str(fake_id)
            assert data["name"] == "Acme Cloud"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_organization_not_found():
    """Valida endpoint GET /api/v1/organizations/{id} cuando NO existe (404)."""
    mock_db = AsyncMock()
    random_id = uuid.uuid4()
    headers = _setup_admin_auth(mock_db, random_id)
    app.dependency_overrides[get_db] = lambda: mock_db

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/organizations/{random_id}", headers=headers)

            assert response.status_code == 404
            data = response.json()
            assert "no encontrada" in data["detail"]

    app.dependency_overrides.clear()
