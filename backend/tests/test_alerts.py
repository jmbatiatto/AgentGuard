"""Pruebas automatizadas para el endpoint de Alertas e Incidentes de Seguridad (/api/v1/alerts)."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.alert import Alert
from app.models.enums import AlertSeverity, AlertStatus


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
    mock_db.execute = AsyncMock(return_value=mock_result)

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/alerts?organization_id={org_id}&status=OPEN")
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
    fake_alert = Alert(
        id=fake_id,
        organization_id=uuid.uuid4(),
        title="Incidente detectado",
        severity=AlertSeverity.HIGH,
        status=AlertStatus.OPEN,
        created_at=datetime.now(timezone.utc),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_alert
    mock_db.execute = AsyncMock(return_value=mock_result)
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/alerts/{fake_id}")
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
    mock_db.execute = AsyncMock(return_value=mock_result)
    app.dependency_overrides[get_db] = lambda: mock_db

    fake_id = uuid.uuid4()
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/alerts/{fake_id}")
            assert response.status_code == 404
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_update_alert_status():
    """Valida la actualización del ciclo de vida de una alerta a RESOLVED."""
    mock_db = AsyncMock()
    fake_id = uuid.uuid4()
    user_id = uuid.uuid4()
    fake_alert = Alert(
        id=fake_id,
        organization_id=uuid.uuid4(),
        title="Incidente resuelto",
        severity=AlertSeverity.CRITICAL,
        status=AlertStatus.OPEN,
        created_at=datetime.now(timezone.utc),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_alert
    mock_db.execute = AsyncMock(return_value=mock_result)
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.patch(
                f"/api/v1/alerts/{fake_id}/status",
                json={"status": "RESOLVED", "resolved_by_user_id": str(user_id)},
            )
            assert response.status_code == 200
            assert response.json()["status"] == "RESOLVED"
            assert response.json()["resolved_by_user_id"] == str(user_id)
    finally:
        app.dependency_overrides.clear()
