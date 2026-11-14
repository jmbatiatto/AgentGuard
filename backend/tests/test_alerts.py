"""Pruebas automatizadas para el endpoint de Alertas e Incidentes de Seguridad (/api/v1/alerts)."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.alert import Alert
from app.models.enums import AlertSeverity, AlertStatus, UserRole
from app.models.user import User
from tests.conftest import make_admin_jwt


def _make_auth(org_id=None, user_id=None):
    user = User(
        id=user_id or uuid.uuid4(),
        organization_id=org_id or uuid.uuid4(),
        email="admin@test.com",
        role=UserRole.ADMIN,
    )
    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = user
    return res_user, make_admin_jwt(user)


@pytest.mark.asyncio
async def test_list_alerts_endpoint():
    """Valida la consulta de alertas e incidentes de seguridad con status 200."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    fake_alert = Alert(
        id=uuid.uuid4(),
        organization_id=org_id,
        execution_id=uuid.uuid4(),
        title="Alerta de Seguridad: Bloqueo en acción crítica",
        description="Intento de exportación bloqueado por política",
        severity=AlertSeverity.CRITICAL,
        status=AlertStatus.OPEN,
        created_at=datetime.now(timezone.utc),
    )

    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [fake_alert]
    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    res_user, headers = _make_auth(org_id)
    mock_db.execute = AsyncMock(side_effect=[res_user, mock_result])

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/alerts?organization_id={org_id}&status=OPEN", headers=headers)
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            assert len(data) == 1
            assert data[0]["severity"] == "CRITICAL"
            assert data[0]["status"] == "OPEN"
            assert "Bloqueo" in data[0]["title"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_alert_by_id_found():
    """Valida la obtención de una alerta existente por su ID."""
    mock_db = AsyncMock()
    fake_id = uuid.uuid4()
    org_id = uuid.uuid4()
    fake_alert = Alert(
        id=fake_id,
        organization_id=org_id,
        title="Incidente detectado",
        severity=AlertSeverity.HIGH,
        status=AlertStatus.OPEN,
        created_at=datetime.now(timezone.utc),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_alert
    res_user, headers = _make_auth(org_id)
    mock_db.execute = AsyncMock(side_effect=[res_user, mock_result])
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/alerts/{fake_id}", headers=headers)
            assert response.status_code == 200
            assert response.json()["id"] == str(fake_id)
            assert response.json()["severity"] == "HIGH"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_alert_by_id_not_found():
    """Valida que un ID de alerta inexistente retorne 404."""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    res_user, headers = _make_auth()
    mock_db.execute = AsyncMock(side_effect=[res_user, mock_result])
    app.dependency_overrides[get_db] = lambda: mock_db

    fake_id = uuid.uuid4()
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/alerts/{fake_id}", headers=headers)
            assert response.status_code == 404
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_alert_status():
    """Valida la actualización del ciclo de vida de una alerta a RESOLVED."""
    mock_db = AsyncMock()
    fake_id = uuid.uuid4()
    user_id = uuid.uuid4()
    org_id = uuid.uuid4()
    fake_alert = Alert(
        id=fake_id,
        organization_id=org_id,
        title="Incidente resuelto",
        severity=AlertSeverity.CRITICAL,
        status=AlertStatus.OPEN,
        created_at=datetime.now(timezone.utc),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_alert
    res_user, headers = _make_auth(org_id=org_id, user_id=user_id)
    mock_db.execute = AsyncMock(side_effect=[res_user, mock_result])
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.patch(
                f"/api/v1/alerts/{fake_id}/status",
                headers=headers,
                json={"status": "RESOLVED", "resolved_by_user_id": str(user_id)},
            )
            assert response.status_code == 200
            assert response.json()["status"] == "RESOLVED"
            assert response.json()["resolved_by_user_id"] == str(user_id)
    finally:
        app.dependency_overrides.clear()
