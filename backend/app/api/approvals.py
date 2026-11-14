"""Router de API REST para la Bandeja de Aprobación Humana (HITL - Human-in-the-Loop)."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    ensure_same_tenant,
    get_current_user,
    require_roles,
    resolve_tenant_org_id,
)
from app.core.database import get_db
from app.models.enums import ApprovalStatus, UserRole
from app.models.user import User
from app.schemas.approval import ApprovalDetailRead, ApprovalResolveRequest
from app.services.pep_gateway_service import pep_gateway_service

router = APIRouter(prefix="/approvals", tags=["Approvals (HITL)"])


@router.get(
    "",
    response_model=List[ApprovalDetailRead],
    status_code=status.HTTP_200_OK,
    summary="Listar Solicitudes de Aprobación",
    description=(
        "Obtiene el listado cronológico de solicitudes de aprobación humana generadas por el Gateway, "
        "con soporte para filtrado por organización (tenant) y estado (PENDING, APPROVED, REJECTED)."
    ),
)
async def list_approvals(
    organization_id: Optional[UUID] = Query(
        default=None,
        description="Filtrar por ID de la organización tenant",
    ),
    status_filter: Optional[ApprovalStatus] = Query(
        default=None,
        alias="status",
        description="Filtrar por estado de la solicitud (PENDING, APPROVED, REJECTED)",
    ),
    skip: int = Query(
        default=0,
        ge=0,
        description="Número de registros a omitir para paginación",
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=100,
        description="Límite máximo de registros por página",
    ),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[ApprovalDetailRead]:
    """Retorna solicitudes de aprobación ordenadas pertenecientes a la organización del usuario."""
    effective_org_id = resolve_tenant_org_id(organization_id, current_user)
    return await pep_gateway_service.list_approvals(
        db=db,
        organization_id=effective_org_id,
        status=status_filter,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{approval_id}",
    response_model=ApprovalDetailRead,
    status_code=status.HTTP_200_OK,
    summary="Obtener Detalle de Aprobación",
    description="Recupera la información completa de una solicitud de aprobación específica por su ID, incluyendo la traza de ejecución asociada.",
)
async def get_approval(
    approval_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApprovalDetailRead:
    """Retorna una solicitud de aprobación validando aislamiento multi-tenant o 404 si no existe."""
    approval = await pep_gateway_service.get_approval_by_id(db=db, approval_id=approval_id)
    if not approval:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Solicitud de aprobación con ID {approval_id} no encontrada",
        )
    if approval.execution is not None:
        ensure_same_tenant(approval.execution.organization_id, current_user)
    return approval


@router.post(
    "/{approval_id}/resolve",
    response_model=ApprovalDetailRead,
    status_code=status.HTTP_200_OK,
    summary="Resolver Solicitud de Aprobación (Aprobar / Rechazar)",
    description=(
        "Permite a un operador humano (rol APPROVER o ADMIN) emitir una decisión formal "
        "('APPROVED' o 'REJECTED') documentando el motivo de la resolución y desbloqueando o cancelando la ejecución."
    ),
)
async def resolve_approval(
    approval_id: UUID,
    resolve_in: ApprovalResolveRequest,
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.APPROVER)),
    db: AsyncSession = Depends(get_db),
) -> ApprovalDetailRead:
    """Resuelve un ticket de aprobación humana sellando la identidad real del JWT y validando tenant."""
    try:
        resolved = await pep_gateway_service.resolve_approval(
            db=db,
            approval_id=approval_id,
            approver_user_id=current_user.id,
            decision=resolve_in.decision,
            resolution_reason=resolve_in.resolution_reason,
            organization_id=current_user.organization_id,
        )
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )
    if not resolved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La solicitud con ID {approval_id} no existe o ya ha sido resuelta previamente",
        )
    return resolved
