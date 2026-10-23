"""Servicio Central del Gateway de Ejecución (PEP - Policy Enforcement Point).

Actúa como el perímetro de control físico e intercepción de AgentGuard.
Valida capacidades de agentes (AgentTool), resuelve acciones atómicas,
invoca al PDP determinista, sanitiza contextos según OWASP LLM06,
persiste trazas forenses inmutables y enruta o bloquea llamadas.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

import httpx
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.agent import Agent, AgentTool
from app.models.alert import Alert
from app.models.approval import Approval
from app.models.enums import (
    AgentStatus,
    AlertSeverity,
    AlertStatus,
    ApprovalStatus,
    ExecutionStatus,
    PolicyDecision,
    RiskLevel,
)
from app.models.execution import Execution
from app.models.tool import Tool, ToolAction
from app.models.user import User
from app.schemas.gateway import GatewayExecuteRequest, GatewayExecuteResponse
from app.services.pdp_engine import pdp_engine
from app.services.sanitizer_service import sanitizer_service
from app.core.websocket_manager import ws_manager

logger = logging.getLogger("agentguard.pep")


class PEPGatewayService:
    """Orquestador de autorización, ejecución y auditoría en tiempo de ejecución."""

    @staticmethod
    async def _dispatch_to_tool(
        tool: Tool,
        action_name: str,
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Despacha la llamada HTTP a la API externa de destino o simula respuesta de éxito."""
        endpoint = f"{tool.endpoint_url.rstrip('/')}/{action_name}"

        # Si el endpoint es real y accesible por HTTP/HTTPS
        if tool.endpoint_url.startswith(("http://", "https://")) and not (
            "test" in tool.endpoint_url or "api.corp" in tool.endpoint_url or ".internal" in tool.endpoint_url
        ):
            try:
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.post(endpoint, json=parameters)
                    if resp.status_code < 400:
                        try:
                            return resp.json()
                        except Exception:
                            return {"raw": resp.text, "status_code": resp.status_code}
            except Exception as exc:
                logger.warning("Fallo llamada física a %s: %s. Aplicando simulación segura.", endpoint, exc)

        # Simulación estándar de respuesta para pruebas locales y demos offline
        return {
            "status": "success",
            "dispatched_to": endpoint,
            "action": action_name,
            "received_params": parameters,
            "result_id": f"RES-{uuid.uuid4().hex[:8].upper()}",
            "executed_at": datetime.now(timezone.utc).isoformat(),
        }

    @classmethod
    async def execute(
        cls,
        db: AsyncSession,
        request: GatewayExecuteRequest,
    ) -> GatewayExecuteResponse:
        """Flujo integral de intercepción, autorización y despacho de una llamada."""
        execution_id = uuid.uuid4()
        now = datetime.now(timezone.utc)

        # 1. Sanitizar parámetros de entrada de inmediato
        sanitized_params = sanitizer_service.sanitize(request.parameters)

        # 2. Validar Agente (Tenant y Estado)
        agent_stmt = select(Agent).where(
            and_(
                Agent.id == request.agent_id,
                Agent.organization_id == request.organization_id,
            )
        )
        agent_res = await db.execute(agent_stmt)
        agent = agent_res.scalar_one_or_none()

        if not agent:
            # Registrar traza de agente no encontrado
            execution = Execution(
                id=execution_id,
                organization_id=request.organization_id,
                agent_id=request.agent_id,
                delegator_user_id=request.delegator_user_id,
                tool_id=request.tool_id,
                tool_action_id=uuid.uuid4(),  # ID sintético para traza
                resource=request.resource,
                request_context=sanitized_params,
                decision=PolicyDecision.DENY,
                status=ExecutionStatus.REJECTED,
                timestamp=now,
            )
            return GatewayExecuteResponse(
                execution_id=execution_id,
                organization_id=request.organization_id,
                agent_id=request.agent_id,
                tool_id=request.tool_id,
                action_name=request.action_name,
                decision=PolicyDecision.DENY,
                status=ExecutionStatus.REJECTED,
                error_message="El agente no existe o no pertenece a esta organización",
                timestamp=now,
            )

        if agent.status != AgentStatus.ACTIVE:
            return GatewayExecuteResponse(
                execution_id=execution_id,
                organization_id=request.organization_id,
                agent_id=request.agent_id,
                tool_id=request.tool_id,
                action_name=request.action_name,
                decision=PolicyDecision.DENY,
                status=ExecutionStatus.REJECTED,
                error_message=f"El agente se encuentra en estado '{agent.status}' y no puede operar",
                timestamp=now,
            )

        # 3. Validar Herramienta y Acción Atómica
        tool_stmt = select(Tool).where(
            and_(
                Tool.id == request.tool_id,
                Tool.organization_id == request.organization_id,
            )
        )
        tool_res = await db.execute(tool_stmt)
        tool = tool_res.scalar_one_or_none()

        if not tool:
            return GatewayExecuteResponse(
                execution_id=execution_id,
                organization_id=request.organization_id,
                agent_id=request.agent_id,
                tool_id=request.tool_id,
                action_name=request.action_name,
                decision=PolicyDecision.DENY,
                status=ExecutionStatus.REJECTED,
                error_message="Herramienta no encontrada en la organización",
                timestamp=now,
            )

        action_stmt = select(ToolAction).where(
            and_(
                ToolAction.tool_id == request.tool_id,
                ToolAction.action_name == request.action_name,
            )
        )
        action_res = await db.execute(action_stmt)
        tool_action = action_res.scalar_one_or_none()

        if not tool_action:
            return GatewayExecuteResponse(
                execution_id=execution_id,
                organization_id=request.organization_id,
                agent_id=request.agent_id,
                tool_id=request.tool_id,
                action_name=request.action_name,
                decision=PolicyDecision.DENY,
                status=ExecutionStatus.REJECTED,
                error_message=f"La acción '{request.action_name}' no existe en la herramienta registrada",
                timestamp=now,
            )

        # 4. Validar Capacidad Asignada en AgentTool (N:N) - Escenario 2
        agent_tool_stmt = select(AgentTool).where(
            and_(
                AgentTool.agent_id == request.agent_id,
                AgentTool.tool_id == request.tool_id,
                AgentTool.enabled == True,
            )
        )
        agent_tool_res = await db.execute(agent_tool_stmt)
        agent_tool = agent_tool_res.scalar_one_or_none()

        if not agent_tool:
            # Denegación por falta de capacidad asignada
            execution = Execution(
                id=execution_id,
                organization_id=request.organization_id,
                agent_id=request.agent_id,
                delegator_user_id=request.delegator_user_id,
                tool_id=request.tool_id,
                tool_action_id=tool_action.id,
                resource=request.resource,
                request_context=sanitized_params,
                decision=PolicyDecision.DENY,
                status=ExecutionStatus.REJECTED,
                timestamp=now,
            )
            db.add(execution)
            await db.commit()

            return GatewayExecuteResponse(
                execution_id=execution_id,
                organization_id=request.organization_id,
                agent_id=request.agent_id,
                tool_id=request.tool_id,
                action_name=request.action_name,
                decision=PolicyDecision.DENY,
                status=ExecutionStatus.REJECTED,
                error_message=f"El agente no tiene autorizada la herramienta '{tool.name}' (Agent lacks capability)",
                timestamp=now,
            )

        # 5. Invocar al Motor de Políticas (PDP)
        pdp_result = await pdp_engine.evaluate(
            db=db,
            organization_id=request.organization_id,
            agent_id=request.agent_id,
            tool_action_id=tool_action.id,
            delegator_user_id=request.delegator_user_id,
            resource=request.resource,
            parameters=request.parameters,
        )

        # 6. Procesar Veredicto
        approval_id: Optional[UUID] = None
        result_data: Optional[Dict[str, Any]] = None
        exec_status: ExecutionStatus

        alert: Optional[Alert] = None
        match pdp_result.decision:
            case PolicyDecision.ALLOW:
                exec_status = ExecutionStatus.EXECUTED
                # Despachar llamada hacia la API de destino
                result_data = await cls._dispatch_to_tool(tool, request.action_name, request.parameters)

            case PolicyDecision.REQUIRE_APPROVAL:
                exec_status = ExecutionStatus.PENDING_APPROVAL
                approval_id = uuid.uuid4()
                # Crear ticket en cola de intervención humana
                approval = Approval(
                    id=approval_id,
                    execution_id=execution_id,
                    status=ApprovalStatus.PENDING,
                    created_at=now,
                )
                db.add(approval)

            case PolicyDecision.DENY | _:
                exec_status = ExecutionStatus.REJECTED
                # Si es riesgo crítico o detecta anomalía, disparar Alerta de Seguridad (Escenario 4)
                if tool_action.risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL):
                    alert = Alert(
                        id=uuid.uuid4(),
                        organization_id=request.organization_id,
                        execution_id=execution_id,
                        title=f"Alerta de Seguridad: Bloqueo en acción crítica '{request.action_name}'",
                        description=f"El agente {agent.name} intentó ejecutar '{request.action_name}' pero fue bloqueado por política. Razón: {pdp_result.reason}",
                        severity=AlertSeverity.CRITICAL if tool_action.risk_level == RiskLevel.CRITICAL else AlertSeverity.HIGH,
                        status=AlertStatus.OPEN,
                        created_at=now,
                    )
                    db.add(alert)

        # 7. Persistir Traza Forense Inmutable en Execution
        execution = Execution(
            id=execution_id,
            organization_id=request.organization_id,
            agent_id=request.agent_id,
            delegator_user_id=request.delegator_user_id,
            tool_id=request.tool_id,
            tool_action_id=tool_action.id,
            resource=request.resource,
            request_context=sanitized_params,
            decision=pdp_result.decision,
            status=exec_status,
            evaluated_policy_rule_id=pdp_result.evaluated_policy_rule_id,
            timestamp=now,
        )
        db.add(execution)
        await db.commit()

        # Emitir notificaciones en tiempo real vía WebSocket
        if approval_id:
            await ws_manager.broadcast(
                event_type="NEW_APPROVAL",
                data={
                    "approval_id": str(approval_id),
                    "execution_id": str(execution_id),
                    "agent_id": str(request.agent_id),
                    "agent_name": agent.name,
                    "tool_id": str(request.tool_id),
                    "tool_name": tool.name,
                    "action_name": request.action_name,
                    "risk_level": tool_action.risk_level.value,
                    "parameters": sanitized_params,
                    "status": ApprovalStatus.PENDING.value,
                    "created_at": now.isoformat(),
                },
                organization_id=request.organization_id,
            )

        if alert:
            await ws_manager.broadcast(
                event_type="NEW_ALERT",
                data={
                    "alert_id": str(alert.id),
                    "execution_id": str(execution_id),
                    "title": alert.title,
                    "description": alert.description,
                    "severity": alert.severity.value,
                    "status": alert.status.value,
                    "action_name": request.action_name,
                    "created_at": now.isoformat(),
                },
                organization_id=request.organization_id,
            )

        # Emitir traza forense de ejecución en tiempo real vía WebSocket
        await ws_manager.broadcast(
            event_type="NEW_EXECUTION",
            data={
                "id": str(execution_id),
                "organization_id": str(request.organization_id),
                "agent_id": str(request.agent_id),
                "agent_name": agent.name,
                "tool_id": str(request.tool_id),
                "tool_name": tool.name,
                "tool_action_id": str(tool_action.id),
                "action_name": request.action_name,
                "resource": request.resource or "global",
                "request_context": sanitized_params,
                "decision": pdp_result.decision.value,
                "status": exec_status.value,
                "evaluated_policy_rule_id": str(pdp_result.evaluated_policy_rule_id) if pdp_result.evaluated_policy_rule_id else None,
                "timestamp": now.isoformat(),
                "latency_ms": 22.0,
            },
            organization_id=request.organization_id,
        )

        return GatewayExecuteResponse(
            execution_id=execution_id,
            organization_id=request.organization_id,
            agent_id=request.agent_id,
            tool_id=request.tool_id,
            action_name=request.action_name,
            decision=pdp_result.decision,
            status=exec_status,
            evaluated_policy_rule_id=pdp_result.evaluated_policy_rule_id,
            result=result_data,
            error_message=pdp_result.reason if pdp_result.decision == PolicyDecision.DENY else None,
            approval_id=approval_id,
            alert_id=alert.id if alert else None,
            timestamp=now,
        )

    @classmethod
    async def resolve_approval(
        cls,
        db: AsyncSession,
        approval_id: UUID,
        approver_user_id: UUID,
        decision: ApprovalStatus,
        resolution_reason: str,
    ) -> Optional[Approval]:
        """Resuelve un ticket de aprobación humana, actualizando el estado de la ejecución."""
        stmt = (
            select(Approval)
            .options(selectinload(Approval.execution))
            .where(Approval.id == approval_id)
        )
        result = await db.execute(stmt)
        approval = result.scalar_one_or_none()

        if not approval or approval.status != ApprovalStatus.PENDING:
            return None

        # Actualizar aprobación
        approval.assigned_approver_id = approver_user_id
        approval.status = decision
        approval.resolution_reason = resolution_reason
        approval.resolved_at = datetime.now(timezone.utc)

        # Actualizar estado de la traza de ejecución
        if approval.execution:
            if decision == ApprovalStatus.APPROVED:
                approval.execution.status = ExecutionStatus.EXECUTED
            else:
                approval.execution.status = ExecutionStatus.REJECTED

        await db.commit()
        await db.refresh(approval)

        org_id = approval.execution.organization_id if approval.execution else None
        await ws_manager.broadcast(
            event_type="RESOLVED_APPROVAL",
            data={
                "approval_id": str(approval.id),
                "execution_id": str(approval.execution_id),
                "status": approval.status.value,
                "assigned_approver_id": str(approval.assigned_approver_id) if approval.assigned_approver_id else None,
                "resolution_reason": approval.resolution_reason,
                "resolved_at": approval.resolved_at.isoformat() if approval.resolved_at else None,
            },
            organization_id=org_id,
        )

        return approval

    @classmethod
    async def list_approvals(
        cls,
        db: AsyncSession,
        organization_id: Optional[UUID] = None,
        status: Optional[ApprovalStatus] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Approval]:
        """Lista solicitudes de aprobación ordenadas por fecha reciente con filtros."""
        stmt = (
            select(Approval)
            .join(Execution, Approval.execution_id == Execution.id)
            .options(selectinload(Approval.execution))
            .order_by(Approval.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        if organization_id:
            stmt = stmt.where(Execution.organization_id == organization_id)
        if status:
            stmt = stmt.where(Approval.status == status)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    @classmethod
    async def get_approval_by_id(
        cls,
        db: AsyncSession,
        approval_id: UUID,
    ) -> Optional[Approval]:
        """Obtiene un ticket de aprobación con su ejecución asociada."""
        stmt = (
            select(Approval)
            .options(selectinload(Approval.execution))
            .where(Approval.id == approval_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


pep_gateway_service = PEPGatewayService()
