"""Router de API REST para la gestión de Contenedores de Políticas (Policies)."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.policy import PolicyCreate, PolicyRead
from app.services.organization_service import organization_service
from app.services.policy_service import policy_service

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.post(
    "",
    response_model=PolicyRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear Contenedor de Políticas",
    description="Da de alta una nueva política de gobernanza y autorización con prioridad asignada para un tenant.",
)
async def create_policy(
    policy_in: PolicyCreate,
    db: AsyncSession = Depends(get_db),
) -> PolicyRead:
    """Crea una política validando existencia de la organización propietaria."""
    org = await organization_service.get_by_id(db=db, org_id=policy_in.organization_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organización con ID {policy_in.organization_id} no encontrada",
        )

    return await policy_service.create(db=db, policy_in=policy_in)


@router.get(
    "",
    response_model=List[PolicyRead],
    status_code=status.HTTP_200_OK,
    summary="Listar Políticas",
    description="Obtiene las políticas registradas ordenadas por prioridad descendente, con filtro opcional por tenant y paginación.",
)
async def list_policies(
    organization_id: Optional[UUID] = Query(
        default=None,
        description="Filtro opcional por ID de organización para respetar aislamiento multi-tenant",
    ),
    skip: int = Query(
        default=0,
        ge=0,
        description="Número de registros a omitir para paginación",
    ),
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
        description="Límite máximo de registros por página",
    ),
    db: AsyncSession = Depends(get_db),
) -> List[PolicyRead]:
    """Retorna las políticas según los filtros aplicados."""
    return await policy_service.list_by_org(
        db=db,
        organization_id=organization_id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{policy_id}",
    response_model=PolicyRead,
    status_code=status.HTTP_200_OK,
    summary="Obtener Política por ID",
    description="Busca y retorna los detalles de una política específica mediante su UUID.",
)
async def get_policy(
    policy_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> PolicyRead:
    """Retorna una política por su UUID o 404 si no existe."""
    policy = await policy_service.get_by_id(db=db, policy_id=policy_id)
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Política con ID {policy_id} no encontrada",
        )
    return policy
