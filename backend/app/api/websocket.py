"""Router de WebSockets para Notificaciones Reactivas en Vivo (HITL y Alertas)."""

import logging
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.websocket_manager import ws_manager

logger = logging.getLogger("agentguard.websocket.api")
router = APIRouter(tags=["WebSockets en Tiempo Real"])


@router.websocket("/ws")
async def websocket_global_endpoint(websocket: WebSocket):
    """Canal WebSocket global para eventos del sistema y auditoría en vivo."""
    await ws_manager.connect(websocket, organization_id=None)
    try:
        while True:
            data = await websocket.receive_json()
            if isinstance(data, dict) and data.get("type") == "PING":
                await websocket.send_json({"event": "PONG"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, organization_id=None)
    except Exception as exc:
        logger.debug("Conexión WebSocket cerrada: %s", exc)
        ws_manager.disconnect(websocket, organization_id=None)


@router.websocket("/ws/{organization_id}")
async def websocket_tenant_endpoint(websocket: WebSocket, organization_id: UUID):
    """Canal WebSocket acotado a una organización (Tenant Isolation)."""
    await ws_manager.connect(websocket, organization_id=organization_id)
    try:
        while True:
            data = await websocket.receive_json()
            if isinstance(data, dict) and data.get("type") == "PING":
                await websocket.send_json({"event": "PONG"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, organization_id=organization_id)
    except Exception as exc:
        logger.debug("Conexión WebSocket cerrada para tenant %s: %s", organization_id, exc)
        ws_manager.disconnect(websocket, organization_id=organization_id)
