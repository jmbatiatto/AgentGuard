"""Servicio de Caché Distribuido con Redis 7 y fallback automático a memoria local.

Utiliza Redis (DB 0) con resolución loopback IPv4 en Windows (`localhost` -> `127.0.0.1`)
y timeouts cortos para acelerar rutas críticas del Data Plane (como `verify_api_key`).
Si Redis no está disponible (por ejemplo, en pruebas unitarias sin Docker), degrada de
forma transparente a una caché TTL en memoria sin bloquear la ejecución.
"""

import asyncio
import json
import logging
import time
from typing import Any, Dict, Optional, Tuple
from urllib.parse import urlsplit, urlunsplit

from app.core.config import settings

logger = logging.getLogger("agentguard.cache")


def normalize_redis_url(url: str) -> str:
    """Resuelve 'localhost' a '127.0.0.1' en URLs redis/rediss para evitar demoras IPv6 en Windows."""
    parsed = urlsplit(url)
    if parsed.scheme.lower() in ("redis", "rediss") and (parsed.hostname or "").lower() == "localhost":
        netloc = "127.0.0.1"
        if parsed.port is not None:
            netloc = f"{netloc}:{parsed.port}"
        if parsed.username or parsed.password:
            userinfo = parsed.username or ""
            if parsed.password is not None:
                userinfo = f"{userinfo}:{parsed.password}"
            netloc = f"{userinfo}@{netloc}"
        return urlunsplit((parsed.scheme, netloc, parsed.path, parsed.query, parsed.fragment))
    return url


class BackendCacheService:
    """Cliente de caché JSON sobre Redis con degradación transparente a memoria TTL."""

    def __init__(self, redis_url: Optional[str] = None) -> None:
        self._redis_url = normalize_redis_url(redis_url or settings.REDIS_URL)
        self._clients_by_loop: Dict[int, Any] = {}
        self._mem_cache: Dict[str, Tuple[float, str]] = {}
        self._redis_retry_after: float = 0.0

    def _get_redis_client(self) -> Optional[Any]:
        now = time.monotonic()
        if now < self._redis_retry_after:
            return None
        try:
            import redis.asyncio as aioredis
        except ImportError:
            self._redis_retry_after = now + 60.0
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
        entry = self._mem_cache.get(key)
        if entry is None:
            return None
        expires_at, raw = entry
        if time.monotonic() >= expires_at:
            self._mem_cache.pop(key, None)
            return None
        try:
            return json.loads(raw)
        except Exception:
            return None

    def _mem_set(self, key: str, raw: str, ttl_seconds: int) -> None:
        self._mem_cache[key] = (time.monotonic() + max(1, int(ttl_seconds)), raw)

    async def get_json(self, key: str) -> Optional[Any]:
        """Recupera un objeto JSON desde Redis o fallback en memoria."""
        client = self._get_redis_client()
        if client is not None:
            try:
                raw = await client.get(key)
                if raw is None:
                    return None
                return json.loads(raw)
            except Exception as exc:
                logger.debug("Redis get_json fallback a memoria para '%s': %s", key, exc)
                self._redis_retry_after = time.monotonic() + 5.0
                self._clients_by_loop.pop(id(asyncio.get_running_loop()), None)
        return self._mem_get(key)

    async def set_json(self, key: str, value: Any, ttl_seconds: int = 60) -> None:
        """Persiste un objeto serializable como JSON con TTL."""
        raw = json.dumps(value, default=str, ensure_ascii=False)
        ttl = max(1, int(ttl_seconds))
        client = self._get_redis_client()
        if client is not None:
            try:
                await client.set(key, raw, ex=ttl)
                return
            except Exception as exc:
                logger.debug("Redis set_json fallback a memoria para '%s': %s", key, exc)
                self._redis_retry_after = time.monotonic() + 5.0
                self._clients_by_loop.pop(id(asyncio.get_running_loop()), None)
        self._mem_set(key, raw, ttl)

    async def delete(self, key: str) -> None:
        """Elimina una clave de caché en Redis y en memoria local."""
        self._mem_cache.pop(key, None)
        client = self._get_redis_client()
        if client is not None:
            try:
                await client.delete(key)
            except Exception as exc:
                logger.debug("Redis delete fallback para '%s': %s", key, exc)
                self._redis_retry_after = time.monotonic() + 5.0
                self._clients_by_loop.pop(id(asyncio.get_running_loop()), None)


backend_cache = BackendCacheService()
