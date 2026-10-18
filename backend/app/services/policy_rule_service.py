"""Servicio de lógica de negocio y persistencia para Reglas Deterministas de Políticas (PolicyRules)."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.policy import PolicyRule
from app.schemas.policy_rule import PolicyRuleCreate


class PolicyRuleService:
    """Gestiona operaciones CRUD sobre la entidad PolicyRule evaluada por el motor PDP."""

    @staticmethod
    async def create(db: AsyncSession, rule_in: PolicyRuleCreate) -> PolicyRule:
        """Crea una nueva regla de política determinista con condiciones JSONB y principio Fail-Closed."""
        rule = PolicyRule(
            policy_id=rule_in.policy_id,
            priority=rule_in.priority,
            effect=rule_in.effect,
            tool_action_id=rule_in.tool_action_id,
            target_agent_id=rule_in.target_agent_id,
            conditions=rule_in.conditions,
        )
        db.add(rule)
        await db.commit()
        await db.refresh(rule)
        return rule

    @staticmethod
    async def get_by_id(db: AsyncSession, rule_id: UUID) -> Optional[PolicyRule]:
        """Obtiene una regla por su UUID primario."""
        stmt = select(PolicyRule).where(PolicyRule.id == rule_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_rules(
        db: AsyncSession,
        policy_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[PolicyRule]:
        """Lista reglas ordenadas por prioridad descendente con paginación y filtro opcional por política."""
        stmt = (
            select(PolicyRule)
            .order_by(PolicyRule.priority.desc(), PolicyRule.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        if policy_id:
            stmt = stmt.where(PolicyRule.policy_id == policy_id)

        result = await db.execute(stmt)
        return list(result.scalars().all())


policy_rule_service = PolicyRuleService()
