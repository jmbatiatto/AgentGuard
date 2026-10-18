"""Router de API REST para el Catálogo de Herramientas Externas (Tools)."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.tool import ToolCreate, ToolRead
from app.services.organization_service import organization_service
from app.services.tool_service import tool_service

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
    db: AsyncSession = Depends(get_db),
) -> ToolRead:
    """Crea una nueva herramienta externa validando existencia de la organización."""
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
    db: AsyncSession = Depends(get_db),
) -> List[ToolRead]:
    """Retorna las herramientas según los filtros aplicados."""
    return await tool_service.list_by_org(
        db=db,
        organization_id=organization_id,
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
    db: AsyncSession = Depends(get_db),
) -> ToolRead:
    """Retorna una herramienta por su UUID o 404 si no existe."""
    tool = await tool_service.get_by_id(db=db, tool_id=tool_id)
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Herramienta con ID {tool_id} no encontrada",
        )
    return tool
