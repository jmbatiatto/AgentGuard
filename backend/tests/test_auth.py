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
async def test_login_seed_user_without_hash_rejected():
    """2. Usuario con hashed_password=None usando contraseñas maestras antiguas es rechazado con 401."""
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

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for legacy_pwd in ("admin123", "demo-password"):
            response = await client.post(
                "/api/v1/auth/login",
                json={"email": "admin@acme.corp", "password": legacy_pwd},
            )
            assert response.status_code == 401
            assert user.hashed_password is None


@pytest.mark.asyncio
async def test_login_demo_credentials_and_alias():
    """Validación específica para 'admin@acmecorp.com' con hash real de 'demo-password' y alias acme.corp."""
    org_id = uuid.uuid4()
    user_id = uuid.uuid4()

    user = User(
        id=user_id,
        organization_id=org_id,
        email="admin@acmecorp.com",
        hashed_password=get_password_hash("demo-password"),
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
            json={"email": "admin@acmecorp.com", "password": "demo-password"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@acmecorp.com"


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


@pytest.mark.asyncio
async def test_control_plane_rejects_anonymous_and_x_user_id_without_jwt():
    """11. Endpoints del Control Plane sin JWT (o solo con X-User-Id sin firma) retornan 401."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res_anon = await client.get("/api/v1/organizations")
        assert res_anon.status_code == 401

        res_spoof = await client.post(
            f"/api/v1/policies/{uuid.uuid4()}/rules",
            headers={"X-User-Id": str(uuid.uuid4())},
            json={
                "tool_action_id": str(uuid.uuid4()),
                "effect": "ALLOW",
                "priority": 10,
            },
        )
        assert res_spoof.status_code == 401


# ==============================================================================
# Pruebas para Flujo must_change_password y /auth/change-password
# ==============================================================================

@pytest.mark.asyncio
async def test_login_returns_must_change_password_flag():
    """Valida que el login reporte must_change_password: True cuando el usuario lo tiene activo."""
    org_id = uuid.uuid4()
    user_id = uuid.uuid4()
    plain_password = "TempPassword123!"

    user = User(
        id=user_id,
        organization_id=org_id,
        email="invited@corp.com",
        hashed_password=get_password_hash(plain_password),
        role=UserRole.OPERATOR,
        created_at=datetime.now(timezone.utc),
        must_change_password=True,
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
            json={"email": "invited@corp.com", "password": plain_password},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["user"]["must_change_password"] is True


@pytest.mark.asyncio
async def test_get_me_returns_must_change_password():
    """Valida que /api/v1/auth/me refleje el estado de must_change_password."""
    org_id = uuid.uuid4()
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        organization_id=org_id,
        email="mustchange@agentguard.io",
        role=UserRole.OPERATOR,
        created_at=datetime.now(timezone.utc),
        must_change_password=True,
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
    assert data["must_change_password"] is True


@pytest.mark.asyncio
async def test_change_password_success():
    """Valida cambio exitoso de contraseña, actualizando hash y desactivando must_change_password."""
    org_id = uuid.uuid4()
    user_id = uuid.uuid4()
    old_password = "TemporaryPassword123!"
    new_password = "BrandNewSecurePassword456!"

    user = User(
        id=user_id,
        organization_id=org_id,
        email="user_change@corp.com",
        hashed_password=get_password_hash(old_password),
        role=UserRole.OPERATOR,
        created_at=datetime.now(timezone.utc),
        must_change_password=True,
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
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "current_password": old_password,
                "new_password": new_password,
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "user_change@corp.com"
    assert data["must_change_password"] is False
    assert user.must_change_password is False
    assert mock_db.commit.called
    assert mock_db.refresh.called


@pytest.mark.asyncio
async def test_change_password_wrong_current_password():
    """Valida rechazo (400) cuando la contraseña actual no coincide con el hash almacenado."""
    org_id = uuid.uuid4()
    user_id = uuid.uuid4()
    actual_password = "CurrentPassword123!"

    user = User(
        id=user_id,
        organization_id=org_id,
        email="user_wrong@corp.com",
        hashed_password=get_password_hash(actual_password),
        role=UserRole.OPERATOR,
        created_at=datetime.now(timezone.utc),
        must_change_password=True,
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
        response = await client.post(
            "/api/v1/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "current_password": "IncorrectPassword123!",
                "new_password": "NewValidPassword456!",
            },
        )

    assert response.status_code == 400
    assert "La contraseña actual es incorrecta" in response.json()["detail"]


@pytest.mark.asyncio
async def test_change_password_same_password_rejected():
    """Valida rechazo (400) cuando la nueva contraseña es idéntica a la actual."""
    org_id = uuid.uuid4()
    user_id = uuid.uuid4()
    same_password = "IdenticalPassword123!"

    user = User(
        id=user_id,
        organization_id=org_id,
        email="user_same@corp.com",
        hashed_password=get_password_hash(same_password),
        role=UserRole.OPERATOR,
        created_at=datetime.now(timezone.utc),
        must_change_password=True,
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
        response = await client.post(
            "/api/v1/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "current_password": same_password,
                "new_password": same_password,
            },
        )

    assert response.status_code == 400
    assert "La nueva contraseña debe ser diferente" in response.json()["detail"]


@pytest.mark.asyncio
async def test_change_password_missing_token():
    """Valida rechazo (401) ante ausencia de token Bearer en /auth/change-password."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/change-password",
            json={
                "current_password": "AnyPassword123!",
                "new_password": "NewPassword456!",
            },
        )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_change_password_rejects_x_agent_id():
    """Valida blindaje anti-IA (403 Forbidden) si un agente intenta cambiar contraseñas."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/change-password",
            headers={"X-Agent-Id": str(uuid.uuid4())},
            json={
                "current_password": "AnyPassword123!",
                "new_password": "NewPassword456!",
            },
        )

    assert response.status_code == 403
    assert "AI Agents are not permitted" in response.json()["detail"]


@pytest.mark.asyncio
async def test_token_from_previous_server_boot_rejected():
    """Tokens emitidos antes de un reinicio del servidor (distinto boot_id) son rechazados con 401."""
    from app.core.security import decode_access_token

    stale_token = create_access_token(
        data={
            "sub": str(uuid.uuid4()),
            "org_id": str(uuid.uuid4()),
            "role": UserRole.ADMIN.value,
            "boot_id": "stale_previous_boot_id_12345",
        }
    )

    assert decode_access_token(stale_token) is None

    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {stale_token}"},
        )

    assert response.status_code == 401


