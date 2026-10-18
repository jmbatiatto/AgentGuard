"""Esquema base para todos los DTOs de Pydantic v2."""

from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    """Configuración base compartida para los esquemas del sistema.

    Habilita 'from_attributes=True' para permitir la instanciación directa
    a partir de modelos de SQLAlchemy 2.0 (ORM mode).
    """

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )
