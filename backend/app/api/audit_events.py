"""Router de API REST para Consulta y Auditoría Forense de Operaciones Administrativas (Audit Events)."""

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin_user
from app.core.database import get_db
from app.models.enums import ActorType
from app.models.user import User
from app.schemas.audit_event import AuditEventResponse
from app.services.audit_service import audit_service

logger = logging.getLogger("agentguard.api.audit_events")

router = APIRouter(prefix="/audit-events", tags=["Auditoría Forense (Audit Events)"])


@router.get(
    "",
    response_model=List[AuditEventResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar Eventos de Auditoría Forense",
    description=(
        "Obtiene el historial cronológico inmutable de eventos de auditoría y operaciones administrativas "
        "con soporte para filtros por tenant, tipo de actor, tipo de evento y paginación."
    ),
)
async def list_audit_events(
    organization_id: Optional[UUID] = Query(
        default=None,
        description="Filtro opcional por ID de organización (tenant isolation)",
    ),
    actor_type: Optional[ActorType] = Query(
        default=None,
        description="Filtro opcional por tipo de actor (USER, AGENT, SYSTEM)",
    ),
    event_type: Optional[str] = Query(
        default=None,
        description="Filtro opcional por tipo canónico de evento",
    ),
    skip: int = Query(
        default=0,
        ge=0,
        description="Número de registros a omitir para paginación",
    ),
    offset: Optional[int] = Query(
        default=None,
        ge=0,
        description="Alias opcional para skip",
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=500,
        description="Límite máximo de registros por página",
    ),
    current_admin: Optional[User] = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> List[AuditEventResponse]:
    """Retorna eventos de auditoría forense según los filtros aplicados y validando pertenencia de tenant."""
    effective_skip = offset if offset is not None else skip

    if current_admin is not None:
        if organization_id is not None and organization_id != current_admin.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado: El usuario no pertenece a la organización especificada",
            )
        effective_org_id = organization_id or current_admin.organization_id
    else:
        effective_org_id = organization_id

    events = await audit_service.list_events(
        db=db,
        organization_id=effective_org_id,
        skip=effective_skip,
        limit=limit,
        actor_type=actor_type,
        event_type=event_type,
    )
    return [AuditEventResponse.model_validate(e) for e in events]


@router.get(
    "/{id}",
    response_model=AuditEventResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtener Evento de Auditoría por ID",
    description="Busca y retorna un registro forense específico mediante su identificador UUID inmutable.",
)
async def get_audit_event(
    id: UUID,
    organization_id: Optional[UUID] = Query(
        default=None,
        description="ID opcional de la organización para validación multi-tenant",
    ),
    current_admin: Optional[User] = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> AuditEventResponse:
    """Retorna un evento de auditoría específico por UUID o 404 si no existe."""
    if current_admin is not None:
        if organization_id is not None and organization_id != current_admin.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado: El usuario no pertenece a la organización especificada",
            )
        effective_org_id = organization_id or current_admin.organization_id
    else:
        effective_org_id = organization_id

    event = await audit_service.get_by_id(
        db=db,
        event_id=id,
        organization_id=effective_org_id,
    )
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evento de auditoría con ID {id} no encontrado",
        )

    return AuditEventResponse.model_validate(event)
