"""Servicio de persistencia y trazabilidad forense para Eventos de Auditoría (Audit Events).

Provee métodos inmutables para el registro cronológico de operaciones administrativas
y consultas con aislamiento multi-tenant estricto por organization_id.
"""

import inspect
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditEvent
from app.models.enums import ActorType

logger = logging.getLogger("agentguard.audit_service")


class AuditService:
    """Gestiona el registro inmutable y la consulta forense de AuditEvent."""

    @staticmethod
    async def log_audit_event(
        db: AsyncSession,
        organization_id: UUID,
        actor_type: ActorType,
        actor_id: UUID,
        event_type: str,
        metadata: Optional[Any] = None,
        description: Optional[str] = None,
        **kwargs: Any,
    ) -> AuditEvent:
        """Registra un evento inmutable de auditoría forense en la base de datos.
        
        Permite invocar tanto con firma (metadata, description) como con (description, metadata).
        Asegura que la descripción quede persistida dentro de los metadatos JSONB.
        """
        # Flexibilidad en orden de argumentos posicionales
        if isinstance(metadata, str) and description is None:
            description = metadata
            metadata = kwargs.get("metadata")

        event_meta: Dict[str, Any] = dict(metadata) if isinstance(metadata, dict) else {}
        if description:
            event_meta.setdefault("description", description)

        event = AuditEvent(
            organization_id=organization_id,
            actor_type=actor_type,
            actor_id=actor_id,
            event_type=event_type,
            event_metadata=event_meta,
        )
        add_res = db.add(event)
        if inspect.isawaitable(add_res):
            await add_res
        await db.commit()
        await db.refresh(event)
        return event

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        event_id: UUID,
        organization_id: Optional[UUID] = None,
    ) -> Optional[AuditEvent]:
        """Obtiene un evento de auditoría específico por su UUID con aislamiento multi-tenant."""
        stmt = select(AuditEvent).where(AuditEvent.id == event_id)
        if organization_id:
            stmt = stmt.where(AuditEvent.organization_id == organization_id)

        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_events(
        db: AsyncSession,
        organization_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 50,
        actor_type: Optional[ActorType] = None,
        event_type: Optional[str] = None,
    ) -> List[AuditEvent]:
        """Recupera eventos de auditoría ordenados cronológicamente descendente con filtros opcionales."""
        stmt = (
            select(AuditEvent)
            .order_by(AuditEvent.timestamp.desc())
            .offset(skip)
            .limit(limit)
        )
        if organization_id:
            stmt = stmt.where(AuditEvent.organization_id == organization_id)
        if actor_type:
            stmt = stmt.where(AuditEvent.actor_type == actor_type)
        if event_type:
            stmt = stmt.where(AuditEvent.event_type == event_type)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def count_events(
        db: AsyncSession,
        organization_id: Optional[UUID] = None,
        actor_type: Optional[ActorType] = None,
        event_type: Optional[str] = None,
    ) -> int:
        """Retorna la cantidad total de eventos que cumplen con los filtros especificados."""
        stmt = select(func.count(AuditEvent.id))
        if organization_id:
            stmt = stmt.where(AuditEvent.organization_id == organization_id)
        if actor_type:
            stmt = stmt.where(AuditEvent.actor_type == actor_type)
        if event_type:
            stmt = stmt.where(AuditEvent.event_type == event_type)

        result = await db.execute(stmt)
        count_val = result.scalar()
        return count_val if count_val is not None else 0


audit_service = AuditService()
log_audit_event = audit_service.log_audit_event
