"""Servicio de lógica de negocio y persistencia para Agentes de IA y asignación de Herramientas."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import Agent, AgentTool
from app.schemas.agent import AgentCreate, AgentToolCreate


class AgentService:
    """Gestiona operaciones CRUD sobre Agent y la relación N:N AgentTool."""

    @staticmethod
    async def create(db: AsyncSession, agent_in: AgentCreate) -> Agent:
        """Crea una nueva identidad de IA en la base de datos."""
        agent = Agent(
            organization_id=agent_in.organization_id,
            owner_user_id=agent_in.owner_user_id,
            name=agent_in.name,
            purpose=agent_in.purpose,
            status=agent_in.status,
        )
        db.add(agent)
        await db.commit()
        await db.refresh(agent)
        return agent

    @staticmethod
    async def get_by_id(db: AsyncSession, agent_id: UUID) -> Optional[Agent]:
        """Obtiene un agente por su UUID primario."""
        stmt = select(Agent).where(Agent.id == agent_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_by_org(
        db: AsyncSession,
        organization_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Agent]:
        """Lista agentes con paginación y filtro opcional por tenant."""
        stmt = (
            select(Agent)
            .order_by(Agent.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        if organization_id:
            stmt = stmt.where(Agent.organization_id == organization_id)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_agent_tool(
        db: AsyncSession,
        agent_id: UUID,
        tool_id: UUID,
    ) -> Optional[AgentTool]:
        """Obtiene la asociación específica entre un agente y una herramienta."""
        stmt = select(AgentTool).where(
            AgentTool.agent_id == agent_id,
            AgentTool.tool_id == tool_id,
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def assign_tool(
        db: AsyncSession,
        agent_id: UUID,
        tool_in: AgentToolCreate,
    ) -> AgentTool:
        """Asigna una herramienta al agente o actualiza su configuración contextual si ya existe."""
        existing = await AgentService.get_agent_tool(db, agent_id, tool_in.tool_id)
        if existing:
            existing.enabled = tool_in.enabled
            existing.config = tool_in.config
            db.add(existing)
            await db.commit()
            await db.refresh(existing)
            return existing

        agent_tool = AgentTool(
            agent_id=agent_id,
            tool_id=tool_in.tool_id,
            enabled=tool_in.enabled,
            config=tool_in.config,
        )
        db.add(agent_tool)
        await db.commit()
        await db.refresh(agent_tool)
        return agent_tool

    @staticmethod
    async def list_agent_tools(
        db: AsyncSession,
        agent_id: UUID,
    ) -> List[AgentTool]:
        """Lista todas las herramientas asociadas al agente."""
        stmt = (
            select(AgentTool)
            .where(AgentTool.agent_id == agent_id)
            .order_by(AgentTool.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())


agent_service = AgentService()
