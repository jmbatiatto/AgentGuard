"""Servicio de lógica de negocio y persistencia para Herramientas Externas (Tools)."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.agent import AgentTool
from app.models.tool import Tool
from app.schemas.tool import ToolCreate, ToolUpdate


class ToolService:
    """Gestiona operaciones CRUD sobre la entidad Tool con aislamiento multi-tenant."""

    @staticmethod
    async def create(db: AsyncSession, tool_in: ToolCreate) -> Tool:
        """Crea una nueva herramienta externa en la base de datos."""
        tool = Tool(
            organization_id=tool_in.organization_id,
            name=tool_in.name,
            protocol=tool_in.protocol,
            endpoint_url=tool_in.endpoint_url,
            description=tool_in.description,
        )
        db.add(tool)
        await db.commit()
        await db.refresh(tool)
        return tool

    @staticmethod
    async def get_by_id(db: AsyncSession, tool_id: UUID) -> Optional[Tool]:
        """Obtiene una herramienta por su UUID primario cargando acciones y agentes asociados."""
        stmt = (
            select(Tool)
            .options(
                selectinload(Tool.actions),
                selectinload(Tool.agent_tools).selectinload(AgentTool.agent),
            )
            .where(Tool.id == tool_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_by_org(
        db: AsyncSession,
        organization_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Tool]:
        """Lista herramientas externas con paginación, acciones y agentes asociados."""
        stmt = (
            select(Tool)
            .options(
                selectinload(Tool.actions),
                selectinload(Tool.agent_tools).selectinload(AgentTool.agent),
            )
            .order_by(Tool.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        if organization_id:
            stmt = stmt.where(Tool.organization_id == organization_id)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def update(db: AsyncSession, tool_id: UUID, tool_in: ToolUpdate) -> Optional[Tool]:
        """Actualiza atributos de una herramienta externa existente."""
        tool = await ToolService.get_by_id(db=db, tool_id=tool_id)
        if not tool:
            return None

        if tool_in.name is not None:
            tool.name = tool_in.name
        if tool_in.protocol is not None:
            tool.protocol = tool_in.protocol
        if tool_in.endpoint_url is not None:
            tool.endpoint_url = tool_in.endpoint_url
        if tool_in.description is not None:
            tool.description = tool_in.description

        await db.commit()
        await db.refresh(tool)
        return tool

    @staticmethod
    async def delete(db: AsyncSession, tool_id: UUID) -> bool:
        """Elimina una herramienta externa por su UUID."""
        tool = await ToolService.get_by_id(db=db, tool_id=tool_id)
        if not tool:
            return False

        await db.delete(tool)
        await db.commit()
        return True


tool_service = ToolService()

