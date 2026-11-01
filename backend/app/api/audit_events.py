"""Router de API REST para Consulta de Eventos de Auditoría Administrativa (WORM)."""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.audit import AuditEventRead
from app.services.audit_service import audit_service

router = APIRouter(prefix="/audit-events", tags=["Auditoría Administrativa"])


@router.get(
    "",
    response_model=List[AuditEventRead],
    status_code=status.HTTP_200_OK,
    summary="Listar eventos de auditoría inmutables WORM",
)
async def list_audit_events(
    organization_id: uuid.UUID = Query(..., description="UUID de la organización (tenant)"),
    event_type: Optional[str] = Query(None, description="Filtro opcional por tipo de evento"),
    skip: int = Query(0, ge=0, description="Paginación: registros a omitir"),
    limit: int = Query(50, ge=1, le=200, description="Paginación: límite de resultados"),
    db: AsyncSession = Depends(get_db),
):
    """Retorna el historial inmutable WORM de eventos administrativos de la organización."""
    events = await audit_service.list_by_org(
        db=db,
        organization_id=organization_id,
        event_type=event_type,
        skip=skip,
        limit=limit,
    )
    return events
