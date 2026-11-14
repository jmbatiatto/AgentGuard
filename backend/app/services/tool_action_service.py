"""Servicio de lógica de negocio y persistencia para Acciones Atómicas de Herramientas (ToolActions)."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.tool import Tool, ToolAction
from app.schemas.tool_action import ToolActionCreate


class ToolActionService:
    """Gestiona operaciones CRUD sobre la entidad ToolAction y sus niveles de riesgo."""

    @staticmethod
    async def create(db: AsyncSession, action_in: ToolActionCreate) -> ToolAction:
        """Crea una nueva acción atómica vinculada a una herramienta."""
        action = ToolAction(
            tool_id=action_in.tool_id,
            action_name=action_in.action_name,
            risk_level=action_in.risk_level,
            description=action_in.description,
        )
        db.add(action)
        await db.commit()
        await db.refresh(action)
        return action

    @staticmethod
    async def get_by_id(db: AsyncSession, action_id: UUID) -> Optional[ToolAction]:
        """Obtiene una acción atómica por su UUID primario cargando su herramienta contenedora."""
        stmt = (
            select(ToolAction)
            .options(selectinload(ToolAction.tool))
            .where(ToolAction.id == action_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_tool_and_name(
        db: AsyncSession,
        tool_id: UUID,
        action_name: str,
    ) -> Optional[ToolAction]:
        """Obtiene una acción por herramienta y nombre para verificar unicidad."""
        stmt = select(ToolAction).where(
            ToolAction.tool_id == tool_id,
            ToolAction.action_name == action_name,
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_actions(
        db: AsyncSession,
        tool_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
        organization_id: Optional[UUID] = None,
    ) -> List[ToolAction]:
        """Lista acciones atómicas con paginación y filtro opcional por herramienta y organización."""
        stmt = (
            select(ToolAction)
            .options(selectinload(ToolAction.tool))
            .order_by(ToolAction.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        if organization_id is not None:
            stmt = stmt.join(Tool, ToolAction.tool_id == Tool.id).where(
                Tool.organization_id == organization_id
            )
        if tool_id:
            stmt = stmt.where(ToolAction.tool_id == tool_id)

        result = await db.execute(stmt)
        return list(result.scalars().all())


tool_action_service = ToolActionService()
