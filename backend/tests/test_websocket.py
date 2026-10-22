"""Pruebas automatizadas para el Gestor de WebSockets y Endpoints en Tiempo Real."""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from starlette.testclient import TestClient

from app.core.websocket_manager import WebSocketConnectionManager
from app.main import app


@pytest.mark.asyncio
async def test_websocket_manager_connect_and_welcome():
    """Valida que una conexión nueva reciba el handshake inicial de bienvenida."""
    manager = WebSocketConnectionManager()
    mock_ws = AsyncMock()
    org_id = uuid.uuid4()

    await manager.connect(mock_ws, organization_id=org_id)

    assert mock_ws.accept.await_count == 1
    assert mock_ws.send_json.await_count == 1
    sent_payload = mock_ws.send_json.call_args[0][0]
    assert sent_payload["event"] == "CONNECTED"
    assert sent_payload["organization_id"] == str(org_id)
    assert org_id in manager.tenant_connections
    assert mock_ws in manager.tenant_connections[org_id]


@pytest.mark.asyncio
async def test_websocket_manager_broadcast_tenant_isolation():
    """Valida el aislamiento multi-tenant en las emisiones en vivo."""
    manager = WebSocketConnectionManager()
    org_a = uuid.uuid4()
    org_b = uuid.uuid4()

    ws_a = AsyncMock()
    ws_b = AsyncMock()
    ws_global = AsyncMock()

    await manager.connect(ws_a, organization_id=org_a)
    await manager.connect(ws_b, organization_id=org_b)
    await manager.connect(ws_global, organization_id=None)

    # Resetear call_count del mensaje de bienvenida
    ws_a.send_json.reset_mock()
    ws_b.send_json.reset_mock()
    ws_global.send_json.reset_mock()

    # Emitir evento exclusivo para org_a
    await manager.broadcast(
        event_type="NEW_APPROVAL",
        data={"approval_id": "appr-101"},
        organization_id=org_a,
    )

    # ws_a (mismo tenant) y ws_global (auditor global) deben recibir el evento
    assert ws_a.send_json.await_count == 1
    assert ws_global.send_json.await_count == 1
    # ws_b (otro tenant) NO debe recibir nada
    assert ws_b.send_json.await_count == 0

    event_payload = ws_a.send_json.call_args[0][0]
    assert event_payload["event"] == "NEW_APPROVAL"
    assert event_payload["data"]["approval_id"] == "appr-101"


@pytest.mark.asyncio
async def test_websocket_manager_disconnect_cleanup():
    """Valida la remoción limpia de sockets al desconectarse."""
    manager = WebSocketConnectionManager()
    org_id = uuid.uuid4()
    mock_ws = AsyncMock()

    await manager.connect(mock_ws, organization_id=org_id)
    assert org_id in manager.tenant_connections

    manager.disconnect(mock_ws, organization_id=org_id)
    assert org_id not in manager.tenant_connections


def test_websocket_endpoint_ping_pong():
    """Valida la interacción con el endpoint /api/v1/ws con handshake y heartbeat PING/PONG."""
    client = TestClient(app)
    with client.websocket_connect("/api/v1/ws") as websocket:
        welcome = websocket.receive_json()
        assert welcome["event"] == "CONNECTED"
        assert welcome["organization_id"] is None

        websocket.send_json({"type": "PING"})
        pong = websocket.receive_json()
        assert pong["event"] == "PONG"


def test_websocket_tenant_endpoint_connect():
    """Valida la conexión al endpoint acotado a un tenant específico /api/v1/ws/{org_id}."""
    client = TestClient(app)
    org_id = uuid.uuid4()
    with client.websocket_connect(f"/api/v1/ws/{org_id}") as websocket:
        welcome = websocket.receive_json()
        assert welcome["event"] == "CONNECTED"
        assert welcome["organization_id"] == str(org_id)
