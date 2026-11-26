"""Configuración central para ACME Corporation (Pydantic Settings)."""

import ssl
from pathlib import Path
from typing import Any, Dict, Optional
from urllib.parse import urlsplit, urlunsplit
from pydantic_settings import BaseSettings, SettingsConfigDict

_CACHED_SSL_CONTEXT: Optional[ssl.SSLContext] = None
_LOOPBACK_HOSTS = frozenset({"localhost", "127.0.0.1", "::1"})


def normalize_loopback_url(url: str) -> str:
    """Resuelve 'localhost' a '127.0.0.1' para evitar el timeout IPv6 (::1 -> IPv4 ~2s) en Windows."""
    parsed = urlsplit(url)
    if parsed.scheme in ("http", "https") and (parsed.hostname or "").lower() == "localhost":
        netloc = "127.0.0.1"
        if parsed.port is not None:
            netloc = f"{netloc}:{parsed.port}"
        if parsed.username:
            userinfo = parsed.username
            if parsed.password:
                userinfo = f"{userinfo}:{parsed.password}"
            netloc = f"{userinfo}@{netloc}"
        return urlunsplit((parsed.scheme, netloc, parsed.path, parsed.query, parsed.fragment))
    return url


def normalize_redis_url(url: str) -> str:
    """Resuelve 'localhost' a '127.0.0.1' en URLs redis/rediss para evitar fallback IPv6 en Windows."""
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


def get_cached_ssl_context() -> ssl.SSLContext:
    """Construye y cachea un único SSLContext verificado por proceso para llamadas HTTPS."""
    global _CACHED_SSL_CONTEXT
    if _CACHED_SSL_CONTEXT is None:
        ctx = ssl.create_default_context()
        if ctx.cert_store_stats().get("x509_ca", 0) == 0:
            try:
                import certifi

                ctx = ssl.create_default_context(cafile=certifi.where())
            except Exception:
                pass
        _CACHED_SSL_CONTEXT = ctx
    return _CACHED_SSL_CONTEXT


def httpx_client_kwargs(url: str, timeout: float = 10.0) -> Dict[str, Any]:
    """Construye kwargs rápidos y seguros para httpx.AsyncClient evitando re-parsear certifi en cada request."""
    parsed = urlsplit(url)
    is_https = parsed.scheme.lower() == "https"
    is_loopback = (parsed.hostname or "").lower() in _LOOPBACK_HOSTS
    return {
        "timeout": timeout,
        "verify": get_cached_ssl_context() if is_https else False,
        "trust_env": not is_loopback,
    }

# Raíz del paquete acme-corp
ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT_DIR / ".env"


class AcmeSettings(BaseSettings):
    """Ajustes de entorno para el servidor autónomo de ACME Corporation."""

    # Servidor ACME
    ACME_HOST: str = "0.0.0.0"
    ACME_PORT: int = 9000
    ACME_PUBLIC_URL: str = "http://localhost:9000"
    ACME_DB_PATH: str = "acme_corp.db"

    # Integración con AgentGuard (PEP/PDP) y Redis
    AGENTGUARD_URL: str = "http://localhost:8000"
    AGENTGUARD_API_KEY: Optional[str] = None
    REDIS_URL: str = "redis://127.0.0.1:6379/1"

    # Integración con Proveedores de IA (Google Gemini / OpenAI / Groq)
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def resolve_db_path(self, override_path: Optional[str] = None) -> Path:
        """Resuelve la ruta absoluta del archivo SQLite."""
        raw_path = override_path or self.ACME_DB_PATH
        path_obj = Path(raw_path)
        if path_obj.is_absolute():
            return path_obj
        return ROOT_DIR / path_obj


settings = AcmeSettings()
