"""Servicio de lógica de negocio y persistencia para Reglas Deterministas de Políticas (PolicyRules)."""

from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.policy_cache import policy_cache
from app.models.enums import RuleEffect
from app.models.policy import Policy, PolicyRule
from app.models.tool import ToolAction
from app.schemas.policy_rule import PolicyRuleCreate


class PolicyRuleService:
    """Gestiona operaciones CRUD sobre la entidad PolicyRule evaluada por el motor PDP."""

    @classmethod
    async def create(cls, db: AsyncSession, rule_in: PolicyRuleCreate) -> PolicyRule:
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
        pol = await db.get(Policy, rule_in.policy_id)
        if pol:
            await policy_cache.invalidate(pol.organization_id, rule_in.tool_action_id)
        reloaded = await cls.get_by_id(db=db, rule_id=rule.id)
        return reloaded or rule

    @staticmethod
    async def get_by_id(db: AsyncSession, rule_id: UUID) -> Optional[PolicyRule]:
        """Obtiene una regla por su UUID primario cargando ansiosamente relaciones requeridas por @property."""
        stmt = (
            select(PolicyRule)
            .options(
                selectinload(PolicyRule.tool_action).selectinload(ToolAction.tool),
                selectinload(PolicyRule.target_agent),
            )
            .where(PolicyRule.id == rule_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_rules(
        db: AsyncSession,
        policy_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[PolicyRule]:
        """Lista reglas ordenadas por prioridad descendente con paginación y carga ansiosa anti-MissingGreenlet."""
        stmt = (
            select(PolicyRule)
            .options(
                selectinload(PolicyRule.tool_action).selectinload(ToolAction.tool),
                selectinload(PolicyRule.target_agent),
            )
            .order_by(PolicyRule.priority.desc(), PolicyRule.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        if policy_id:
            stmt = stmt.where(PolicyRule.policy_id == policy_id)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    @classmethod
    async def delete(cls, db: AsyncSession, rule_id: UUID) -> bool:
        """Elimina una regla de política por su UUID."""
        rule = await cls.get_by_id(db=db, rule_id=rule_id)
        if not rule:
            return False
        pol = await db.get(Policy, rule.policy_id)
        action_id = rule.tool_action_id
        await db.delete(rule)
        await db.commit()
        if pol:
            await policy_cache.invalidate(pol.organization_id, action_id)
        return True


policy_rule_service = PolicyRuleService()
