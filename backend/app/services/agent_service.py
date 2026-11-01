"""Servicio de lógica de negocio y persistencia para Agentes de IA (Agents) y AgentTool."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.agent import Agent, AgentTool
from app.models.tool import Tool
from app.schemas.agent import AgentCreate, AgentUpdate, AgentToolCreate


class AgentService:
    """Gestiona operaciones CRUD sobre la entidad Agent y sus asignaciones en AgentTool."""

    @staticmethod
    async def create(db: AsyncSession, agent_in: AgentCreate) -> Agent:
        """Crea un nuevo agente de IA persistido en la base de datos."""
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
        """Obtiene un agente por su UUID primario cargando sus herramientas asociadas."""
        stmt = (
            select(Agent)
            .options(
                selectinload(Agent.agent_tools).selectinload(AgentTool.tool),
                selectinload(Agent.owner_user),
            )
            .where(Agent.id == agent_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_by_org(
        db: AsyncSession,
        organization_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Agent]:
        """Lista agentes con soporte para filtrado por organización y paginación."""
        stmt = (
            select(Agent)
            .options(
                selectinload(Agent.agent_tools).selectinload(AgentTool.tool),
                selectinload(Agent.owner_user),
            )
            .order_by(Agent.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        if organization_id:
            stmt = stmt.where(Agent.organization_id == organization_id)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def update(db: AsyncSession, agent_id: UUID, agent_in: AgentUpdate) -> Optional[Agent]:
        """Actualiza atributos de un agente existente."""
        agent = await AgentService.get_by_id(db=db, agent_id=agent_id)
        if not agent:
            return None
        if agent_in.name is not None:
            agent.name = agent_in.name
        if agent_in.purpose is not None:
            agent.purpose = agent_in.purpose
        if agent_in.status is not None:
            agent.status = agent_in.status
        db.add(agent)
        await db.commit()
        await db.refresh(agent)
        return agent

    @staticmethod
    async def delete(db: AsyncSession, agent_id: UUID) -> bool:
        """Elimina un agente y sus asignaciones de herramientas."""
        agent = await AgentService.get_by_id(db=db, agent_id=agent_id)
        if not agent:
            return False
        await db.delete(agent)
        await db.commit()
        return True

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
    async def remove_tool(
        db: AsyncSession,
        agent_id: UUID,
        tool_id: UUID,
    ) -> bool:
        """Desvincula una herramienta de un agente."""
        record = await AgentService.get_agent_tool(db, agent_id, tool_id)
        if not record:
            return False
        await db.delete(record)
        await db.commit()
        return True

    @staticmethod
    async def list_agent_tools(
        db: AsyncSession,
        agent_id: UUID,
    ) -> List[AgentTool]:
        """Lista todas las herramientas asociadas al agente."""
        stmt = (
            select(AgentTool)
            .options(selectinload(AgentTool.tool))
            .where(AgentTool.agent_id == agent_id)
            .order_by(AgentTool.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())


agent_service = AgentService()
