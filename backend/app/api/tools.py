"""Router de API REST para el Catálogo de Herramientas Externas (Tools)."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ensure_same_tenant, get_current_user, require_admin_user, resolve_tenant_org_id
from app.core.database import get_db
from app.models.user import User
from app.schemas.tool import ToolCreate, ToolRead, ToolUpdate
from app.services.organization_service import organization_service
from app.services.tool_service import tool_service
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/tools", tags=["Tools"])


@router.post(
    "",
    response_model=ToolRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar Herramienta Externa",
    description="Da de alta una herramienta o servicio externo protegido por AgentGuard para un tenant específico.",
)
async def create_tool(
    tool_in: ToolCreate,
    current_admin: User = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> ToolRead:
    """Crea una nueva herramienta externa validando pertenencia del tenant."""
    ensure_same_tenant(
        tool_in.organization_id,
        current_admin,
        "Acceso denegado: No tiene autorización para crear herramientas en otra organización",
    )
    org = await organization_service.get_by_id(db=db, org_id=tool_in.organization_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organización con ID {tool_in.organization_id} no encontrada",
        )

    return await tool_service.create(db=db, tool_in=tool_in)


@router.get(
    "",
    response_model=List[ToolRead],
    status_code=status.HTTP_200_OK,
    summary="Listar Herramientas",
    description="Obtiene el catálogo de herramientas registradas, con filtro opcional por tenant y paginación.",
)
async def list_tools(
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[ToolRead]:
    """Retorna las herramientas de la organización del usuario autenticado."""
    effective_org_id = resolve_tenant_org_id(organization_id, current_user)
    return await tool_service.list_by_org(
        db=db,
        organization_id=effective_org_id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{tool_id}",
    response_model=ToolRead,
    status_code=status.HTTP_200_OK,
    summary="Obtener Herramienta por ID",
    description="Busca y retorna los detalles de una herramienta específica mediante su UUID.",
)
async def get_tool(
    tool_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ToolRead:
    """Retorna una herramienta por su UUID validando aislamiento multi-tenant."""
    tool = await tool_service.get_by_id(db=db, tool_id=tool_id)
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Herramienta con ID {tool_id} no encontrada",
        )
    ensure_same_tenant(tool.organization_id, current_user)
    return tool


@router.patch(
    "/{tool_id}",
    response_model=ToolRead,
    status_code=status.HTTP_200_OK,
    summary="Actualizar Herramienta",
    description="Actualiza propiedades de una herramienta externa (nombre, protocolo, endpoint_url, descripción).",
)
async def update_tool(
    tool_id: UUID,
    tool_in: ToolUpdate,
    current_admin: User = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> ToolRead:
    """Actualiza una herramienta existente validando pertenencia a la organización."""
    existing = await tool_service.get_by_id(db=db, tool_id=tool_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Herramienta con ID {tool_id} no encontrada",
        )
    ensure_same_tenant(existing.organization_id, current_admin)

    updated = await tool_service.update(db=db, tool_id=tool_id, tool_in=tool_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Herramienta con ID {tool_id} no encontrada",
        )
    return updated


@router.delete(
    "/{tool_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar Herramienta",
    description="Elimina una herramienta externa del catálogo si no tiene dependencias activas.",
)
async def delete_tool(
    tool_id: UUID,
    current_admin: User = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Elimina una herramienta existente validando pertenencia a la organización."""
    existing = await tool_service.get_by_id(db=db, tool_id=tool_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Herramienta con ID {tool_id} no encontrada",
        )
    ensure_same_tenant(existing.organization_id, current_admin)

    try:
        deleted = await tool_service.delete(db=db, tool_id=tool_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Herramienta con ID {tool_id} no encontrada",
            )
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar la herramienta porque tiene políticas o ejecuciones históricas vinculadas.",
        )

