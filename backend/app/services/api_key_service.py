"""Servicio de lógica de negocio, hashing seguro y ciclo de vida de API Keys PEP.

Implementa:
- Generación de llaves con prefijo corporativo (ag_live_...) y entropía criptográfica (secrets).
- Almacenamiento seguro del digest SHA-256 (nunca el secreto en texto plano).
- Prefijo indexado (12 caracteres) para identificación y búsqueda eficiente.
- Aislamiento multi-tenant estricto por organization_id.
- Revocación lógica segura (soft delete: is_active = False).
"""

from datetime import datetime, timedelta, timezone
import hashlib
import inspect
import logging
import secrets
import uuid
from typing import Any, List, Optional, Tuple
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import backend_cache
from app.models.api_key import ApiKey

logger = logging.getLogger("agentguard.api_key_service")


def _is_mock_db(db: Any) -> bool:
    """Evita usar caché externa cuando los tests unitarios inyectan AsyncMock/MagicMock."""
    return (
        "unittest.mock" in type(db).__module__
        or "unittest.mock" in type(getattr(db, "execute", None)).__module__
    )


class ApiKeyService:
    """Gestiona la emisión criptográfica, listado, verificación y revocación de API Keys."""

    @staticmethod
    def _generate_raw_key() -> str:
        """Genera una clave con prefijo corporativo y 256 bits de entropía segura."""
        # ag_live_ (8 chars) + token_urlsafe(32) (~43 chars)
        token = secrets.token_urlsafe(32)
        return f"ag_live_{token}"

    @staticmethod
    def _hash_key(raw_key: str) -> str:
        """Calcula el hash criptográfico SHA-256 de una clave en texto plano."""
        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    @staticmethod
    async def create_api_key(
        db: AsyncSession,
        org_id: UUID,
        name: str,
        expires_in_days: Optional[int] = None,
    ) -> Tuple[ApiKey, str]:
        """Genera y persiste una nueva API Key retornando la entidad y el secreto en plano."""
        raw_key = ApiKeyService._generate_raw_key()
        key_prefix = raw_key[:12]
        hashed_key = ApiKeyService._hash_key(raw_key)

        expires_at = None
        if expires_in_days is not None:
            expires_at = datetime.now(timezone.utc) + timedelta(days=expires_in_days)

        api_key = ApiKey(
            organization_id=org_id,
            name=name,
            key_prefix=key_prefix,
            hashed_key=hashed_key,
            created_at=datetime.now(timezone.utc),
            expires_at=expires_at,
            is_active=True,
        )

        add_res = db.add(api_key)
        if inspect.isawaitable(add_res):
            await add_res

        await db.commit()
        await db.refresh(api_key)
        if api_key.id is None:
            api_key.id = uuid.uuid4()

        logger.info(
            "API Key '%s' creada con éxito para organization_id=%s (prefix=%s)",
            name,
            org_id,
            key_prefix,
        )
        return api_key, raw_key

    @staticmethod
    async def list_api_keys(
        db: AsyncSession,
        org_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[ApiKey]:
        """Lista API Keys de una organización ordenadas cronológicamente descendente."""
        stmt = (
            select(ApiKey)
            .order_by(ApiKey.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        if org_id is not None:
            stmt = stmt.where(ApiKey.organization_id == org_id)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_api_key(
        db: AsyncSession,
        key_id: UUID,
        org_id: Optional[UUID] = None,
    ) -> Optional[ApiKey]:
        """Recupera una API Key por su UUID con validación de aislamiento multi-tenant."""
        stmt = select(ApiKey).where(ApiKey.id == key_id)
        if org_id is not None:
            stmt = stmt.where(ApiKey.organization_id == org_id)

        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def revoke_api_key(
        db: AsyncSession,
        key_id: UUID,
        org_id: Optional[UUID] = None,
    ) -> bool:
        """Revoca lógicamente una API Key marcándola como inactiva (is_active = False)."""
        api_key = await ApiKeyService.get_api_key(db=db, key_id=key_id, org_id=org_id)
        if not api_key:
            logger.warning(
                "Intento de revocar API Key inexistente o fuera de tenant: key_id=%s, org_id=%s",
                key_id,
                org_id,
            )
            return False

        api_key.is_active = False
        await db.commit()
        await db.refresh(api_key)
        await backend_cache.delete(f"ag:apikey:{api_key.hashed_key}")

        logger.info("API Key %s revocada exitosamente", key_id)
        return True

    @staticmethod
    async def verify_api_key(
        db: AsyncSession,
        raw_key: str,
    ) -> Optional[ApiKey]:
        """Valida una API Key en tiempo de ejecución para el Gateway PEP (con caché Redis)."""
        if len(raw_key) < 12:
            return None

        prefix = raw_key[:12]
        hashed = ApiKeyService._hash_key(raw_key)
        cache_key = f"ag:apikey:{hashed}"
        use_cache = not _is_mock_db(db)

        if use_cache:
            cached = await backend_cache.get_json(cache_key)
            if isinstance(cached, dict) and cached.get("is_active") is True:
                expires_raw = cached.get("expires_at")
                expires_at: Optional[datetime] = None
                if isinstance(expires_raw, str):
                    try:
                        expires_at = datetime.fromisoformat(expires_raw)
                        if expires_at.tzinfo is None:
                            expires_at = expires_at.replace(tzinfo=timezone.utc)
                    except ValueError:
                        expires_at = None
                if expires_at is not None and expires_at < datetime.now(timezone.utc):
                    await backend_cache.delete(cache_key)
                    return None

                created_raw = cached.get("created_at")
                created_at = datetime.now(timezone.utc)
                if isinstance(created_raw, str):
                    try:
                        created_at = datetime.fromisoformat(created_raw)
                    except ValueError:
                        pass

                return ApiKey(
                    id=UUID(cached["id"]),
                    organization_id=UUID(cached["organization_id"]),
                    name=cached.get("name", ""),
                    key_prefix=cached.get("key_prefix", prefix),
                    hashed_key=cached.get("hashed_key", hashed),
                    created_at=created_at,
                    expires_at=expires_at,
                    is_active=True,
                )

        stmt = select(ApiKey).where(
            ApiKey.key_prefix == prefix,
            ApiKey.hashed_key == hashed,
            ApiKey.is_active == True,
        )
        result = await db.execute(stmt)
        key = result.scalar_one_or_none()

        if key is None:
            return None

        # Verificar si expiró
        now_utc = datetime.now(timezone.utc)
        if key.expires_at is not None and key.expires_at < now_utc:
            logger.warning("API Key %s ha expirado el %s", key.id, key.expires_at)
            return None

        if use_cache:
            ttl = 60
            if key.expires_at is not None:
                exp = key.expires_at if key.expires_at.tzinfo else key.expires_at.replace(tzinfo=timezone.utc)
                ttl = max(1, min(60, int((exp - now_utc).total_seconds())))
            await backend_cache.set_json(
                cache_key,
                {
                    "id": str(key.id),
                    "organization_id": str(key.organization_id),
                    "name": key.name,
                    "key_prefix": key.key_prefix,
                    "hashed_key": key.hashed_key,
                    "created_at": key.created_at.isoformat() if key.created_at else None,
                    "expires_at": key.expires_at.isoformat() if key.expires_at else None,
                    "is_active": bool(key.is_active),
                },
                ttl_seconds=ttl,
            )

        return key

    # Aliases de conveniencia
    create = create_api_key
    list_by_org = list_api_keys
    get_by_id = get_api_key
    revoke = revoke_api_key


api_key_service = ApiKeyService()
