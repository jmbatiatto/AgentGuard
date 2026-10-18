"""Router de API REST para la gestión de Reglas Deterministas de Políticas (PolicyRules)."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.policy_rule import PolicyRuleCreate, PolicyRuleRead
from app.services.agent_service import agent_service
from app.services.policy_rule_service import policy_rule_service
from app.services.policy_service import policy_service
from app.services.tool_action_service import tool_action_service
from app.services.tool_service import tool_service

router = APIRouter(prefix="/policy-rules", tags=["Policy Rules"])


@router.post(
    "",
    response_model=PolicyRuleRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar Regla de Política",
    description="Da de alta una regla atómica determinista vinculada a una política y acción de herramienta, evaluada por el PDP.",
)
async def create_policy_rule(
    rule_in: PolicyRuleCreate,
    db: AsyncSession = Depends(get_db),
) -> PolicyRuleRead:
    """Registra una regla validando integridad de política, acción de herramienta y agente opcional."""
    # 1. Validar que la política exista
    policy = await policy_service.get_by_id(db=db, policy_id=rule_in.policy_id)
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Política con ID {rule_in.policy_id} no encontrada",
        )

    # 2. Validar que la acción de herramienta exista
    tool_action = await tool_action_service.get_by_id(db=db, action_id=rule_in.tool_action_id)
    if not tool_action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Acción de herramienta con ID {rule_in.tool_action_id} no encontrada",
        )

    # 3. Validar que la herramienta pertenezca a la misma organización de la política
    tool = await tool_service.get_by_id(db=db, tool_id=tool_action.tool_id)
    if tool and tool.organization_id != policy.organization_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La acción de herramienta especificada no pertenece a la misma organización de la política",
        )

    # 4. Validar agente objetivo si fue provisto
    if rule_in.target_agent_id:
        agent = await agent_service.get_by_id(db=db, agent_id=rule_in.target_agent_id)
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agente objetivo con ID {rule_in.target_agent_id} no encontrado",
            )
        if agent.organization_id != policy.organization_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El agente objetivo no pertenece a la misma organización de la política",
            )

    return await policy_rule_service.create(db=db, rule_in=rule_in)


@router.get(
    "",
    response_model=List[PolicyRuleRead],
    status_code=status.HTTP_200_OK,
    summary="Listar Reglas de Política",
    description="Obtiene las reglas de autorización ordenadas por prioridad descendente, con filtro opcional por ID de política y paginación.",
)
async def list_policy_rules(
    policy_id: Optional[UUID] = Query(
        default=None,
        description="Filtro opcional por ID de política contenedora",
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
) -> List[PolicyRuleRead]:
    """Retorna las reglas según los filtros aplicados."""
    return await policy_rule_service.list_rules(
        db=db,
        policy_id=policy_id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{rule_id}",
    response_model=PolicyRuleRead,
    status_code=status.HTTP_200_OK,
    summary="Obtener Regla por ID",
    description="Busca y retorna los detalles de una regla de autorización específica mediante su UUID.",
)
async def get_policy_rule(
    rule_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> PolicyRuleRead:
    """Retorna una regla por su UUID o 404 si no existe."""
    rule = await policy_rule_service.get_by_id(db=db, rule_id=rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Regla de política con ID {rule_id} no encontrada",
        )
    return rule
