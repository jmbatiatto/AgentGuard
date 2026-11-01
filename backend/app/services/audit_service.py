"""Servicio de Auditoría Administrativa Inmutable WORM (AuditService)."""

import logging
import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditEvent
from app.models.enums import ActorType

logger = logging.getLogger("agentguard.audit")


class AuditService:
    """Gestiona la inserción inmutable y consulta de eventos administrativos."""

    @staticmethod
    async def record_event(
        db: AsyncSession,
        organization_id: uuid.UUID,
        actor_type: ActorType,
        actor_id: uuid.UUID,
        event_type: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AuditEvent:
        """Sella un nuevo evento de auditoría WORM en la base de datos."""
        event = AuditEvent(
            id=uuid.uuid4(),
            organization_id=organization_id,
            actor_type=actor_type,
            actor_id=actor_id,
            event_type=event_type,
            event_metadata=metadata or {},
        )
        db.add(event)
        await db.commit()
        logger.info(
            "Evento de auditoría sellado: org=%s, actor=%s (%s), type=%s",
            organization_id, actor_id, actor_type.value, event_type
        )
        return event

    @staticmethod
    async def list_by_org(
        db: AsyncSession,
        organization_id: uuid.UUID,
        event_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[AuditEvent]:
        """Obtiene la traza de auditoría administrativa ordenada cronológicamente."""
        stmt = (
            select(AuditEvent)
            .where(AuditEvent.organization_id == organization_id)
            .order_by(desc(AuditEvent.timestamp))
            .offset(skip)
            .limit(limit)
        )
        if event_type:
            stmt = stmt.where(AuditEvent.event_type == event_type)

        result = await db.execute(stmt)
        return list(result.scalars().all())


audit_service = AuditService()

