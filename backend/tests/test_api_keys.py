"""Suite de Pruebas Automatizadas para API Keys PEP (INC-08).

Valida exhaustivamente:
1. Creación criptográfica en ApiKeyService (prefijo ag_live_, hash SHA-256, entropía secrets).
2. Verificación y ciclo de vida (soft delete is_active=False, control de expiración).
3. Endpoints REST: POST /api/v1/api-keys, GET /api/v1/api-keys, GET /api/v1/api-keys/{id}, DELETE /api/v1/api-keys/{id}.
4. Retorno único de secreto en plano en POST, y no fuga en listado/consulta (sin plaintext ni hash).
5. Blindaje Anti-IA estricto (bloqueo con 403 si X-Agent-Id está presente).
6. Aislamiento Multi-Tenant estricto (bloqueo/rechazo ante acceso cruzado entre tenants).
"""

from datetime import datetime, timedelta, timezone
import hashlib
import uuid
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.api_key import ApiKey
from app.models.enums import UserRole
from app.models.organization import Organization
from app.models.user import User
from app.schemas.api_key import ApiKeyCreate, ApiKeyCreatedResponse, ApiKeyResponse
from app.services.api_key_service import api_key_service
from app.services.organization_service import organization_service


# ==============================================================================
# 1. Pruebas Unitarias de la Capa de Servicio (ApiKeyService)
# ==============================================================================

@pytest.mark.asyncio
async def test_service_create_api_key_generates_prefix_and_sha256_hash():
    """Valida que create_api_key genere clave con prefijo corporativo y hash SHA-256."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    org_id = uuid.uuid4()
    key_name = "Servicio Invocador de Herramientas"

    api_key, raw_key = await api_key_service.create_api_key(
        db=mock_db,
        org_id=org_id,
        name=key_name,
        expires_in_days=30,
    )

    # 1. Validar prefijo y formato de clave en plano
    assert raw_key.startswith("ag_live_")
    assert len(raw_key) > 30
    assert api_key.key_prefix == raw_key[:12]
    assert len(api_key.key_prefix) == 12

    # 2. Validar que la base de datos guarde el hash SHA-256 y NO la clave en plano
    expected_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
    assert api_key.hashed_key == expected_hash
    assert api_key.hashed_key != raw_key

    # 3. Validar atributos de tenant y ciclo de vida
    assert api_key.organization_id == org_id
    assert api_key.name == key_name
    assert api_key.is_active is True
    assert api_key.expires_at is not None
    assert api_key.expires_at > datetime.now(timezone.utc)

    # 4. Validar que se guardó en la sesión
    assert mock_db.commit.called
    assert mock_db.refresh.called


@pytest.mark.asyncio
async def test_service_verify_api_key_lifecycle():
    """Valida la verificación en tiempo de ejecución de claves válidas, inválidas, expiradas e inactivas."""
    mock_db = AsyncMock()
    raw_key = "ag_live_supersecrettoken1234567890abcdef"
    prefix = raw_key[:12]
    hashed = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    # Caso A: Clave activa y vigente
    active_key = ApiKey(
        id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        name="Key Activa",
        key_prefix=prefix,
        hashed_key=hashed,
        is_active=True,
        expires_at=datetime.now(timezone.utc) + timedelta(days=10),
    )
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = active_key
    mock_db.execute.return_value = res_mock

    verified = await api_key_service.verify_api_key(db=mock_db, raw_key=raw_key)
    assert verified is not None
    assert verified.id == active_key.id

    # Caso B: Clave expirada
    expired_key = ApiKey(
        id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        name="Key Expirada",
        key_prefix=prefix,
        hashed_key=hashed,
        is_active=True,
        expires_at=datetime.now(timezone.utc) - timedelta(days=1),
    )
    res_mock.scalar_one_or_none.return_value = expired_key
    verified_expired = await api_key_service.verify_api_key(db=mock_db, raw_key=raw_key)
    assert verified_expired is None

    # Caso C: Clave no encontrada (hash incorrecto)
    res_mock.scalar_one_or_none.return_value = None
    verified_none = await api_key_service.verify_api_key(db=mock_db, raw_key=raw_key)
    assert verified_none is None


@pytest.mark.asyncio
async def test_service_revoke_api_key_soft_delete():
    """Valida que la revocación sea un borrado lógico estableciendo is_active=False."""
    mock_db = AsyncMock()
    key_id = uuid.uuid4()
    org_id = uuid.uuid4()

    key = ApiKey(
        id=key_id,
        organization_id=org_id,
        name="Key Para Revocar",
        key_prefix="ag_live_1234",
        hashed_key="dummyhash",
        is_active=True,
    )

    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = key
    mock_db.execute.return_value = res_mock

    success = await api_key_service.revoke_api_key(db=mock_db, key_id=key_id, org_id=org_id)
    assert success is True
    assert key.is_active is False
    assert mock_db.commit.called


@pytest.mark.asyncio
async def test_service_revoke_nonexistent_or_cross_tenant_fails():
    """Valida que intentar revocar una clave inexistente o de otro tenant retorne False."""
    mock_db = AsyncMock()
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = res_mock

    success = await api_key_service.revoke_api_key(db=mock_db, key_id=uuid.uuid4(), org_id=uuid.uuid4())
    assert success is False


# ==============================================================================
# 2. Pruebas de Endpoints de API REST y Blindaje Anti-IA
# ==============================================================================

@pytest.mark.asyncio
async def test_api_create_api_key_returns_raw_key_once_and_hides_hash():
    """Valida que POST /api/v1/api-keys retorne api_key en texto plano y no exponga el hash."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    org_id = uuid.uuid4()

    fake_org = Organization(id=org_id, name="Acme Security Corp")
    res_org = MagicMock()
    res_org.scalar_one_or_none.return_value = fake_org
    mock_db.execute.return_value = res_org

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "organization_id": str(org_id),
                "name": "Integration Worker Key",
                "expires_in_days": 60,
            }
            res = await client.post("/api/v1/api-keys", json=payload)
            assert res.status_code == 201
            data = res.json()

            # Verificar que api_key en plano esté presente
            assert "api_key" in data
            assert data["api_key"].startswith("ag_live_")
            assert data["name"] == "Integration Worker Key"
            assert data["key_prefix"] == data["api_key"][:12]
            assert data["is_active"] is True
            assert data["expires_at"] is not None

            # Verificar que hashed_key NO sea expuesto
            assert "hashed_key" not in data
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_create_api_key_org_not_found():
    """Valida que POST /api/v1/api-keys con organización inexistente devuelva 404."""
    mock_db = AsyncMock()
    res_org = MagicMock()
    res_org.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = res_org

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "organization_id": str(uuid.uuid4()),
                "name": "Orphan Key",
            }
            res = await client.post("/api/v1/api-keys", json=payload)
            assert res.status_code == 404
            assert "no encontrada" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_create_api_key_blocks_ai_agents():
    """Valida que el blindaje Anti-IA bloquee solicitudes con cabecera X-Agent-Id con 403."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-Agent-Id": str(uuid.uuid4())}
            payload = {
                "organization_id": str(uuid.uuid4()),
                "name": "Hostile Agent Key",
            }
            res = await client.post("/api/v1/api-keys", json=payload, headers=headers)
            assert res.status_code == 403
            assert "AI Agents are not permitted" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_list_api_keys_does_not_leak_plaintext_or_hash():
    """Valida que GET /api/v1/api-keys liste metadatos seguros sin clave en plano ni hash."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    key_id = uuid.uuid4()

    fake_key = ApiKey(
        id=key_id,
        organization_id=org_id,
        name="Production Key",
        key_prefix="ag_live_abcd",
        hashed_key="sha256hashedvaluecannotbeseen",
        created_at=datetime.now(timezone.utc),
        expires_at=None,
        is_active=True,
    )

    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [fake_key]
    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/api-keys?organization_id={org_id}")
            assert res.status_code == 200
            data = res.json()
            assert len(data) == 1

            item = data[0]
            assert item["id"] == str(key_id)
            assert item["name"] == "Production Key"
            assert item["key_prefix"] == "ag_live_abcd"
            assert item["is_active"] is True

            # NO debe contener secreto en plano ni hash
            assert "api_key" not in item
            assert "hashed_key" not in item
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_list_api_keys_blocks_ai_agents():
    """Valida que GET /api/v1/api-keys bloquee agentes de IA con 403."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-Agent-Id": str(uuid.uuid4())}
            res = await client.get("/api/v1/api-keys", headers=headers)
            assert res.status_code == 403
            assert "AI Agents are not permitted" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_api_key_by_id_success():
    """Valida que GET /api/v1/api-keys/{id} retorne la llave solicitada."""
    mock_db = AsyncMock()
    key_id = uuid.uuid4()
    org_id = uuid.uuid4()

    fake_key = ApiKey(
        id=key_id,
        organization_id=org_id,
        name="Specific Key",
        key_prefix="ag_live_spec",
        hashed_key="supersecurehash",
        created_at=datetime.now(timezone.utc),
        is_active=True,
    )

    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = fake_key
    mock_db.execute.return_value = res_mock

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/api-keys/{key_id}")
            assert res.status_code == 200
            data = res.json()
            assert data["id"] == str(key_id)
            assert data["name"] == "Specific Key"
            assert data["key_prefix"] == "ag_live_spec"
            assert "api_key" not in data
            assert "hashed_key" not in data
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_api_key_by_id_not_found():
    """Valida que GET /api/v1/api-keys/{id} devuelva 404 si la llave no existe."""
    mock_db = AsyncMock()
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = res_mock

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/api-keys/{uuid.uuid4()}")
            assert res.status_code == 404
            assert "no encontrada" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_revoke_api_key_success():
    """Valida que DELETE /api/v1/api-keys/{id} marque la llave como inactiva con 200 OK."""
    mock_db = AsyncMock()
    key_id = uuid.uuid4()
    org_id = uuid.uuid4()

    fake_key = ApiKey(
        id=key_id,
        organization_id=org_id,
        name="Key To Revoke",
        key_prefix="ag_live_revo",
        hashed_key="hashvalue",
        is_active=True,
    )

    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = fake_key
    mock_db.execute.return_value = res_mock

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.delete(f"/api/v1/api-keys/{key_id}")
            assert res.status_code == 200
            data = res.json()
            assert data["is_active"] is False
            assert "revocada exitosamente" in data["message"]
            assert fake_key.is_active is False
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_revoke_api_key_blocks_ai_agents():
    """Valida que DELETE /api/v1/api-keys/{id} con X-Agent-Id sea bloqueado con 403."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-Agent-Id": str(uuid.uuid4())}
            res = await client.delete(f"/api/v1/api-keys/{uuid.uuid4()}", headers=headers)
            assert res.status_code == 403
            assert "AI Agents are not permitted" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_multi_tenant_isolation_cross_tenant_forbidden():
    """Valida que un administrador de Org A no pueda acceder a API Keys de Org B."""
    mock_db = AsyncMock()
    org_a = uuid.uuid4()
    org_b = uuid.uuid4()

    admin_org_a = User(
        id=uuid.uuid4(),
        organization_id=org_a,
        email="admin_a@corp.com",
        role=UserRole.ADMIN,
    )

    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_org_a
    mock_db.execute.return_value = res_user

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_org_a.id)}

            # Intento de listar llaves de Org B
            res = await client.get(f"/api/v1/api-keys?organization_id={org_b}", headers=headers)
            assert res.status_code == 403
            assert "No tiene permisos para ver API Keys de otra organización" in res.json()["detail"]

            # Intento de crear llave para Org B
            payload = {
                "organization_id": str(org_b),
                "name": "Hostile Key",
            }
            fake_org_b = Organization(id=org_b, name="Org B")
            res_org = MagicMock()
            res_org.scalar_one_or_none.return_value = fake_org_b
            mock_db.execute.side_effect = [res_user, res_org]

            res_post = await client.post("/api/v1/api-keys", json=payload, headers=headers)
            assert res_post.status_code == 403
            assert "No tiene autorización para crear API Keys para otra organización" in res_post.json()["detail"]
    finally:
        app.dependency_overrides.clear()
