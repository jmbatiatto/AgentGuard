"""Schemas Pydantic v2 para la Bandeja de Aprobación Humana (HITL)."""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import Field, field_validator

from app.models.enums import ApprovalStatus
from app.schemas.base import BaseSchema
from app.schemas.gateway import ExecutionRead


class ApprovalResolveRequest(BaseSchema):
    """Payload emitido por un operador para aprobar o rechazar una acción suspendida."""

    decision: ApprovalStatus = Field(
        ...,
        description="Resolución humana: APPROVED o REJECTED",
    )
    resolution_reason: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="Motivo documentado y justificado de la decisión del humano",
    )
    approver_user_id: UUID = Field(
        ...,
        description="ID del usuario con rol APPROVER que resuelve la solicitud",
    )

    @field_validator("decision")
    @classmethod
    def validate_resolution_decision(cls, v: ApprovalStatus) -> ApprovalStatus:
        if v not in (ApprovalStatus.APPROVED, ApprovalStatus.REJECTED):
            raise ValueError("La decisión solo puede ser 'APPROVED' o 'REJECTED'")
        return v


class ApprovalRead(BaseSchema):
    """Lectura de una solicitud de aprobación."""

    id: UUID
    execution_id: UUID
    assigned_approver_id: Optional[UUID] = None
    status: ApprovalStatus
    resolution_reason: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime


class ApprovalDetailRead(ApprovalRead):
    """Lectura detallada de aprobación incluyendo el contexto de ejecución."""

    execution: Optional[ExecutionRead] = None
