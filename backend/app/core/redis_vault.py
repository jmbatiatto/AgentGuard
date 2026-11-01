"""Bóveda Temporal Cifrada en Redis para Parámetros Sensibles de HITL (Decisión 5).

Protege datos originales en RAM con cifrado simétrico Fernet (AES-128-CBC + HMAC-SHA256)
con expiración TTL estricta (15 min) y consumo atómico (GETDEL).
PostgreSQL almacena únicamente el request_context sanitizado (OWASP LLM06).
"""

import base64
import json
import logging
from typing import Any, Dict, Optional
from uuid import UUID
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger("agentguard.vault")


def _get_fernet_key(secret: str) -> bytes:
    """Deriva una clave de 32 bytes en Base64 para Fernet a partir del SECRET_KEY."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b"agentguard_hitl_vault_salt_2026",
        iterations=100_000,
    )
    return base64.urlsafe_b64encode(kdf.derive(secret.encode()))


class RedisHitlVault:
    """Gestor de custodia temporal cifrada para aprobaciones humanas."""

    def __init__(self):
        self._fernet: Optional[Fernet] = None

    @property
    def cipher(self) -> Fernet:
        if self._fernet is None:
            key = _get_fernet_key(settings.SECRET_KEY)
            self._fernet = Fernet(key)
        return self._fernet

    async def store_payload(
        self,
        approval_id: UUID,
        parameters: Dict[str, Any],
        ttl_seconds: int = 900,
    ) -> bool:
        """Cifra y almacena los parámetros originales en Redis con TTL."""
        try:
            client = aioredis.from_url(
                settings.REDIS_URL,
                socket_timeout=0.2,
                socket_connect_timeout=0.2,
            )
            raw_bytes = json.dumps(parameters).encode("utf-8")
            encrypted = self.cipher.encrypt(raw_bytes)
            key = f"hitl:payload:{str(approval_id)}"
            await client.set(key, encrypted, ex=ttl_seconds)
            await client.aclose()
            return True
        except Exception as exc:
            logger.warning("No se pudo almacenar payload cifrado en Redis Vault: %s", exc)
            return False

    async def retrieve_and_purge_payload(
        self,
        approval_id: UUID,
    ) -> Optional[Dict[str, Any]]:
        """Recupera y elimina atómicamente el payload original descifrado."""
        try:
            client = aioredis.from_url(
                settings.REDIS_URL,
                socket_timeout=0.2,
                socket_connect_timeout=0.2,
            )
            key = f"hitl:payload:{str(approval_id)}"
            encrypted = await client.getdel(key)
            await client.aclose()
            if not encrypted:
                return None
            decrypted = self.cipher.decrypt(encrypted)
            return json.loads(decrypted.decode("utf-8"))
        except Exception as exc:
            logger.warning("Fallo al recuperar payload de Redis Vault para %s: %s", approval_id, exc)
            return None


redis_vault = RedisHitlVault()
