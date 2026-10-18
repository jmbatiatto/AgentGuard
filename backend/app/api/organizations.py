"""Router de API REST para la gestión de Organizaciones (Tenants)."""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.organization import OrganizationCreate, OrganizationRead
from app.services.organization_service import organization_service

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post(
    "",
    response_model=OrganizationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear Organización (Tenant)",
    description="Da de alta una nueva organización corporativa. Es la entidad raíz de aislamiento multi-tenant.",
)
async def create_organization(
    org_in: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
) -> OrganizationRead:
    """Crea un nuevo tenant y lo persiste en la base de datos."""
    org = await organization_service.create(db=db, org_in=org_in)
    return org


@router.get(
    "",
    response_model=List[OrganizationRead],
    status_code=status.HTTP_200_OK,
    summary="Listar Organizaciones",
    description="Obtiene el listado paginado de todas las organizaciones registradas.",
)
async def list_organizations(
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
) -> List[OrganizationRead]:
    """Retorna las organizaciones con paginación."""
    return await organization_service.list_all(db=db, skip=skip, limit=limit)


@router.get(
    "/{org_id}",
    response_model=OrganizationRead,
    status_code=status.HTTP_200_OK,
    summary="Obtener Organización por ID",
    description="Busca y retorna los detalles de una organización específica mediante su UUID.",
)
async def get_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> OrganizationRead:
    """Retorna una organización específica o 404 si no existe."""
    org = await organization_service.get_by_id(db=db, org_id=org_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organización con ID {org_id} no encontrada",
        )
    return org
