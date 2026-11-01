"""Pruebas unitarias para el Servicio y API de Auditoría Administrativa WORM."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.database import get_db
from app.models.enums import ActorType
from app.models.audit import AuditEvent
from app.services.audit_service import audit_service


@pytest.mark.asyncio
async def test_audit_service_record_event():
    """Valida la inserción inmutable de un evento WORM."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    org_id = uuid.uuid4()
    actor_id = uuid.uuid4()
    event = await audit_service.record_event(
        db=mock_db,
        organization_id=org_id,
        actor_type=ActorType.USER,
        actor_id=actor_id,
        event_type="POLICY_CREATED",
        metadata={"policy_name": "Test Policy", "priority": 100},
    )

    mock_db.add.assert_called_once()
    mock_db.commit.assert_awaited_once()
    assert event.organization_id == org_id
    assert event.actor_id == actor_id
    assert event.actor_type == ActorType.USER
    assert event.event_type == "POLICY_CREATED"
    assert event.event_metadata["policy_name"] == "Test Policy"


@pytest.mark.asyncio
async def test_api_list_audit_events():
    """Valida el endpoint GET /api/v1/audit-events con filtrado multi-tenant."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    actor_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    mock_events = [
        AuditEvent(
            id=uuid.uuid4(),
            organization_id=org_id,
            actor_type=ActorType.USER,
            actor_id=actor_id,
            event_type="POLICY_CREATED",
            event_metadata={"policy": "P1"},
            timestamp=now,
        ),
        AuditEvent(
            id=uuid.uuid4(),
            organization_id=org_id,
            actor_type=ActorType.SYSTEM,
            actor_id=actor_id,
            event_type="ALERT_RESOLVED",
            event_metadata={"alert_id": "A1"},
            timestamp=now,
        ),
    ]

    with patch.object(audit_service, "list_by_org", new_callable=AsyncMock) as mock_list:
        mock_list.return_value = mock_events

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/audit-events?organization_id={org_id}&limit=10")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["event_type"] == "POLICY_CREATED"
            assert data[1]["event_type"] == "ALERT_RESOLVED"

    app.dependency_overrides.clear()

