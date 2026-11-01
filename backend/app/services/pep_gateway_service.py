"""Servicio Central del Gateway de Ejecución (PEP - Policy Enforcement Point).

Actúa como el perímetro de control físico e intercepción de AgentGuard.
Valida capacidades de agentes (AgentTool), resuelve acciones atómicas,
invoca al PDP determinista, sanitiza contextos según OWASP LLM06,
persiste trazas forenses inmutables y enruta o bloquea llamadas.
"""

import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException, status
import httpx
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.redis_vault import redis_vault
from app.core.websocket_manager import ws_manager
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
    UserRole,
)
from app.models.execution import Execution
from app.models.tool import Tool, ToolAction
from app.models.user import User
from app.schemas.gateway import GatewayExecuteRequest, GatewayExecuteResponse
from app.services.pdp_engine import pdp_engine
from app.services.sanitizer_service import sanitizer_service
from app.services.threat_detector import threat_detector

logger = logging.getLogger("agentguard.pep")


class PEPGatewayService:
    """Orquestador de autorización, ejecución y auditoría en tiempo de ejecución."""

    @staticmethod
    async def _dispatch_to_tool(
        tool: Tool,
        action_name: str,
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Despacha la llamada HTTP a la API externa de destino o retorna simulación si es SANDBOX."""
        endpoint = f"{tool.endpoint_url.rstrip('/')}/{action_name}"

        is_live = getattr(tool, "execution_mode", "SANDBOX") == "LIVE_REST" and not any(
            domain in tool.endpoint_url for domain in ("acmecorp.internal", "localhost", "127.0.0.1", "test", "api.corp", "internal")
        )

        if is_live:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.post(endpoint, json=parameters)
                    if resp.status_code >= 400:
                        raise HTTPException(
                            status_code=status.HTTP_502_BAD_GATEWAY,
                            detail=f"Herramienta externa '{tool.name}' retornó error HTTP {resp.status_code}: {resp.text[:200]}",
                        )
                    try:
                        return resp.json()
                    except Exception:
                        return {"raw": resp.text, "status_code": resp.status_code}
            except HTTPException:
                raise
            except Exception as exc:
                logger.error("Error al conectar con la herramienta externa %s: %s", endpoint, exc)
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail=f"Fallo de conexión o timeout con la herramienta externa '{tool.name}': {str(exc)}",
                )

        # Modo SANDBOX determinista de demostración
        return {
            "status": "success",
            "simulated": True,
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
        start_time = time.perf_counter()
        execution_id = uuid.uuid4()
        now = datetime.now(timezone.utc)

        # 1. Sanitizar parámetros de entrada de inmediato (OWASP LLM06)
        sanitized_params = sanitizer_service.sanitize(request.parameters)

        # 1.1. Inspección heurística de vectores de ataque hostiles (OWASP Top 10 for Agentic Applications 2026)
        threat = threat_detector.analyze(
            parameters=request.parameters,
            resource=request.resource,
            action_name=request.action_name,
        )

        # 1.2. Validar usuario delegador si está presente (evita ForeignKeyViolationError)
        if request.delegator_user_id:
            user_stmt = select(User).where(User.id == request.delegator_user_id)
            user_res = await db.execute(user_stmt)
            delegator = user_res.scalar_one_or_none()
            if not delegator or delegator.organization_id != request.organization_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El usuario delegador '{request.delegator_user_id}' no existe o no pertenece a la organización tenant",
                )

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
            latency_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
            return GatewayExecuteResponse(
                execution_id=execution_id,
                organization_id=request.organization_id,
                agent_id=request.agent_id,
                tool_id=request.tool_id,
                action_name=request.action_name,
                decision=PolicyDecision.DENY,
                status=ExecutionStatus.BLOCKED,
                error_message="El agente no existe o no pertenece a esta organización",
                timestamp=now,
            )

        if agent.status != AgentStatus.ACTIVE:
            latency_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
            # Regla 7: Registrar traza forense inmutable ante intento de agente inactivo
            execution = Execution(
                id=execution_id,
                organization_id=request.organization_id,
                agent_id=agent.id,
                delegator_user_id=request.delegator_user_id,
                tool_id=request.tool_id,
                tool_action_id=uuid.uuid4(),  # placeholder si no se resuelve acción
                resource=request.resource,
                request_context=sanitized_params,
                decision=PolicyDecision.DENY,
                status=ExecutionStatus.BLOCKED,
                timestamp=now,
                latency_ms=latency_ms,
            )
            try:
                db.add(execution)
                await db.commit()
            except Exception as exc:
                logger.warning("No se pudo persistir traza de agente suspendido: %s", exc)

            return GatewayExecuteResponse(
                execution_id=execution_id,
                organization_id=request.organization_id,
                agent_id=request.agent_id,
                tool_id=request.tool_id,
                action_name=request.action_name,
                decision=PolicyDecision.DENY,
                status=ExecutionStatus.BLOCKED,
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

        # 4. Validar Capacidad Asignada en AgentTool (N:N)
        agent_tool_stmt = select(AgentTool).where(
            and_(
                AgentTool.agent_id == request.agent_id,
                AgentTool.tool_id == request.tool_id,
                AgentTool.enabled == True,
            )
        )
        agent_tool_res = await db.execute(agent_tool_stmt)
        agent_tool = agent_tool_res.scalar_one_or_none()

        approval_id: Optional[UUID] = None
        result_data: Optional[Dict[str, Any]] = None
        alert: Optional[Alert] = None
        approval: Optional[Approval] = None
        evaluated_rule_id: Optional[UUID] = None
        rejection_reason: Optional[str] = None

        # 5. Si se detectó amenaza hostil (OWASP 2026), SIEMPRE genera alerta crítica, incluso si falta AgentTool
        if threat.is_threat:
            logger.warning(
                "¡Vector hostil detectado por Gateway PEP! Tipo: %s, Vector: %s, Categoría OWASP: %s",
                threat.threat_type, threat.attack_vector, threat.owasp_category
            )
            final_decision = PolicyDecision.DENY
            exec_status = ExecutionStatus.REJECTED
            rejection_reason = f"Bloqueo Gateway PEP: {threat.details}"

            alert = Alert(
                id=uuid.uuid4(),
                organization_id=request.organization_id,
                execution_id=execution_id,
                title=f"Alerta de Seguridad: Bloqueo en acción crítica '{request.action_name}' - [{threat.owasp_category.split(':')[0]}]",
                description=(
                    f"El agente {agent.name} intentó ejecutar '{request.action_name}'. "
                    f"Veredicto Gateway: Bloqueado por vector de ataque hostil ({threat.owasp_category}). "
                    f"Detalle: {threat.details}"
                ),
                severity=AlertSeverity.CRITICAL,
                status=AlertStatus.OPEN,
                created_at=now,
            )

            security_telemetry = {
                "is_threat": True,
                "threat_type": threat.threat_type,
                "owasp_category": threat.owasp_category,
                "attack_vector": threat.attack_vector,
                "confidence": threat.confidence,
                "matched_pattern": threat.matched_pattern,
                "details": threat.details,
                "decoded_payload": threat.decoded_payload,
            }
            sanitized_params["_security_threat"] = security_telemetry

        elif not agent_tool:
            # Denegación determinista por falta de capacidad asignada en AgentTool (Escenario 2)
            final_decision = PolicyDecision.DENY
            exec_status = ExecutionStatus.REJECTED
            rejection_reason = f"El agente no tiene autorizada la herramienta '{tool.name}' (Agent lacks capability)"
            security_telemetry = {
                "is_threat": False,
                "status": "CAPABILITY_DENIED",
                "owasp_compliance": "OWASP GenAI LLM06 Sanitized",
            }

        else:
            # 6. Invocar al Motor de Políticas (PDP)
            pdp_result = await pdp_engine.evaluate(
                db=db,
                organization_id=request.organization_id,
                agent_id=request.agent_id,
                tool_action_id=tool_action.id,
                delegator_user_id=request.delegator_user_id,
                resource=request.resource,
                parameters=request.parameters,
            )
            final_decision = pdp_result.decision
            evaluated_rule_id = pdp_result.evaluated_policy_rule_id
            rejection_reason = pdp_result.reason
            security_telemetry = {
                "is_threat": False,
                "status": "CLEAN",
                "owasp_compliance": "OWASP GenAI LLM06 Sanitized",
            }

            match final_decision:
                case PolicyDecision.ALLOW:
                    exec_status = ExecutionStatus.EXECUTED
                    result_data = await cls._dispatch_to_tool(tool, request.action_name, request.parameters)

                case PolicyDecision.REQUIRE_APPROVAL:
                    exec_status = ExecutionStatus.PENDING_APPROVAL
                    approval_id = uuid.uuid4()
                    approval = Approval(
                        id=approval_id,
                        execution_id=execution_id,
                        status=ApprovalStatus.PENDING,
                        created_at=now,
                    )
                    # Custodiar parámetros originales en Redis Hitl Vault para el re-despacho
                    await redis_vault.store_payload(approval_id, request.parameters, ttl_seconds=900)

                case PolicyDecision.DENY:
                    exec_status = ExecutionStatus.REJECTED
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

                case _:
                    exec_status = ExecutionStatus.REJECTED
                    rejection_reason = "Veredicto no reconocido. Aplicando Fail-Closed."

        # 7. Persistir Traza Forense Inmutable en Execution con latencia real y resultado
        latency_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
        execution = Execution(
            id=execution_id,
            organization_id=request.organization_id,
            agent_id=request.agent_id,
            delegator_user_id=request.delegator_user_id,
            tool_id=request.tool_id,
            tool_action_id=tool_action.id,
            resource=request.resource,
            request_context=sanitized_params,
            decision=final_decision,
            status=exec_status,
            evaluated_policy_rule_id=evaluated_rule_id,
            timestamp=now,
            latency_ms=latency_ms,
            response_payload=result_data,
        )
        db.add(execution)

        if alert:
            alert.execution = execution
            db.add(alert)

        if approval:
            approval.execution = execution
            db.add(approval)

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

        # Emitir traza forense de ejecución en tiempo real vía WebSocket (con id y execution_id)
        await ws_manager.broadcast(
            event_type="NEW_EXECUTION",
            data={
                "id": str(execution_id),
                "execution_id": str(execution_id),
                "organization_id": str(request.organization_id),
                "agent_id": str(request.agent_id),
                "agent_name": agent.name,
                "tool_id": str(request.tool_id),
                "tool_name": tool.name,
                "tool_action_id": str(tool_action.id),
                "action_name": request.action_name,
                "resource": request.resource or "global",
                "request_context": sanitized_params,
                "decision": final_decision.value,
                "status": exec_status.value,
                "evaluated_policy_rule_id": str(evaluated_rule_id) if evaluated_rule_id else None,
                "timestamp": now.isoformat(),
                "latency_ms": latency_ms,
            },
            organization_id=request.organization_id,
        )

        return GatewayExecuteResponse(
            execution_id=execution_id,
            organization_id=request.organization_id,
            agent_id=request.agent_id,
            tool_id=request.tool_id,
            action_name=request.action_name,
            decision=final_decision,
            status=exec_status,
            evaluated_policy_rule_id=evaluated_rule_id,
            result=result_data,
            error_message=rejection_reason if final_decision == PolicyDecision.DENY else None,
            approval_id=approval_id,
            alert_id=alert.id if alert else None,
            security_analysis=security_telemetry,
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
        """Resuelve un ticket de aprobación humana con bloqueo pesimista, TTL de 15 min y reanudación desde vault."""
        stmt = (
            select(Approval)
            .options(
                selectinload(Approval.execution).selectinload(Execution.tool),
                selectinload(Approval.execution).selectinload(Execution.tool_action),
            )
            .where(Approval.id == approval_id)
            .with_for_update()
        )
        result = await db.execute(stmt)
        approval = result.scalar_one_or_none()

        if not approval or approval.status != ApprovalStatus.PENDING:
            return None

        # 1. Validar existencia y rol del usuario aprobador (Regla 6 AGENTS.md: APPROVER o ADMIN)
        if approver_user_id:
            approver_res = await db.execute(select(User).where(User.id == approver_user_id))
            approver = approver_res.scalar_one_or_none()
            if not approver:
                logger.warning("Usuario aprobador %s no encontrado.", approver_user_id)
                return None
            if approver.role not in (UserRole.APPROVER, UserRole.ADMIN):
                logger.warning(
                    "Usuario %s (rol %s) no tiene privilegios de APPROVER o ADMIN para resolver aprobaciones.",
                    approver_user_id, approver.role
                )
                return None
            if approval.execution and approver.organization_id != approval.execution.organization_id:
                logger.warning(
                    "Fuga multi-tenant: Usuario %s intentó resolver aprobación de org ajena",
                    approver_user_id
                )
                return None

        # 2. Verificar TTL / Expiración de 15 minutos (Fail-Closed)
        now = datetime.now(timezone.utc)
        created_at = approval.created_at
        if created_at:
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
            if (now - created_at).total_seconds() > 900:  # 15 minutos
                approval.status = ApprovalStatus.EXPIRED
                approval.resolution_reason = "Expirado por timeout de seguridad (TTL de 15 minutos superado sin intervención)"
                if approval.execution:
                    approval.execution.status = ExecutionStatus.EXPIRED
                await db.commit()
                await db.refresh(approval)
                return approval

        # 3. Actualizar aprobación
        approval.assigned_approver_id = approver_user_id
        approval.status = decision
        approval.resolution_reason = resolution_reason
        approval.resolved_at = now

        # 4. Actualizar estado de la traza de ejecución y reanudar herramienta si APPROVED
        if approval.execution:
            if decision == ApprovalStatus.APPROVED:
                approval.execution.status = ExecutionStatus.EXECUTED
                # Recuperar parámetros originales no sanitizados de la bóveda Redis Hitl Vault
                raw_params = await redis_vault.retrieve_and_purge_payload(approval.id)
                dispatch_params = raw_params or approval.execution.request_context or {}

                if approval.execution.tool and approval.execution.tool_action:
                    try:
                        dispatch_res = await cls._dispatch_to_tool(
                            tool=approval.execution.tool,
                            action_name=approval.execution.tool_action.action_name,
                            parameters=dispatch_params,
                        )
                        approval.execution.response_payload = dispatch_res
                    except Exception as exc:
                        logger.warning("Fallo al re-despachar a herramienta tras aprobación: %s", exc)
                        approval.execution.response_payload = {"error": str(exc)}
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


pep_gateway_service = PEPGatewayService()
