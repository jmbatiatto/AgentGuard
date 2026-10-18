"""Pruebas automatizadas para el Service y API REST de Usuarios."""

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
from app.schemas.user import UserCreate
from app.services.organization_service import organization_service
from app.services.user_service import user_service


# ==============================================================================
# Pruebas de la Capa de Servicio (UserService)
# ==============================================================================

@pytest.mark.asyncio
async def test_user_service_create():
    """Valida la creación y persistencia de un usuario."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    org_id = uuid.uuid4()
    user_in = UserCreate(organization_id=org_id, email="alice@corp.com", role=UserRole.ADMIN)

    async def mock_refresh(instance):
        instance.id = uuid.uuid4()
        instance.created_at = datetime.now(timezone.utc)

    mock_db.refresh.side_effect = mock_refresh

    result = await user_service.create(db=mock_db, user_in=user_in)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once()
    assert result.email == "alice@corp.com"
    assert result.role == UserRole.ADMIN
    assert result.organization_id == org_id


@pytest.mark.asyncio
async def test_user_service_get_by_id():
    """Valida la búsqueda de usuario por UUID."""
    mock_db = AsyncMock()
    user_id = uuid.uuid4()
    mock_user = User(
        id=user_id,
        organization_id=uuid.uuid4(),
        email="bob@corp.com",
        role=UserRole.OPERATOR,
        created_at=datetime.now(timezone.utc),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_user
    mock_db.execute.return_value = mock_result

    result = await user_service.get_by_id(db=mock_db, user_id=user_id)

    mock_db.execute.assert_awaited_once()
    assert result is not None
    assert result.id == user_id
    assert result.email == "bob@corp.com"


@pytest.mark.asyncio
async def test_user_service_get_by_email():
    """Valida la búsqueda de usuario por email corporativo."""
    mock_db = AsyncMock()
    mock_user = User(
        id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        email="unique@corp.com",
        role=UserRole.APPROVER,
        created_at=datetime.now(timezone.utc),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_user
    mock_db.execute.return_value = mock_result

    result = await user_service.get_by_email(db=mock_db, email="unique@corp.com")

    mock_db.execute.assert_awaited_once()
    assert result is not None
    assert result.email == "unique@corp.com"


@pytest.mark.asyncio
async def test_user_service_list_by_org():
    """Valida el listado con filtro de organización multi-tenant."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    mock_users = [
        User(id=uuid.uuid4(), organization_id=org_id, email=f"user{i}@corp.com", created_at=now)
        for i in range(2)
    ]

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_users
    mock_db.execute.return_value = mock_result

    result = await user_service.list_by_org(db=mock_db, organization_id=org_id, skip=0, limit=10)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 2
    assert result[0].email == "user0@corp.com"


# ==============================================================================
# Pruebas de Endpoints HTTP (/api/v1/users)
# ==============================================================================

@pytest.mark.asyncio
async def test_api_create_user_success():
    """Valida registro exitoso de usuario (201 Created)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    fake_user_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    fake_org = Organization(id=org_id, name="FinTech Corp", created_at=now)
    fake_user = User(
        id=fake_user_id,
        organization_id=org_id,
        email="operator@fintech.com",
        role=UserRole.OPERATOR,
        created_at=now,
    )

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org, \
         patch.object(user_service, "get_by_email", new_callable=AsyncMock) as mock_get_email, \
         patch.object(user_service, "create", new_callable=AsyncMock) as mock_create_user:

        mock_get_org.return_value = fake_org
        mock_get_email.return_value = None
        mock_create_user.return_value = fake_user

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/users",
                json={
                    "organization_id": str(org_id),
                    "email": "operator@fintech.com",
                    "role": "OPERATOR",
                },
            )

            assert response.status_code == 201
            data = response.json()
            assert data["id"] == str(fake_user_id)
            assert data["email"] == "operator@fintech.com"
            assert data["role"] == "OPERATOR"
            assert data["organization_id"] == str(org_id)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_create_user_organization_not_found():
    """Valida que si la organización no existe devuelva 404."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    missing_org_id = uuid.uuid4()

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org:
        mock_get_org.return_value = None

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/users",
                json={
                    "organization_id": str(missing_org_id),
                    "email": "user@nonexistent.com",
                },
            )

            assert response.status_code == 404
            assert "no encontrada" in response.json()["detail"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_create_user_email_conflict():
    """Valida que si el email ya existe devuelva 409 Conflict."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    fake_org = Organization(id=org_id, name="HealthTech Corp", created_at=datetime.now(timezone.utc))
    existing_user = User(
        id=uuid.uuid4(),
        organization_id=org_id,
        email="duplicate@health.com",
        role=UserRole.VIEWER,
        created_at=datetime.now(timezone.utc),
    )

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org, \
         patch.object(user_service, "get_by_email", new_callable=AsyncMock) as mock_get_email:

        mock_get_org.return_value = fake_org
        mock_get_email.return_value = existing_user

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/users",
                json={
                    "organization_id": str(org_id),
                    "email": "duplicate@health.com",
                },
            )

            assert response.status_code == 409
            assert "Ya existe un usuario registrado" in response.json()["detail"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_list_users():
    """Valida listado de usuarios con parámetro de filtro por organización."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    fake_users = [
        User(id=uuid.uuid4(), organization_id=org_id, email=f"staff{i}@corp.com", role=UserRole.OPERATOR, created_at=now)
        for i in range(2)
    ]

    with patch.object(user_service, "list_by_org", new_callable=AsyncMock) as mock_list:
        mock_list.return_value = fake_users

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/users?organization_id={org_id}&skip=0&limit=10")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["email"] == "staff0@corp.com"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_user_found():
    """Valida consulta de usuario existente por UUID."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    user_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    fake_user = User(
        id=user_id,
        organization_id=uuid.uuid4(),
        email="target@corp.com",
        role=UserRole.AUDITOR,
        created_at=now,
    )

    with patch.object(user_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = fake_user

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/users/{user_id}")

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == str(user_id)
            assert data["email"] == "target@corp.com"
            assert data["role"] == "AUDITOR"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_user_not_found():
    """Valida consulta de usuario inexistente (404)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    with patch.object(user_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None

        random_id = uuid.uuid4()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/users/{random_id}")

            assert response.status_code == 404
            assert "no encontrado" in response.json()["detail"]

    app.dependency_overrides.clear()
