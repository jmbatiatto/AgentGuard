"""Schemas Pydantic v2 para Organizaciones (Tenants)."""

from datetime import datetime
from uuid import UUID
from pydantic import Field

from app.schemas.base import BaseSchema


class OrganizationCreate(BaseSchema):
    """Payload para dar de alta una nueva organización (tenant)."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Nombre único o razón social del tenant",
    )


class OrganizationRead(BaseSchema):
    """Respuesta serializada con datos completos de la organización."""

    id: UUID
    name: str
    created_at: datetime
