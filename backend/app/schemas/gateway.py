"""Schemas Pydantic v2 para el Agent Runtime Gateway (PEP)."""

from datetime import datetime, timezone
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import Field

from app.models.enums import PolicyDecision, ExecutionStatus
from app.schemas.base import BaseSchema


class GatewayExecuteRequest(BaseSchema):
    """Payload de intercepción emitido por el agente de IA al invocar una herramienta."""

    organization_id: UUID = Field(
        ...,
        description="ID de la organización tenant",
    )
    agent_id: UUID = Field(
        ...,
        description="ID del agente de IA que solicita la ejecución",
    )
    delegator_user_id: Optional[UUID] = Field(
        default=None,
        description="ID del usuario humano en cuyo nombre actúa el agente (opcional)",
    )
    tool_id: UUID = Field(
        ...,
        description="ID de la herramienta externa registrada",
    )
    action_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Nombre atómico de la acción solicitada (ej. create_quote, refund, update_price)",
    )
    parameters: Dict[str, Any] = Field(
        default_factory=dict,
        description="Parámetros/payload de la llamada propuestos por el agente",
    )
    resource: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Identificador o URI del recurso sobre el que opera la acción",
    )


class GatewayExecuteResponse(BaseSchema):
    """Respuesta síncrona del Gateway con la decisión del PDP y resultado o ticket."""

    execution_id: UUID = Field(
        ...,
        description="ID de la traza forense inmutable persistida en el sistema",
    )
    organization_id: UUID = Field(
        ...,
        description="ID de la organización tenant",
    )
    agent_id: UUID = Field(
        ...,
        description="ID del agente de IA",
    )
    tool_id: UUID = Field(
        ...,
        description="ID de la herramienta",
    )
    action_name: str = Field(
        ...,
        description="Acción atómica evaluada",
    )
    decision: PolicyDecision = Field(
        ...,
        description="Veredicto emitido por el PDP: ALLOW, DENY o REQUIRE_APPROVAL",
    )
    status: ExecutionStatus = Field(
        ...,
        description="Estado del ciclo de vida: EXECUTED, REJECTED o PENDING_APPROVAL",
    )
    evaluated_policy_rule_id: Optional[UUID] = Field(
        default=None,
        description="ID de la regla que determinó el veredicto (None si denegado por defecto)",
    )
    result: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Datos devueltos por la herramienta externa en caso de ALLOW",
    )
    error_message: Optional[str] = Field(
        default=None,
        description="Motivo de la denegación en caso de veredicto DENY",
    )
    approval_id: Optional[UUID] = Field(
        default=None,
        description="ID del ticket de aprobación generado en caso de REQUIRE_APPROVAL",
    )
    alert_id: Optional[UUID] = Field(
        default=None,
        description="ID de la alerta de seguridad generada en caso de bloqueo crítico (Escenario 4)",
    )
    security_analysis: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Telemetría heurística de análisis de amenazas OWASP Top 10 for Agentic Applications 2026",
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Marca temporal inmutable de la evaluación",
    )


class ExecutionRead(BaseSchema):
    """Lectura de una traza forense de ejecución persistida."""

    id: UUID
    organization_id: UUID
    agent_id: UUID
    delegator_user_id: Optional[UUID] = None
    tool_id: UUID
    tool_action_id: UUID
    resource: Optional[str] = None
    request_context: Dict[str, Any]
    decision: PolicyDecision
    status: ExecutionStatus
    evaluated_policy_rule_id: Optional[UUID] = None
    timestamp: datetime
