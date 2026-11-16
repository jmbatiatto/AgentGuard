from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import Field, field_validator

from app.models.enums import UserRole
from app.schemas.base import BaseSchema


class UserCreate(BaseSchema):
    """Payload para registrar un nuevo usuario corporativo."""

    organization_id: UUID = Field(
        ...,
        description="ID de la organización a la que pertenece",
    )
    email: str = Field(
        ...,
        min_length=3,
        max_length=255,
        description="Correo electrónico corporativo",
    )
    role: UserRole = Field(
        default=UserRole.OPERATOR,
        description="Rol de autorización dentro de la plataforma",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Contraseña inicial obligatoria del usuario (mínimo 8 caracteres)",
    )


class UserUpdate(BaseSchema):
    """Payload para actualizar el rol de un usuario corporativo."""

    role: Optional[UserRole] = Field(
        default=None,
        description="Nuevo rol de autorización asignado al usuario",
    )


class UserRead(BaseSchema):
    """Respuesta con la información del usuario."""

    id: UUID
    organization_id: UUID
    email: str
    role: UserRole
    created_at: datetime
    must_change_password: bool = Field(
        default=False,
        description="Indica si el usuario debe cambiar su contraseña temporal en el primer ingreso",
    )

    @field_validator("must_change_password", mode="before")
    @classmethod
    def normalize_must_change_password(cls, v: object) -> bool:
        return bool(v)

