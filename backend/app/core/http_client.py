"""Utilidades compartidas de transporte HTTP asíncrono (httpx) para AgentGuard.

Resuelve dos cuellos de botella críticos en Windows sin reducir la seguridad TLS:
1. Normaliza 'localhost' -> '127.0.0.1' para evitar el fallback IPv6 (::1 -> IPv4).
2. Cachea un único ssl.SSLContext por proceso para HTTPS y omite la carga de CA
   en solicitudes HTTP planas (evitando ~1.5s de parseo de certifi.pem por request).
"""

import ssl
from typing import Any, Dict, Optional
from urllib.parse import urlsplit, urlunsplit

_CACHED_SSL_CONTEXT: Optional[ssl.SSLContext] = None
_LOOPBACK_HOSTS = frozenset({"localhost", "127.0.0.1", "::1"})


def normalize_loopback_url(url: str) -> str:
    """Resuelve 'localhost' a '127.0.0.1' para evitar el fallback IPv6 (::1 -> IPv4 ~2s) en Windows."""
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


def get_cached_ssl_context() -> ssl.SSLContext:
    """Construye y cachea un único SSLContext verificado por proceso."""
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


def httpx_client_kwargs(url: str, timeout: float = 3.0) -> Dict[str, Any]:
    """Construye kwargs rápidos y seguros para httpx.AsyncClient según esquema y destino."""
    parsed = urlsplit(url)
    is_https = parsed.scheme.lower() == "https"
    is_loopback = (parsed.hostname or "").lower() in _LOOPBACK_HOSTS
    return {
        "timeout": timeout,
        "verify": get_cached_ssl_context() if is_https else False,
        "trust_env": not is_loopback,
    }
