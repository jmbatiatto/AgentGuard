"""Router de API REST para Consulta y Auditoría de Trazas Forenses (Executions)."""

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.enums import PolicyDecision, ExecutionStatus
from app.models.execution import Execution
from app.schemas.execution import ExecutionResponse

logger = logging.getLogger("agentguard.api.executions")

router = APIRouter(prefix="/executions", tags=["Trazabilidad Forense (Executions)"])


def _to_execution_response(execution: Execution) -> ExecutionResponse:
    """Mapea una entidad Execution con relaciones cargadas al esquema ExecutionResponse."""
    agent_name = execution.agent.name if execution.agent else "Unknown Agent"
    tool_name = execution.tool.name if execution.tool else "Unknown Tool"
    action_name = execution.tool_action.action_name if execution.tool_action else "unknown"

    approval_status = execution.approval.status.value if execution.approval else None
    approval_resolved_at = execution.approval.resolved_at if execution.approval else None
    resolution_reason = execution.approval.resolution_reason if execution.approval else None

    return ExecutionResponse(
        id=execution.id,
        organization_id=execution.organization_id,
        agent_id=execution.agent_id,
        agent_name=agent_name,
        tool_id=execution.tool_id,
        tool_name=tool_name,
        tool_action_id=execution.tool_action_id,
        action_name=action_name,
        resource=execution.resource,
        request_context=execution.request_context or {},
        decision=execution.decision,
        status=execution.status,
        evaluated_policy_rule_id=execution.evaluated_policy_rule_id,
        timestamp=execution.timestamp,
        latency_ms=21.5,
        approval_status=approval_status,
        approval_resolved_at=approval_resolved_at,
        resolution_reason=resolution_reason,
    )


@router.get(
    "",
    response_model=List[ExecutionResponse],
    summary="Listar Trazas Forenses de Ejecución",
    description=(
        "Recupera el historial cronológico e inmutable de llamadas interceptadas por el Gateway, "
        "con soporte para filtros por organización, agente, veredicto (decision) y estado."
    ),
)
async def list_executions(
    organization_id: Optional[UUID] = Query(None, description="Filtrar por organización tenant"),
    agent_id: Optional[UUID] = Query(None, description="Filtrar por agente de IA específico"),
    decision: Optional[PolicyDecision] = Query(None, description="Filtrar por veredicto PDP (ALLOW, DENY, REQUIRE_APPROVAL)"),
    status: Optional[ExecutionStatus] = Query(None, description="Filtrar por estado del ciclo de vida"),
    skip: int = Query(0, ge=0, description="Desplazamiento para paginación"),
    limit: int = Query(50, ge=1, le=200, description="Límite de resultados a retornar"),
    db: AsyncSession = Depends(get_db),
) -> List[ExecutionResponse]:
    """Consulta la tabla executions con joins optimizados y orden descendente."""
    stmt = (
        select(Execution)
        .options(
            selectinload(Execution.agent),
            selectinload(Execution.tool),
            selectinload(Execution.tool_action),
            selectinload(Execution.evaluated_policy_rule),
            selectinload(Execution.approval),
        )
        .order_by(Execution.timestamp.desc())
        .offset(skip)
        .limit(limit)
    )

    if organization_id:
        stmt = stmt.where(Execution.organization_id == organization_id)
    if agent_id:
        stmt = stmt.where(Execution.agent_id == agent_id)
    if decision:
        stmt = stmt.where(Execution.decision == decision)
    if status:
        stmt = stmt.where(Execution.status == status)

    result = await db.execute(stmt)
    executions = result.scalars().all()

    return [_to_execution_response(e) for e in executions]


@router.get(
    "/{execution_id}",
    response_model=ExecutionResponse,
    summary="Detalle Forense de una Traza de Ejecución",
    description="Recupera todos los metadatos forenses, contexto sanitizado y decisiones asociadas a una traza.",
)
async def get_execution_by_id(
    execution_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> ExecutionResponse:
    """Busca una traza forense por su identificador UUID único."""
    stmt = (
        select(Execution)
        .options(
            selectinload(Execution.agent),
            selectinload(Execution.tool),
            selectinload(Execution.tool_action),
            selectinload(Execution.evaluated_policy_rule),
            selectinload(Execution.approval),
        )
        .where(Execution.id == execution_id)
    )
    result = await db.execute(stmt)
    execution = result.scalar_one_or_none()

    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Traza de ejecución forense '{execution_id}' no encontrada.",
        )

    return _to_execution_response(execution)
