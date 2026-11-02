"""Schemas Pydantic v2 para Reglas Deterministas de Autorización."""

from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import Field

from app.models.enums import RuleEffect
from app.schemas.base import BaseSchema


class PolicyRuleCreate(BaseSchema):
    """Payload para registrar una regla determinista en una política.

    Por principio Fail-Closed, si no se especifica el efecto, es DENY por defecto.
    """

    policy_id: UUID = Field(
        ...,
        description="ID de la política contenedora",
    )
    tool_action_id: UUID = Field(
        ...,
        description="ID de la acción atómica gobernada por esta regla",
    )
    target_agent_id: Optional[UUID] = Field(
        default=None,
        description="ID del agente específico (None aplica a todos los agentes)",
    )
    priority: int = Field(
        default=100,
        ge=1,
        le=1000,
        description="Prioridad de resolución ante conflictos de regla (mayor número = mayor precedencia)",
    )
    effect: RuleEffect = Field(
        default=RuleEffect.DENY,
        description="Efecto de la regla: ALLOW, DENY o REQUIRE_APPROVAL",
    )
    conditions: Dict[str, Any] = Field(
        default_factory=dict,
        description="Predicados condicionales JSONB evaluados por el PDP (ej. {'max_amount': 500})",
    )


class PolicyRuleCreateInPolicy(BaseSchema):
    """Payload para registrar una regla determinista dentro del contexto de una política de la URL."""

    tool_action_id: UUID = Field(
        ...,
        description="ID de la acción atómica gobernada por esta regla",
    )
    target_agent_id: Optional[UUID] = Field(
        default=None,
        description="ID del agente específico (None aplica globalmente a todos los agentes)",
    )
    priority: int = Field(
        default=100,
        ge=1,
        le=1000,
        description="Prioridad de resolución ante conflictos de regla (mayor número = mayor precedencia)",
    )
    effect: RuleEffect = Field(
        default=RuleEffect.DENY,
        description="Efecto de la regla: ALLOW, DENY o REQUIRE_APPROVAL",
    )
    conditions: Dict[str, Any] = Field(
        default_factory=dict,
        description="Predicados condicionales JSONB evaluados por el PDP (ej. {'max_amount': 500})",
    )


class PolicyRuleUpdate(BaseSchema):
    """Payload para actualizar propiedades de una regla atómica existente."""

    priority: Optional[int] = Field(
        default=None,
        ge=1,
        le=1000,
        description="Nueva prioridad de evaluación",
    )
    effect: Optional[RuleEffect] = Field(
        default=None,
        description="Nuevo efecto de la regla (ALLOW, DENY, REQUIRE_APPROVAL)",
    )
    conditions: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Nuevos predicados condicionales JSONB",
    )
    target_agent_id: Optional[UUID] = Field(
        default=None,
        description="Nuevo agente objetivo asignado (o None para desvincular y hacerla global)",
    )


class PolicyRuleRead(BaseSchema):
    """Respuesta con los datos completos de la regla registrada."""

    id: UUID
    policy_id: UUID
    priority: int
    effect: RuleEffect
    tool_action_id: UUID
    target_agent_id: Optional[UUID] = None
    conditions: Dict[str, Any]
    created_at: datetime
    action_name: Optional[str] = None
    tool_name: Optional[str] = None
    agent_name: str = "Global / Multi-agent"

