"""Caché Volátil de Reglas de Política en Redis 7 (Sub-5ms Evaluation)."""

import json
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID
import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger("agentguard.cache")


class PolicyCache:
    """Gestor de caché Redis para reglas evaluadas por el motor PDP."""

    @staticmethod
    def _cache_key(org_id: UUID, tool_action_id: UUID) -> str:
        return f"pdp:rules:{str(org_id)}:{str(tool_action_id)}"

    @classmethod
    async def get_rules(
        cls,
        org_id: UUID,
        tool_action_id: UUID,
    ) -> Optional[List[Dict[str, Any]]]:
        """Recupera reglas cacheadas en formato serializado si existen."""
        try:
            client = aioredis.from_url(
                settings.REDIS_URL,
                socket_timeout=0.2,
                socket_connect_timeout=0.2,
            )
            key = cls._cache_key(org_id, tool_action_id)
            cached = await client.get(key)
            await client.aclose()
            if cached:
                return json.loads(cached)
            return None
        except Exception as exc:
            logger.debug("Redis cache miss o timeout: %s", exc)
            return None

    @classmethod
    async def set_rules(
        cls,
        org_id: UUID,
        tool_action_id: UUID,
        rules_data: List[Dict[str, Any]],
        ttl_seconds: int = 300,
    ) -> bool:
        """Almacena reglas serializadas en Redis con TTL."""
        try:
            client = aioredis.from_url(
                settings.REDIS_URL,
                socket_timeout=0.2,
                socket_connect_timeout=0.2,
            )
            key = cls._cache_key(org_id, tool_action_id)
            await client.set(key, json.dumps(rules_data), ex=ttl_seconds)
            await client.aclose()
            return True
        except Exception as exc:
            logger.debug("No se pudo escribir en Redis cache: %s", exc)
            return False

    @classmethod
    async def invalidate(
        cls,
        org_id: UUID,
        tool_action_id: Optional[UUID] = None,
    ) -> bool:
        """Invalida claves de caché tras mutaciones en Policies o PolicyRules."""
        try:
            client = aioredis.from_url(
                settings.REDIS_URL,
                socket_timeout=0.2,
                socket_connect_timeout=0.2,
            )
            if tool_action_id:
                key = cls._cache_key(org_id, tool_action_id)
                await client.delete(key)
            else:
                pattern = f"pdp:rules:{str(org_id)}:*"
                cursor = 0
                while True:
                    cursor, keys = await client.scan(cursor, match=pattern, count=100)
                    if keys:
                        await client.delete(*keys)
                    if cursor == 0:
                        break
            await client.aclose()
            return True
        except Exception as exc:
            logger.debug("Fallo al invalidar caché en Redis: %s", exc)
            return False


policy_cache = PolicyCache()
