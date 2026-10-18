"""Router de API REST para la gestión de Usuarios y Roles."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.user import UserCreate, UserRead
from app.services.organization_service import organization_service
from app.services.user_service import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.post(
    "",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar Usuario Corporativo",
    description="Da de alta un usuario vinculado a una organización específica con un rol de autorización.",
)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    """Registra un nuevo usuario validando existencia de la organización e unicidad del email."""
    # Validación de existencia de la organización
    org = await organization_service.get_by_id(db=db, org_id=user_in.organization_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organización con ID {user_in.organization_id} no encontrada",
        )

    # Validación de unicidad de email corporativo
    existing_user = await user_service.get_by_email(db=db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un usuario registrado con el email {user_in.email}",
        )

    user = await user_service.create(db=db, user_in=user_in)
    return user


@router.get(
    "",
    response_model=List[UserRead],
    status_code=status.HTTP_200_OK,
    summary="Listar Usuarios",
    description="Lista usuarios con paginación, permitiendo filtrar por organización (tenant).",
)
async def list_users(
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
) -> List[UserRead]:
    """Retorna el listado de usuarios según los filtros aplicados."""
    return await user_service.list_by_org(
        db=db,
        organization_id=organization_id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{user_id}",
    response_model=UserRead,
    status_code=status.HTTP_200_OK,
    summary="Obtener Usuario por ID",
    description="Busca y retorna los detalles de un usuario específico mediante su UUID.",
)
async def get_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    """Retorna un usuario por su UUID o 404 si no existe."""
    user = await user_service.get_by_id(db=db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {user_id} no encontrado",
        )
    return user
