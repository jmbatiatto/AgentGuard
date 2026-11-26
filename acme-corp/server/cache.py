"""Caché Redis (DB 1) para ACME Corporation con degradación transparente a memoria TTL.

Cachea:
- Catálogo de modelos obtenido en el Handshake de IA (TTL 600s)
- Circuit-Breaker de modelos con timeout o indisponibilidad (TTL 600s)
- Contexto auto-descubierto de AgentGuard (/api/v1/gateway/context, TTL 45s)

En cumplimiento de OWASP GenAI LLM06, nunca almacena API keys en claro dentro de claves
ni valores; identifica cada clave mediante `hash_secret()`.
"""

import asyncio
import hashlib
import json
import logging
import time
from typing import Any, Dict, Optional, Tuple

from server.config import normalize_redis_url, settings

logger = logging.getLogger("acme.cache")


def hash_secret(secret: str) -> str:
    """Retorna un digest corto SHA-256 (16 hex chars) seguro para claves de caché."""
    return hashlib.sha256((secret or "").encode("utf-8")).hexdigest()[:16]


class AcmeCacheService:
    """Cliente de caché Redis con fallback automático a diccionario en memoria TTL."""

    def __init__(self, redis_url: Optional[str] = None) -> None:
        self._redis_url = normalize_redis_url(redis_url or settings.REDIS_URL)
        self._clients_by_loop: Dict[int, Any] = {}
        self._mem_store: Dict[str, Tuple[float, str]] = {}
        self._redis_retry_after: float = 0.0
        self._last_backend: str = "memory"

    def _get_redis_client(self) -> Optional[Any]:
        now = time.monotonic()
        if now < self._redis_retry_after:
            self._last_backend = "memory"
            return None
        try:
            import redis.asyncio as aioredis
        except ImportError:
            self._redis_retry_after = now + 60.0
            self._last_backend = "memory"
            return None

        loop = asyncio.get_running_loop()
        loop_id = id(loop)
        client = self._clients_by_loop.get(loop_id)
        if client is None:
            client = aioredis.from_url(
                self._redis_url,
                socket_connect_timeout=0.3,
                socket_timeout=0.3,
                decode_responses=True,
            )
            self._clients_by_loop[loop_id] = client
        return client

    def _mem_get(self, key: str) -> Optional[Any]:
        entry = self._mem_store.get(key)
        if entry is None:
            return None
        expires_at, raw = entry
        if time.monotonic() >= expires_at:
            self._mem_store.pop(key, None)
            return None
        try:
            return json.loads(raw)
        except Exception:
            return None

    def _mem_set(self, key: str, raw: str, ttl_seconds: int) -> None:
        self._mem_store[key] = (time.monotonic() + max(1, int(ttl_seconds)), raw)

    def backend_status(self) -> str:
        """Indica el último backend de caché operativo ('redis' o 'memory')."""
        return self._last_backend

    async def get_json(self, key: str) -> Optional[Any]:
        """Recupera un valor JSON desde Redis (DB 1) o desde memoria TTL."""
        client = self._get_redis_client()
        if client is not None:
            try:
                raw = await client.get(key)
                self._last_backend = "redis"
                if raw is None:
                    return None
                return json.loads(raw)
            except Exception as exc:
                logger.debug("ACME Redis get_json fallback a memoria ('%s'): %s", key, exc)
                self._redis_retry_after = time.monotonic() + 5.0
                self._clients_by_loop.pop(id(asyncio.get_running_loop()), None)
                self._last_backend = "memory"
        return self._mem_get(key)

    async def set_json(self, key: str, val: Any, ttl_seconds: int = 60) -> None:
        """Guarda un objeto JSON con expiración TTL en Redis (DB 1) o memoria local."""
        raw = json.dumps(val, default=str, ensure_ascii=False)
        ttl = max(1, int(ttl_seconds))
        client = self._get_redis_client()
        if client is not None:
            try:
                await client.set(key, raw, ex=ttl)
                self._last_backend = "redis"
                return
            except Exception as exc:
                logger.debug("ACME Redis set_json fallback a memoria ('%s'): %s", key, exc)
                self._redis_retry_after = time.monotonic() + 5.0
                self._clients_by_loop.pop(id(asyncio.get_running_loop()), None)
                self._last_backend = "memory"
        self._mem_set(key, raw, ttl)

    async def delete(self, key: str) -> None:
        """Invalida una clave tanto en Redis como en memoria local."""
        self._mem_store.pop(key, None)
        client = self._get_redis_client()
        if client is not None:
            try:
                await client.delete(key)
                self._last_backend = "redis"
            except Exception as exc:
                logger.debug("ACME Redis delete fallback ('%s'): %s", key, exc)
                self._redis_retry_after = time.monotonic() + 5.0
                self._clients_by_loop.pop(id(asyncio.get_running_loop()), None)
                self._last_backend = "memory"


acme_cache = AcmeCacheService()
