"""Pruebas de integración para el alta autogestionada SaaS B2B (POST /api/v1/auth/register-org)."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.engine import Result

from app.core.database import get_db
from app.core.security import decode_access_token, verify_password
from app.main import app
from app.models.api_key import ApiKey
from app.models.enums import UserRole
from app.models.organization import Organization
from app.models.user import User
from app.services.api_key_service import api_key_service


@pytest.fixture(autouse=True)
def cleanup_overrides():
    """Limpia los dependency_overrides de FastAPI antes y después de cada prueba."""
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_register_org_success_atomic_onboarding():
    """Valida creación atómica de Organization + User ADMIN + ApiKey + JWT en 1 sola transacción."""
    added_entities = []

    mock_db = AsyncMock()
    mock_result = MagicMock(spec=Result)
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    mock_db.add = MagicMock(side_effect=lambda obj: added_entities.append(obj))
    mock_db.commit = AsyncMock()
    mock_db.rollback = AsyncMock()

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/register-org",
            json={
                "organization_name": "Nova FinTech S.A.",
                "admin_name": "Laura Gómez",
                "email": "  Laura.Gomez@NovaFintech.com  ",
                "password": "SuperSecurePassword2026!",
            },
        )

    assert response.status_code == 201
    data = response.json()

    assert data["token_type"] == "bearer"
    assert data["access_token"]
    assert data["user"]["email"] == "laura.gomez@novafintech.com"
    assert data["user"]["role"] == "ADMIN"
    assert data["organization"]["name"] == "Nova FinTech S.A."
    assert data["organization"]["settings"]["fail_closed"] is True
    assert data["user"]["organization_id"] == data["organization"]["id"]

    assert data["api_key"].startswith("ag_live_")
    assert data["api_key_prefix"] == data["api_key"][:12]
    assert data["api_key_id"]

    claims = decode_access_token(data["access_token"])
    assert claims is not None
    assert claims["sub"] == data["user"]["id"]
    assert claims["org_id"] == data["organization"]["id"]
    assert claims["role"] == "ADMIN"

    # Verifica transacción atómica (1 solo commit con las 3 entidades agregadas)
    mock_db.commit.assert_awaited_once()
    mock_db.rollback.assert_not_awaited()
    assert len(added_entities) == 3

    orgs = [e for e in added_entities if isinstance(e, Organization)]
    users = [e for e in added_entities if isinstance(e, User)]
    keys = [e for e in added_entities if isinstance(e, ApiKey)]
    assert len(orgs) == 1
    assert len(users) == 1
    assert len(keys) == 1

    assert users[0].hashed_password != "SuperSecurePassword2026!"
    assert verify_password("SuperSecurePassword2026!", users[0].hashed_password)
    assert keys[0].hashed_key != data["api_key"]
    assert keys[0].key_prefix == data["api_key_prefix"]
    assert keys[0].is_active is True


@pytest.mark.asyncio
async def test_register_org_duplicate_email_returns_400():
    """Valida rechazo 400 Bad Request si el correo ya existe sin confirmar transacción."""
    existing_user = User(
        id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        email="duplicado@empresa.com",
        hashed_password="hashed",
        role=UserRole.ADMIN,
        created_at=datetime.now(timezone.utc),
    )

    mock_db = AsyncMock()
    mock_result = MagicMock(spec=Result)
    mock_result.scalar_one_or_none.return_value = existing_user
    mock_db.execute.return_value = mock_result
    mock_db.add = MagicMock()
    mock_db.commit = AsyncMock()

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/register-org",
            json={
                "organization_name": "Otra Empresa",
                "admin_name": "Admin",
                "email": "duplicado@empresa.com",
                "password": "Password123!",
            },
        )

    assert response.status_code == 400
    assert "registrado" in response.json()["detail"].lower()
    mock_db.add.assert_not_called()
    mock_db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_register_org_api_key_validates_in_gateway_service():
    """Valida que la API Key inicial emitida pase verify_api_key para el Gateway Data Plane."""
    added_entities = []

    mock_db = AsyncMock()
    mock_result = MagicMock(spec=Result)
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    mock_db.add = MagicMock(side_effect=lambda obj: added_entities.append(obj))
    mock_db.commit = AsyncMock()

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/register-org",
            json={
                "organization_name": "CloudGuard Labs",
                "admin_name": "Martín Ruiz",
                "email": "martin@cloudguard.io",
                "password": "PasswordSegura99!",
            },
        )

    assert response.status_code == 201
    data = response.json()
    persisted_key = next(e for e in added_entities if isinstance(e, ApiKey))

    verify_db = AsyncMock()
    verify_res = MagicMock()
    verify_res.scalar_one_or_none.return_value = persisted_key
    verify_db.execute = AsyncMock(return_value=verify_res)

    verified = await api_key_service.verify_api_key(db=verify_db, raw_key=data["api_key"])
    assert verified is not None
    assert str(verified.organization_id) == data["organization"]["id"]

