"""Router de API REST para Consulta y Gestión de Alertas e Incidentes de Seguridad."""

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.websocket_manager import ws_manager
from app.models.alert import Alert
from app.models.enums import AlertSeverity, AlertStatus
from app.schemas.alert import AlertRead, AlertUpdateRequest

logger = logging.getLogger("agentguard.api.alerts")

router = APIRouter(prefix="/alerts", tags=["Incidentes y Alertas de Seguridad"])


@router.get(
    "",
    response_model=List[AlertRead],
    summary="Listar Alertas de Seguridad",
    description=(
        "Obtiene el listado cronológico de incidentes de seguridad y violaciones detectadas por el Gateway, "
        "con soporte para filtrado por organización (tenant isolation), estado y nivel de severidad."
    ),
)
async def list_alerts(
    organization_id: Optional[UUID] = Query(None, description="Filtrar por organización tenant"),
    status_filter: Optional[AlertStatus] = Query(None, alias="status", description="Filtrar por estado (OPEN, INVESTIGATING, RESOLVED, DISMISSED)"),
    severity: Optional[AlertSeverity] = Query(None, description="Filtrar por severidad (CRITICAL, HIGH, MEDIUM, LOW)"),
    skip: int = Query(0, ge=0, description="Paginación: desplazamiento de registros"),
    limit: int = Query(50, ge=1, le=100, description="Paginación: límite máximo de resultados"),
    db: AsyncSession = Depends(get_db),
) -> List[AlertRead]:
    """Retorna alertas de seguridad ordenadas de más recientes a más antiguas."""
    stmt = (
        select(Alert)
        .order_by(Alert.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    if organization_id:
        stmt = stmt.where(Alert.organization_id == organization_id)
    if status_filter:
        stmt = stmt.where(Alert.status == status_filter)
    if severity:
        stmt = stmt.where(Alert.severity == severity)

    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get(
    "/{alert_id}",
    response_model=AlertRead,
    summary="Obtener Detalle de Alerta",
    description="Recupera la información completa de un incidente de seguridad específico por su ID único.",
)
async def get_alert_by_id(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> AlertRead:
    """Retorna una alerta por ID o 404 si no existe."""
    stmt = select(Alert).where(Alert.id == alert_id)
    result = await db.execute(stmt)
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alerta de seguridad con ID '{alert_id}' no encontrada.",
        )
    return alert


@router.patch(
    "/{alert_id}/status",
    response_model=AlertRead,
    summary="Actualizar Estado del Incidente",
    description="Permite a un operador o administrador investigar, resolver o descartar una alerta de seguridad.",
)
async def update_alert_status(
    alert_id: UUID,
    update_data: AlertUpdateRequest,
    db: AsyncSession = Depends(get_db),
) -> AlertRead:
    """Actualiza el estado de una alerta y notifica en tiempo real vía WebSocket."""
    stmt = select(Alert).where(Alert.id == alert_id)
    result = await db.execute(stmt)
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alerta de seguridad con ID '{alert_id}' no encontrada.",
        )

    alert.status = update_data.status
    if update_data.resolved_by_user_id:
        alert.resolved_by_user_id = update_data.resolved_by_user_id

    await db.commit()
    await db.refresh(alert)

    # Notificar actualización en tiempo real a clientes conectados
    await ws_manager.broadcast(
        event_type="ALERT_STATUS_UPDATED",
        data={
            "alert_id": str(alert.id),
            "status": alert.status.value,
            "resolved_by_user_id": str(alert.resolved_by_user_id) if alert.resolved_by_user_id else None,
        },
        organization_id=alert.organization_id,
    )

    return alert
