"""Suite de Pruebas Automatizadas para Configuración de Gobernanza de Organizaciones (INC-10).

Valida de manera exhaustiva:
1. Capa de Servicio (OrganizationService):
   - Lectura de configuración con defaults seguros (Fail-Closed, sanitización, umbral autónomo, retención).
   - Actualización parcial atómica persistida en columna JSONB.
   - Emisión inmutable de eventos de auditoría forense (ORGANIZATION_SETTINGS_UPDATED).
2. Endpoints de API REST (GET / PATCH /api/v1/organizations/{org_id}/settings):
   - Consulta y actualización exitosa de parámetros de gobernanza.
   - Respuesta 404 para organizaciones inexistentes.
   - Blindaje Anti-IA estricto (403 Forbidden cuando X-Agent-Id está presente).
   - Aislamiento Multi-Tenant estricto (403 Forbidden ante intentos de acceso cruzado entre organizaciones).
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional
import uuid
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.enums import ActorType, UserRole
from app.models.organization import Organization
from app.models.user import User
from app.schemas.organization import (
    OrganizationSettings,
    OrganizationSettingsUpdate,
)
from app.services.organization_service import (
    DEFAULT_ORGANIZATION_SETTINGS,
    organization_service,
)


# ==============================================================================
# 1. Pruebas Unitarias de la Capa de Servicio (OrganizationService)
# ==============================================================================

@pytest.mark.asyncio
async def test_service_get_settings_defaults():
    """Valida que get_settings retorne los valores por defecto cuando la columna settings está vacía."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    org = Organization(id=org_id, name="Acme Corp Default", settings={})

    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = org
    mock_db.execute.return_value = res_mock

    settings = await organization_service.get_settings(db=mock_db, org_id=org_id)

    assert settings is not None
    assert settings.fail_closed is True
    assert settings.mask_sensitive is True
    assert settings.max_autonomous_amount == 5000.0
    assert settings.retention_days == 90


@pytest.mark.asyncio
async def test_service_get_settings_nonexistent_org():
    """Valida que get_settings retorne None si la organización no existe."""
    mock_db = AsyncMock()
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = res_mock

    settings = await organization_service.get_settings(db=mock_db, org_id=uuid.uuid4())
    assert settings is None


@pytest.mark.asyncio
async def test_service_update_settings_single_field():
    """Valida que update_settings actualice un campo individual manteniendo el resto con defaults."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    org = Organization(id=org_id, name="Acme Corp", settings={})

    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = org
    mock_db.execute.return_value = res_mock

    with patch("app.services.organization_service.audit_service.log_audit_event", new_callable=AsyncMock) as mock_audit:
        update_data = OrganizationSettingsUpdate(mask_sensitive=False)
        updated = await organization_service.update_settings(
            db=mock_db,
            org_id=org_id,
            update_data=update_data,
        )

        assert updated is not None
        assert updated.mask_sensitive is False
        assert updated.fail_closed is True
        assert updated.max_autonomous_amount == 5000.0
        assert updated.retention_days == 90

        # Verificar persistencia en el modelo
        assert org.settings["mask_sensitive"] is False
        assert mock_db.commit.called
        assert mock_db.refresh.called

        # Verificar auditoría forense
        assert mock_audit.called
        call_kwargs = mock_audit.call_args.kwargs
        assert call_kwargs["event_type"] == "ORGANIZATION_SETTINGS_UPDATED"
        assert call_kwargs["metadata"]["updated_fields"] == {"mask_sensitive": False}


@pytest.mark.asyncio
async def test_service_update_settings_multiple_fields():
    """Valida la actualización concurrente de múltiples parámetros de gobernanza."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    org = Organization(
        id=org_id,
        name="Acme Corp Global",
        settings={"mask_sensitive": True, "fail_closed": True},
    )

    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = org
    mock_db.execute.return_value = res_mock

    with patch("app.services.organization_service.audit_service.log_audit_event", new_callable=AsyncMock) as mock_audit:
        update_data = OrganizationSettingsUpdate(
            fail_closed=False,
            max_autonomous_amount=15000.0,
            retention_days=180,
        )
        updated = await organization_service.update_settings(
            db=mock_db,
            org_id=org_id,
            update_data=update_data,
        )

        assert updated is not None
        assert updated.fail_closed is False
        assert updated.max_autonomous_amount == 15000.0
        assert updated.retention_days == 180
        # mask_sensitive se mantiene en True desde la configuración previa
        assert updated.mask_sensitive is True

        assert org.settings["fail_closed"] is False
        assert org.settings["max_autonomous_amount"] == 15000.0
        assert org.settings["retention_days"] == 180
        assert mock_db.commit.called


@pytest.mark.asyncio
async def test_service_update_settings_nonexistent_org():
    """Valida que update_settings retorne None para organizaciones no encontradas."""
    mock_db = AsyncMock()
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = res_mock

    result = await organization_service.update_settings(
        db=mock_db,
        org_id=uuid.uuid4(),
        update_data=OrganizationSettingsUpdate(retention_days=60),
    )
    assert result is None


# ==============================================================================
# 2. Pruebas de Endpoints de API REST (GET / PATCH)
# ==============================================================================

@pytest.mark.asyncio
async def test_api_get_settings_success():
    """Valida que GET /api/v1/organizations/{org_id}/settings devuelva la configuración del tenant."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    org = Organization(
        id=org_id,
        name="Acme Corp",
        settings={
            "fail_closed": True,
            "mask_sensitive": True,
            "max_autonomous_amount": 8000.0,
            "retention_days": 180,
        },
    )

    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = org
    mock_db.execute.return_value = res_mock

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/organizations/{org_id}/settings")
            assert res.status_code == 200
            data = res.json()
            assert data["fail_closed"] is True
            assert data["mask_sensitive"] is True
            assert data["max_autonomous_amount"] == 8000.0
            assert data["retention_days"] == 180
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_settings_not_found():
    """Valida que GET /api/v1/organizations/{org_id}/settings devuelva 404 si el tenant no existe."""
    mock_db = AsyncMock()
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = res_mock

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/organizations/{uuid.uuid4()}/settings")
            assert res.status_code == 404
            assert "no encontrada" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_patch_settings_success():
    """Valida que PATCH /api/v1/organizations/{org_id}/settings actualice la configuración."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    org = Organization(id=org_id, name="Acme Corp", settings={})

    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = org
    mock_db.execute.return_value = res_mock

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "mask_sensitive": False,
                "max_autonomous_amount": 10000.0,
                "retention_days": 365,
            }
            with patch("app.services.organization_service.audit_service.log_audit_event", new_callable=AsyncMock):
                res = await client.patch(f"/api/v1/organizations/{org_id}/settings", json=payload)
                assert res.status_code == 200
                data = res.json()
                assert data["mask_sensitive"] is False
                assert data["max_autonomous_amount"] == 10000.0
                assert data["retention_days"] == 365
                assert data["fail_closed"] is True  # Mantiene default
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_patch_settings_not_found():
    """Valida que PATCH devuelva 404 si la organización no existe."""
    mock_db = AsyncMock()
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = res_mock

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.patch(
                f"/api/v1/organizations/{uuid.uuid4()}/settings",
                json={"retention_days": 30},
            )
            assert res.status_code == 404
            assert "no encontrada" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


# ==============================================================================
# 3. Blindaje Anti-IA y Aislamiento Multi-Tenant
# ==============================================================================

@pytest.mark.asyncio
async def test_api_anti_ia_shield_blocks_agent_on_get():
    """Valida que GET /settings rechace llamadas provenientes de agentes de IA (403 Forbidden)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-Agent-Id": str(uuid.uuid4())}
            res = await client.get(
                f"/api/v1/organizations/{uuid.uuid4()}/settings",
                headers=headers,
            )
            assert res.status_code == 403
            assert "AI Agents are not permitted" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_anti_ia_shield_blocks_agent_on_patch():
    """Valida que PATCH /settings rechace llamadas de agentes de IA intentando alterar la gobernanza."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-Agent-Id": str(uuid.uuid4())}
            res = await client.patch(
                f"/api/v1/organizations/{uuid.uuid4()}/settings",
                headers=headers,
                json={"fail_closed": False},
            )
            assert res.status_code == 403
            assert "AI Agents are not permitted" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_multi_tenant_isolation_get_cross_tenant_denied():
    """Valida que un administrador de Tenant A no pueda consultar configuración de Tenant B (403)."""
    mock_db = AsyncMock()
    org_a_id = uuid.uuid4()
    org_b_id = uuid.uuid4()
    admin_user = User(
        id=uuid.uuid4(),
        organization_id=org_a_id,
        email="admin.a@corp.com",
        role=UserRole.ADMIN,
    )

    # Cuando require_admin_user busca al usuario
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    mock_db.execute.return_value = res_user

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            # Intento de consultar Tenant B
            res = await client.get(
                f"/api/v1/organizations/{org_b_id}/settings",
                headers=headers,
            )
            assert res.status_code == 403
            assert "No tiene autorización para consultar la configuración de otra organización" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_multi_tenant_isolation_patch_cross_tenant_denied():
    """Valida que un administrador de Tenant A no pueda mutar la configuración de Tenant B (403)."""
    mock_db = AsyncMock()
    org_a_id = uuid.uuid4()
    org_b_id = uuid.uuid4()
    admin_user = User(
        id=uuid.uuid4(),
        organization_id=org_a_id,
        email="admin.a@corp.com",
        role=UserRole.ADMIN,
    )

    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    mock_db.execute.return_value = res_user

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            # Intento de mutar Tenant B
            res = await client.patch(
                f"/api/v1/organizations/{org_b_id}/settings",
                headers=headers,
                json={"fail_closed": False},
            )
            assert res.status_code == 403
            assert "No tiene autorización para modificar la configuración de otra organización" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_admin_user_same_tenant_allowed():
    """Valida que un administrador legítimo acceda exitosamente a la configuración de su propio tenant."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    admin_user = User(
        id=uuid.uuid4(),
        organization_id=org_id,
        email="admin@acme.corp",
        role=UserRole.ADMIN,
    )
    org = Organization(
        id=org_id,
        name="Acme Corp",
        settings={"retention_days": 60},
    )

    # El primer execute es para require_admin_user (User), el segundo para OrganizationService (Organization)
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_org = MagicMock()
    res_org.scalar_one_or_none.return_value = org

    async def mock_execute(stmt):
        stmt_str = str(stmt).lower()
        if "users" in stmt_str:
            return res_user
        return res_org

    mock_db.execute.side_effect = mock_execute

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            res = await client.get(
                f"/api/v1/organizations/{org_id}/settings",
                headers=headers,
            )
            assert res.status_code == 200
            data = res.json()
            assert data["retention_days"] == 60
            assert data["fail_closed"] is True
    finally:
        app.dependency_overrides.clear()
