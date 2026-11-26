"""Configuración central para ACME Corporation (Pydantic Settings)."""

from pathlib import Path
from typing import Optional
from urllib.parse import urlsplit, urlunsplit
from pydantic_settings import BaseSettings, SettingsConfigDict


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

    # Integración con AgentGuard (PEP/PDP)
    AGENTGUARD_URL: str = "http://localhost:8000"
    AGENTGUARD_API_KEY: Optional[str] = None

    # Integración con Google Gemini AI
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.8-flash"

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
