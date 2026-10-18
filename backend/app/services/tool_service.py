"""Servicio de lógica de negocio y persistencia para Herramientas Externas (Tools)."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tool import Tool
from app.schemas.tool import ToolCreate


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
        """Obtiene una herramienta por su UUID primario."""
        stmt = select(Tool).where(Tool.id == tool_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_by_org(
        db: AsyncSession,
        organization_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Tool]:
        """Lista herramientas externas con paginación y filtro opcional por tenant."""
        stmt = (
            select(Tool)
            .order_by(Tool.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        if organization_id:
            stmt = stmt.where(Tool.organization_id == organization_id)

        result = await db.execute(stmt)
        return list(result.scalars().all())


tool_service = ToolService()
