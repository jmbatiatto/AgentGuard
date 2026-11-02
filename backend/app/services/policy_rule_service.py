import inspect
import logging
from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import redis.asyncio as aioredis

from app.core.config import settings
from app.models.agent import Agent
from app.models.policy import Policy, PolicyRule
from app.models.tool import Tool, ToolAction
from app.schemas.policy_rule import PolicyRuleCreate, PolicyRuleCreateInPolicy, PolicyRuleUpdate

logger = logging.getLogger("agentguard.policy_rules")


async def _invalidate_policy_cache(organization_id: Optional[UUID] = None) -> None:
    """Invalida de forma segura el caché de políticas en Redis (best-effort, fail-open ante fallo de caché)."""
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            socket_timeout=0.5,
            socket_connect_timeout=0.5,
        )
        pattern = f"policies:{organization_id}:*" if organization_id else "policies:*"
        keys = await redis_client.keys(pattern)
        if keys:
            await redis_client.delete(*keys)
        await redis_client.aclose()
    except Exception as exc:
        logger.debug("Redis cache invalidation skipped or failed: %s", exc)


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
        await db.refresh(rule)
        return rule

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
    async def create_rule_in_policy(
        cls,
        db: AsyncSession,
        policy_id: UUID,
        rule_in: PolicyRuleCreateInPolicy,
        organization_id: Optional[UUID] = None,
    ) -> PolicyRule:
        """Crea una regla determinista dentro del contexto jerárquico de una política validando tenant."""
        stmt_policy = select(Policy).where(Policy.id == policy_id)
        if organization_id:
            stmt_policy = stmt_policy.where(Policy.organization_id == organization_id)
        result_policy = await db.execute(stmt_policy)
        policy = result_policy.scalar_one_or_none()
        if not policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Política con ID {policy_id} no encontrada",
            )

        stmt_action = (
            select(ToolAction)
            .options(selectinload(ToolAction.tool))
            .where(ToolAction.id == rule_in.tool_action_id)
        )
        res_action = await db.execute(stmt_action)
        tool_action = res_action.scalar_one_or_none()
        if not tool_action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Acción de herramienta con ID {rule_in.tool_action_id} no encontrada",
            )

        tool = tool_action.tool
        if not tool:
            res_tool = await db.execute(select(Tool).where(Tool.id == tool_action.tool_id))
            tool = res_tool.scalar_one_or_none()
        if tool and tool.organization_id != policy.organization_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La acción de herramienta especificada no pertenece a la misma organización de la política",
            )

        if rule_in.target_agent_id:
            res_agent = await db.execute(select(Agent).where(Agent.id == rule_in.target_agent_id))
            agent = res_agent.scalar_one_or_none()
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

        rule = PolicyRule(
            policy_id=policy_id,
            tool_action_id=rule_in.tool_action_id,
            target_agent_id=rule_in.target_agent_id,
            priority=rule_in.priority,
            effect=rule_in.effect,
            conditions=rule_in.conditions,
        )
        db.add(rule)
        await db.commit()
        await db.refresh(rule)

        await _invalidate_policy_cache(policy.organization_id)
        return await cls.get_by_id(db=db, rule_id=rule.id) or rule

    @classmethod
    async def update_rule(
        cls,
        db: AsyncSession,
        rule_id: UUID,
        rule_in: PolicyRuleUpdate,
        organization_id: Optional[UUID] = None,
    ) -> Optional[PolicyRule]:
        """Actualiza atributos de una regla atómica respetando aislamiento de tenant (JOIN con Policy)."""
        stmt = (
            select(PolicyRule)
            .join(Policy, PolicyRule.policy_id == Policy.id)
            .options(
                selectinload(PolicyRule.policy),
                selectinload(PolicyRule.tool_action).selectinload(ToolAction.tool),
                selectinload(PolicyRule.target_agent),
            )
            .where(PolicyRule.id == rule_id)
        )
        if organization_id:
            stmt = stmt.where(Policy.organization_id == organization_id)

        result = await db.execute(stmt)
        rule = result.scalar_one_or_none()
        if not rule:
            return None

        if rule_in.priority is not None:
            rule.priority = rule_in.priority
        if rule_in.effect is not None:
            rule.effect = rule_in.effect
        if rule_in.conditions is not None:
            rule.conditions = rule_in.conditions
        if "target_agent_id" in rule_in.model_fields_set:
            if rule_in.target_agent_id is not None:
                res_agent = await db.execute(select(Agent).where(Agent.id == rule_in.target_agent_id))
                agent = res_agent.scalar_one_or_none()
                if not agent:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Agente objetivo con ID {rule_in.target_agent_id} no encontrado",
                    )
                if rule.policy and agent.organization_id != rule.policy.organization_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="El agente objetivo no pertenece a la misma organización de la política",
                    )
            rule.target_agent_id = rule_in.target_agent_id

        await db.commit()
        await db.refresh(rule)

        org_id = rule.policy.organization_id if rule.policy else organization_id
        await _invalidate_policy_cache(org_id)
        return rule

    update = update_rule

    @classmethod
    async def delete_rule(
        cls,
        db: AsyncSession,
        rule_id: UUID,
        organization_id: Optional[UUID] = None,
    ) -> bool:
        """Elimina una regla individual sin destruir la política contenedora, validando tenant."""
        stmt = (
            select(PolicyRule)
            .join(Policy, PolicyRule.policy_id == Policy.id)
            .options(selectinload(PolicyRule.policy))
            .where(PolicyRule.id == rule_id)
        )
        if organization_id:
            stmt = stmt.where(Policy.organization_id == organization_id)

        result = await db.execute(stmt)
        rule = result.scalar_one_or_none()
        if not rule:
            return False

        org_id = rule.policy.organization_id if rule.policy else organization_id
        del_res = db.delete(rule)
        if inspect.isawaitable(del_res):
            await del_res
        await db.commit()

        await _invalidate_policy_cache(org_id)
        return True

    delete = delete_rule


policy_rule_service = PolicyRuleService()

