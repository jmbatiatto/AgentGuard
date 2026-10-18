"""Router de API REST para la gestión de Acciones Atómicas de Herramientas (ToolActions)."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.tool_action import ToolActionCreate, ToolActionRead
from app.services.tool_service import tool_service
from app.services.tool_action_service import tool_action_service

router = APIRouter(prefix="/tool-actions", tags=["Tool Actions"])


@router.post(
    "",
    response_model=ToolActionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar Acción Atómica",
    description="Da de alta una acción atómica vinculada a una herramienta con su nivel de riesgo tipificado.",
)
async def create_tool_action(
    action_in: ToolActionCreate,
    db: AsyncSession = Depends(get_db),
) -> ToolActionRead:
    """Crea una acción atómica validando que la herramienta exista y el nombre sea único para dicha herramienta."""
    # Validación de existencia de la herramienta padre
    tool = await tool_service.get_by_id(db=db, tool_id=action_in.tool_id)
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Herramienta con ID {action_in.tool_id} no encontrada",
        )

    # Validación de unicidad de nombre de acción en la herramienta
    existing_action = await tool_action_service.get_by_tool_and_name(
        db=db,
        tool_id=action_in.tool_id,
        action_name=action_in.action_name,
    )
    if existing_action:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe una acción con el nombre '{action_in.action_name}' para la herramienta especificada",
        )

    return await tool_action_service.create(db=db, action_in=action_in)


@router.get(
    "",
    response_model=List[ToolActionRead],
    status_code=status.HTTP_200_OK,
    summary="Listar Acciones Atómicas",
    description="Obtiene el listado de acciones atómicas, con filtro opcional por ID de herramienta y paginación.",
)
async def list_tool_actions(
    tool_id: Optional[UUID] = Query(
        default=None,
        description="Filtro opcional por ID de herramienta contenedora",
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
) -> List[ToolActionRead]:
    """Retorna las acciones atómicas según los filtros aplicados."""
    return await tool_action_service.list_actions(
        db=db,
        tool_id=tool_id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{action_id}",
    response_model=ToolActionRead,
    status_code=status.HTTP_200_OK,
    summary="Obtener Acción Atómica por ID",
    description="Busca y retorna los detalles de una acción atómica mediante su UUID.",
)
async def get_tool_action(
    action_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> ToolActionRead:
    """Retorna una acción atómica por su UUID o 404 si no existe."""
    action = await tool_action_service.get_by_id(db=db, action_id=action_id)
    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Acción de herramienta con ID {action_id} no encontrada",
        )
    return action
