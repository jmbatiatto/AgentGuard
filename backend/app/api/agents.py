"""Router de API REST para la gestión de Agentes de IA y asignación de Herramientas."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.agent import (
    AgentCreate,
    AgentRead,
    AgentToolCreate,
    AgentToolRead,
)
from app.services.agent_service import agent_service
from app.services.organization_service import organization_service
from app.services.tool_service import tool_service
from app.services.user_service import user_service

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.post(
    "",
    response_model=AgentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar Agente de IA",
    description="Da de alta una nueva identidad de IA gobernada por AgentGuard vinculada a un usuario sponsor y tenant.",
)
async def create_agent(
    agent_in: AgentCreate,
    db: AsyncSession = Depends(get_db),
) -> AgentRead:
    """Registra un agente validando existencia del tenant y que el owner pertenezca a la misma organización."""
    org = await organization_service.get_by_id(db=db, org_id=agent_in.organization_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organización con ID {agent_in.organization_id} no encontrada",
        )

    user = await user_service.get_by_id(db=db, user_id=agent_in.owner_user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario sponsor con ID {agent_in.owner_user_id} no encontrado",
        )

    if user.organization_id != agent_in.organization_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario sponsor no pertenece a la organización especificada para el agente",
        )

    return await agent_service.create(db=db, agent_in=agent_in)


@router.get(
    "",
    response_model=List[AgentRead],
    status_code=status.HTTP_200_OK,
    summary="Listar Agentes",
    description="Obtiene el listado de agentes de IA registrados, con filtro opcional por tenant y paginación.",
)
async def list_agents(
    organization_id: Optional[UUID] = Query(
        default=None,
        description="Filtro opcional por ID de organización",
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
) -> List[AgentRead]:
    """Retorna los agentes según los filtros aplicados."""
    return await agent_service.list_by_org(
        db=db,
        organization_id=organization_id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{agent_id}",
    response_model=AgentRead,
    status_code=status.HTTP_200_OK,
    summary="Obtener Agente por ID",
    description="Busca y retorna los detalles de un agente específico mediante su UUID.",
)
async def get_agent(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> AgentRead:
    """Retorna un agente por su UUID o 404 si no existe."""
    agent = await agent_service.get_by_id(db=db, agent_id=agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agente con ID {agent_id} no encontrado",
        )
    return agent


@router.post(
    "/{agent_id}/tools",
    response_model=AgentToolRead,
    status_code=status.HTTP_201_CREATED,
    summary="Asignar Herramienta a Agente",
    description="Vincula una herramienta al agente con su configuración contextual JSONB (relación N:N en AgentTool).",
)
async def assign_tool_to_agent(
    agent_id: UUID,
    tool_in: AgentToolCreate,
    db: AsyncSession = Depends(get_db),
) -> AgentToolRead:
    """Asocia una herramienta validando existencia de agente y herramienta, y pertenencia a la misma organización."""
    agent = await agent_service.get_by_id(db=db, agent_id=agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agente con ID {agent_id} no encontrado",
        )

    tool = await tool_service.get_by_id(db=db, tool_id=tool_in.tool_id)
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Herramienta con ID {tool_in.tool_id} no encontrada",
        )

    if tool.organization_id != agent.organization_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La herramienta no pertenece a la misma organización del agente",
        )

    return await agent_service.assign_tool(db=db, agent_id=agent_id, tool_in=tool_in)


@router.get(
    "/{agent_id}/tools",
    response_model=List[AgentToolRead],
    status_code=status.HTTP_200_OK,
    summary="Listar Herramientas Asignadas al Agente",
    description="Obtiene todas las herramientas autorizadas y configuradas para este agente.",
)
async def list_agent_tools(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> List[AgentToolRead]:
    """Retorna las herramientas asignadas al agente especificado."""
    agent = await agent_service.get_by_id(db=db, agent_id=agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agente con ID {agent_id} no encontrado",
        )

    return await agent_service.list_agent_tools(db=db, agent_id=agent_id)
