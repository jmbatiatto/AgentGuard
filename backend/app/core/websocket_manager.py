"""Gestor de Conexiones WebSocket en Tiempo Real con Aislamiento Multi-Tenant."""

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set
from uuid import UUID

from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("agentguard.websocket")


class WebSocketConnectionManager:
    """Gestiona conexiones activas de WebSockets por organización y emite eventos en tiempo real."""

    def __init__(self) -> None:
        # Mapeo de organization_id -> Set[WebSocket]
        self.tenant_connections: Dict[Optional[UUID], Set[WebSocket]] = {}
        # Conexiones globales (sin filtrado por tenant)
        self.global_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket, organization_id: Optional[UUID] = None) -> None:
        """Acepta la conexión WebSocket y la registra en el tenant correspondiente."""
        await websocket.accept()

        if organization_id:
            if organization_id not in self.tenant_connections:
                self.tenant_connections[organization_id] = set()
            self.tenant_connections[organization_id].add(websocket)
        else:
            self.global_connections.add(websocket)

        logger.info(
            "WebSocket conectado. Total activos [Org: %s]: %d",
            organization_id or "GLOBAL",
            len(self.tenant_connections.get(organization_id, [])) if organization_id else len(self.global_connections),
        )

        # Enviar mensaje de bienvenida / handshake
        await self.send_personal_message(
            {
                "event": "CONNECTED",
                "message": "Conectado al Gateway de Eventos en Tiempo Real de AgentGuard",
                "organization_id": str(organization_id) if organization_id else None,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            websocket,
        )

    def disconnect(self, websocket: WebSocket, organization_id: Optional[UUID] = None) -> None:
        """Remueve la conexión WebSocket al cerrarse."""
        if organization_id and organization_id in self.tenant_connections:
            self.tenant_connections[organization_id].discard(websocket)
            if not self.tenant_connections[organization_id]:
                del self.tenant_connections[organization_id]
        else:
            self.global_connections.discard(websocket)

        logger.info("WebSocket desconectado [Org: %s]", organization_id or "GLOBAL")

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket) -> None:
        """Envía un mensaje JSON a una conexión WebSocket específica."""
        try:
            await websocket.send_json(message)
        except Exception as exc:
            logger.warning("Fallo al enviar mensaje a WebSocket individual: %s", exc)

    async def broadcast(
        self,
        event_type: str,
        data: Dict[str, Any],
        organization_id: Optional[UUID] = None,
    ) -> None:
        """Emite un evento a todas las conexiones del tenant y a las globales."""
        payload = {
            "event": event_type,
            "type": event_type,
            "organization_id": str(organization_id) if organization_id else None,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }

        # Coleccionar sockets destinatarios
        target_sockets: Set[WebSocket] = set()
        if organization_id and organization_id in self.tenant_connections:
            target_sockets.update(self.tenant_connections[organization_id])
        target_sockets.update(self.global_connections)

        dead_sockets: List[WebSocket] = []
        for socket in target_sockets:
            try:
                await socket.send_json(payload)
            except Exception as exc:
                logger.warning("Error al emitir a socket (%s): %s", event_type, exc)
                dead_sockets.append(socket)

        # Limpiar sockets caídos
        for dead in dead_sockets:
            self.disconnect(dead, organization_id)
            self.disconnect(dead, None)


ws_manager = WebSocketConnectionManager()
