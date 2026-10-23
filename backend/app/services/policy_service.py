"""Servicio de lógica de negocio y persistencia para Contenedores de Políticas (Policies)."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.policy import Policy, PolicyRule
from app.models.tool import ToolAction
from app.schemas.policy import PolicyCreate, PolicyUpdate


class PolicyService:
    """Gestiona operaciones CRUD sobre la entidad Policy con aislamiento multi-tenant."""

    @staticmethod
    async def create(db: AsyncSession, policy_in: PolicyCreate) -> Policy:
        """Crea un nuevo contenedor de políticas en la base de datos."""
        policy = Policy(
            organization_id=policy_in.organization_id,
            name=policy_in.name,
            description=policy_in.description,
            priority=policy_in.priority,
            is_active=policy_in.is_active,
        )
        db.add(policy)
        await db.commit()
        await db.refresh(policy)
        return policy

    @staticmethod
    async def get_by_id(db: AsyncSession, policy_id: UUID) -> Optional[Policy]:
        """Obtiene un contenedor de política por su UUID primario con sus reglas cargadas."""
        stmt = (
            select(Policy)
            .options(
                selectinload(Policy.rules).selectinload(PolicyRule.tool_action).selectinload(ToolAction.tool),
                selectinload(Policy.rules).selectinload(PolicyRule.target_agent),
            )
            .where(Policy.id == policy_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_by_org(
        db: AsyncSession,
        organization_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Policy]:
        """Lista políticas ordenadas por prioridad descendente con paginación, reglas y acciones."""
        stmt = (
            select(Policy)
            .options(
                selectinload(Policy.rules).selectinload(PolicyRule.tool_action).selectinload(ToolAction.tool),
                selectinload(Policy.rules).selectinload(PolicyRule.target_agent),
            )
            .order_by(Policy.priority.desc(), Policy.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        if organization_id:
            stmt = stmt.where(Policy.organization_id == organization_id)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def update(db: AsyncSession, policy_id: UUID, policy_in: PolicyUpdate) -> Optional[Policy]:
        """Actualiza atributos de una política (ej. toggle de activación o prioridad)."""
        policy = await PolicyService.get_by_id(db=db, policy_id=policy_id)
        if not policy:
            return None

        if policy_in.name is not None:
            policy.name = policy_in.name
        if policy_in.description is not None:
            policy.description = policy_in.description
        if policy_in.priority is not None:
            policy.priority = policy_in.priority
        if policy_in.is_active is not None:
            policy.is_active = policy_in.is_active

        await db.commit()
        await db.refresh(policy)
        return policy

    @staticmethod
    async def delete(db: AsyncSession, policy_id: UUID) -> bool:
        """Elimina una política y sus reglas asociadas por cascada."""
        policy = await PolicyService.get_by_id(db=db, policy_id=policy_id)
        if not policy:
            return False

        await db.delete(policy)
        await db.commit()
        return True


policy_service = PolicyService()

