"""Schemas Pydantic v2 para Trazas de Ejecución (Execution Trace)."""

from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import Field

from app.models.enums import PolicyDecision, ExecutionStatus
from app.schemas.base import BaseSchema


class ExecutionResponse(BaseSchema):
    """Esquema de respuesta para traza de ejecución forense inmutable."""

    id: UUID = Field(..., description="ID de la traza de ejecución")
    organization_id: UUID = Field(..., description="ID de la organización tenant")
    agent_id: UUID = Field(..., description="ID del agente de IA")
    agent_name: Optional[str] = Field(default=None, description="Nombre legible del agente")
    tool_id: UUID = Field(..., description="ID de la herramienta externa")
    tool_name: Optional[str] = Field(default=None, description="Nombre legible de la herramienta")
    tool_action_id: UUID = Field(..., description="ID de la acción atómica")
    action_name: Optional[str] = Field(default=None, description="Nombre atómico de la acción ejecutada")
    resource: Optional[str] = Field(default=None, description="Recurso afectado")
    request_context: Dict[str, Any] = Field(default_factory=dict, description="Contexto sanitizado de la llamada")
    decision: PolicyDecision = Field(..., description="Decisión del PDP: ALLOW, DENY o REQUIRE_APPROVAL")
    status: ExecutionStatus = Field(..., description="Estado de la ejecución: EXECUTED, REJECTED o PENDING_APPROVAL")
    evaluated_policy_rule_id: Optional[UUID] = Field(default=None, description="Regla de política evaluada")
    timestamp: datetime = Field(..., description="Marca temporal inmutable de la ejecución")
    latency_ms: Optional[float] = Field(default=24.0, description="Latencia estimada o medida de evaluación en ms")
    approval_status: Optional[str] = Field(default=None, description="Estado de la aprobación HITL asociada si la hubo")
    approval_resolved_at: Optional[datetime] = Field(default=None, description="Fecha de resolución de la aprobación")
    resolution_reason: Optional[str] = Field(default=None, description="Motivo de la resolución humana emitido por el Approver")
