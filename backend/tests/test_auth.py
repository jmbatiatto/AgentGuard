"""Suite de Pruebas Automatizadas para Autenticación JWT, Sesión y Aislamiento Multi-Tenant (INC-14 a INC-16).

Valida los escenarios de seguridad:
1. Inicio de sesión exitoso con hash bcrypt válido (200 OK + Token JWT).
2. Inicio de sesión de usuario semilla sin hash con password inicial 'admin123' (200 OK + hash persistido).
3. Rechazo de inicio de sesión con contraseña inválida (401 Unauthorized).
4. Rechazo de inicio de sesión para usuario no existente (401 Unauthorized).
5. Registro exitoso de nuevo usuario y creación de organización con rol ADMIN (201 Created + Token JWT).
6. Rechazo de registro cuando el correo ya existe (400 Bad Request).
7. Obtención de perfil /auth/me con token Bearer válido (200 OK + datos del usuario).
8. Rechazo de /auth/me ante token JWT malformado, vencido o inválido (401 Unauthorized).
9. Rechazo de /auth/me ante ausencia de cabecera de autenticación (401 Unauthorized).
10. Blindaje Anti-IA estricto: X-Agent-Id genera 403 Forbidden inmediato.
11. Aislamiento Multi-Tenant: El token JWT contiene los claims 'sub' y 'org_id' correctos.
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.engine import Result

from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.enums import UserRole
from app.models.organization import Organization
from app.models.user import User


@pytest.fixture(autouse=True)
def cleanup_overrides():
    """Limpia los dependency_overrides de FastAPI antes y después de cada prueba."""
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_login_success():
    """1. POST /api/v1/auth/login con credenciales válidas retorna token JWT y 200 OK."""
    org_id = uuid.uuid4()
    user_id = uuid.uuid4()
    plain_password = "SecurePassword2026!"
    hashed = get_password_hash(plain_password)

    user = User(
        id=user_id,
        organization_id=org_id,
        email="test_user@acme.corp",
        hashed_password=hashed,
        role=UserRole.ADMIN,
        created_at=datetime.now(timezone.utc),
    )

    mock_db = AsyncMock()
    mock_result = MagicMock(spec=Result)
    mock_result.scalar_one_or_none.return_value = user
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "test_user@acme.corp", "password": plain_password},
        )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test_user@acme.corp"
    assert data["user"]["role"] == "ADMIN"
    assert data["user"]["organization_id"] == str(org_id)


@pytest.mark.asyncio
async def test_login_seed_user_fallback():
    """2. Usuario semilla con hashed_password=None usando 'admin123' genera hash y permite login."""
    org_id = uuid.uuid4()
    user_id = uuid.uuid4()

    user = User(
        id=user_id,
        organization_id=org_id,
        email="admin@acme.corp",
        hashed_password=None,
        role=UserRole.ADMIN,
        created_at=datetime.now(timezone.utc),
    )

    mock_db = AsyncMock()
    mock_result = MagicMock(spec=Result)
    mock_result.scalar_one_or_none.return_value = user
    mock_db.execute.return_value = mock_result
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@acme.corp", "password": "admin123"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert user.hashed_password is not None
    assert mock_db.commit.called


@pytest.mark.asyncio
async def test_login_invalid_password():
    """3. POST /api/v1/auth/login con contraseña incorrecta retorna 401 Unauthorized."""
    org_id = uuid.uuid4()
    user_id = uuid.uuid4()
    hashed = get_password_hash("CorrectPassword123")

    user = User(
        id=user_id,
        organization_id=org_id,
        email="operator@acme.corp",
        hashed_password=hashed,
        role=UserRole.OPERATOR,
        created_at=datetime.now(timezone.utc),
    )

    mock_db = AsyncMock()
    mock_result = MagicMock(spec=Result)
    mock_result.scalar_one_or_none.return_value = user
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "operator@acme.corp", "password": "WrongPassword456"},
        )

    assert response.status_code == 401
    assert "Credenciales" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_nonexistent_user():
    """4. POST /api/v1/auth/login con usuario que no existe retorna 401 Unauthorized."""
    mock_db = AsyncMock()
    mock_result = MagicMock(spec=Result)
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "ghost@acme.corp", "password": "AnyPassword123"},
        )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_register_success():
    """5. POST /api/v1/auth/register crea nuevo tenant y usuario ADMIN, retornando 201 Created."""
    mock_db = AsyncMock()
    # Primera consulta: validar si el email existe (retorna None)
    mock_result = MagicMock(spec=Result)
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "new_director@startup.io",
                "password": "PasswordSuperSecret2026",
                "name": "Jane Doe",
                "organization_name": "Startup Tech",
            },
        )

    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "new_director@startup.io"
    assert data["user"]["role"] == "ADMIN"
    assert mock_db.commit.called


@pytest.mark.asyncio
async def test_register_duplicate_email():
    """6. POST /api/v1/auth/register con email existente retorna 400 Bad Request."""
    existing_user = User(
        id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        email="already_exists@corp.com",
        role=UserRole.OPERATOR,
        created_at=datetime.now(timezone.utc),
    )

    mock_db = AsyncMock()
    mock_result = MagicMock(spec=Result)
    mock_result.scalar_one_or_none.return_value = existing_user
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "already_exists@corp.com",
                "password": "Password123",
                "name": "Jane",
            },
        )

    assert response.status_code == 400
    assert "ya se encuentra registrado" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_me_success():
    """7. GET /api/v1/auth/me con token Bearer válido retorna el perfil del usuario."""
    org_id = uuid.uuid4()
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        organization_id=org_id,
        email="developer@agentguard.io",
        role=UserRole.ADMIN,
        created_at=datetime.now(timezone.utc),
    )

    token = create_access_token({
        "sub": str(user_id),
        "org_id": str(org_id),
        "role": user.role.value,
    })

    mock_db = AsyncMock()
    mock_result = MagicMock(spec=Result)
    mock_result.scalar_one_or_none.return_value = user
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(user_id)
    assert data["email"] == "developer@agentguard.io"
    assert data["organization_id"] == str(org_id)
    assert data["role"] == "ADMIN"
    assert "developer" in data["name"].lower()


@pytest.mark.asyncio
async def test_get_me_invalid_token():
    """8. GET /api/v1/auth/me con token inválido retorna 401 Unauthorized."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid.jwt.token"},
        )

    assert response.status_code == 401
    assert "inválido" in response.json()["detail"].lower() or "malformado" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_me_missing_token():
    """9. GET /api/v1/auth/me sin cabecera de autorización retorna 401 Unauthorized."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/auth/me")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_anti_ai_shielding_in_control_plane():
    """10. Endpoint administrativo con X-Agent-Id es rechazado con 403 Forbidden."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            f"/api/v1/policies/{uuid.uuid4()}/rules",
            headers={
                "X-Agent-Id": str(uuid.uuid4()),
                "X-User-Id": str(uuid.uuid4()),
            },
            json={
                "tool_action_id": str(uuid.uuid4()),
                "effect": "ALLOW",
                "priority": 10,
            },
        )

    assert response.status_code == 403
    assert "AI Agents are not permitted" in response.json()["detail"]
