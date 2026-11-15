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
from tests.conftest import make_admin_jwt


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
    assert settings.siem_format == "splunk"


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
    admin_user = User(id=uuid.uuid4(), organization_id=org_id, email="admin@acme.corp", role=UserRole.ADMIN)
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

    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = org
    mock_db.execute.side_effect = [res_user, res_mock]

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(
                f"/api/v1/organizations/{org_id}/settings",
                headers=make_admin_jwt(admin_user),
            )
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
    missing_org_id = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=missing_org_id, email="admin@acme.corp", role=UserRole.ADMIN)
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = None
    mock_db.execute.side_effect = [res_user, res_mock]

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(
                f"/api/v1/organizations/{missing_org_id}/settings",
                headers=make_admin_jwt(admin_user),
            )
            assert res.status_code == 404
            assert "no encontrada" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_patch_settings_success():
    """Valida que PATCH /api/v1/organizations/{org_id}/settings actualice la configuración."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=org_id, email="admin@acme.corp", role=UserRole.ADMIN)
    org = Organization(id=org_id, name="Acme Corp", settings={})

    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = org
    mock_db.execute.side_effect = [res_user, res_mock]

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
                res = await client.patch(
                    f"/api/v1/organizations/{org_id}/settings",
                    json=payload,
                    headers=make_admin_jwt(admin_user),
                )
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
    missing_org_id = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=missing_org_id, email="admin@acme.corp", role=UserRole.ADMIN)
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = None
    mock_db.execute.side_effect = [res_user, res_mock]

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.patch(
                f"/api/v1/organizations/{missing_org_id}/settings",
                json={"retention_days": 30},
                headers=make_admin_jwt(admin_user),
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
            headers = make_admin_jwt(admin_user)
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
            headers = make_admin_jwt(admin_user)
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
            headers = make_admin_jwt(admin_user)
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


# ==============================================================================
# 4. Pruebas de Persistencia y Validación de siem_format y Webhooks SIEM
# ==============================================================================

@pytest.mark.asyncio
async def test_service_update_settings_siem_format():
    """Valida la persistencia de siem_format y la auditoría forense."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    org = Organization(id=org_id, name="Acme Corp SIEM", settings={})

    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = org
    mock_db.execute.return_value = res_mock

    with patch("app.services.organization_service.audit_service.log_audit_event", new_callable=AsyncMock) as mock_audit:
        update_data = OrganizationSettingsUpdate(siem_format="datadog")
        updated = await organization_service.update_settings(
            db=mock_db,
            org_id=org_id,
            update_data=update_data,
        )

        assert updated is not None
        assert updated.siem_format == "datadog"
        assert org.settings["siem_format"] == "datadog"
        assert mock_db.commit.called
        assert mock_audit.called
        assert mock_audit.call_args.kwargs["metadata"]["updated_fields"] == {"siem_format": "datadog"}


@pytest.mark.asyncio
@pytest.mark.parametrize("fmt", ["splunk", "datadog", "elastic", "slack"])
async def test_api_patch_settings_siem_formats_all_valid(fmt: str):
    """Valida que todos los formatos soportados de SIEM sean aceptados con 200 OK."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=org_id, email="admin@acme.corp", role=UserRole.ADMIN)
    org = Organization(id=org_id, name="Acme Corp", settings={})

    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = org
    mock_db.execute.side_effect = [res_user, res_mock]

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            with patch("app.services.organization_service.audit_service.log_audit_event", new_callable=AsyncMock):
                res = await client.patch(
                    f"/api/v1/organizations/{org_id}/settings",
                    json={"siem_format": fmt},
                    headers=make_admin_jwt(admin_user),
                )
                assert res.status_code == 200
                data = res.json()
                assert data["siem_format"] == fmt
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_patch_settings_siem_format_invalid_rejected():
    """Valida que un siem_format desconocido sea rechazado con 422 Unprocessable Entity."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=org_id, email="admin@acme.corp", role=UserRole.ADMIN)

    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    mock_db.execute.return_value = res_user

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.patch(
                f"/api/v1/organizations/{org_id}/settings",
                json={"siem_format": "unsupported_system"},
                headers=make_admin_jwt(admin_user),
            )
            assert res.status_code == 422
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_webhook_service_send_event_includes_siem_format_and_header():
    """Valida inclusión de siem_format en payload y cabecera X-AgentGuard-SIEM-Format."""
    from app.services.webhook_service import webhook_service
    import json

    captured_requests = []

    class MockAsyncClient:
        async def __aenter__(self):
            return self
        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass
        async def post(self, url, content=None, headers=None):
            captured_requests.append({"url": url, "content": content, "headers": headers})
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            return mock_resp

    with patch("app.services.webhook_service.httpx.AsyncClient", return_value=MockAsyncClient()):
        success, code, msg = await webhook_service.send_event(
            url="https://siem-collector.external.io/events",
            event_type="test.event",
            organization_id=uuid.uuid4(),
            details={"key": "val"},
            siem_format="elastic",
        )

    assert success is True
    assert code == 200
    assert len(captured_requests) == 1
    sent_headers = captured_requests[0]["headers"]
    sent_payload = json.loads(captured_requests[0]["content"].decode("utf-8"))

    assert sent_headers["X-AgentGuard-SIEM-Format"] == "elastic"
    assert sent_payload["siem_format"] == "elastic"


@pytest.mark.asyncio
async def test_api_test_webhook_endpoint_forwards_siem_format():
    """Valida que POST /settings/webhooks/test reenvíe siem_format al servicio de webhooks."""
    from app.services.webhook_service import webhook_service
    from app.schemas.organization import SiemWebhookTestResponse

    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    admin_user = User(id=uuid.uuid4(), organization_id=org_id, email="admin@acme.corp", role=UserRole.ADMIN)
    org = Organization(
        id=org_id,
        name="Acme Corp",
        settings={"siem_webhook_url": "https://siem.corp/v1", "siem_format": "slack"},
    )

    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = org
    mock_db.execute.side_effect = [res_user, res_mock]

    app.dependency_overrides[get_db] = lambda: mock_db

    fake_response = SiemWebhookTestResponse(
        status="success",
        message="OK",
        target_url="https://siem.corp/v1",
        status_code=200,
        timestamp=datetime.now(timezone.utc),
    )

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            with patch.object(webhook_service, "test_webhook", new_callable=AsyncMock) as mock_test:
                mock_test.return_value = fake_response
                res = await client.post(
                    f"/api/v1/organizations/{org_id}/settings/webhooks/test",
                    json={"siem_format": "datadog"},
                    headers=make_admin_jwt(admin_user),
                )
                assert res.status_code == 200
                mock_test.assert_awaited_once_with(
                    organization_id=org_id,
                    url="https://siem.corp/v1",
                    secret=None,
                    siem_format="datadog",
                )
    finally:
        app.dependency_overrides.clear()
