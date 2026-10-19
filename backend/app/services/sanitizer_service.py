"""Servicio de Sanitización y Enmascaramiento de Contexto (OWASP GenAI LLM06).

Alineado con el estándar de seguridad OWASP Top 10 for LLM Applications 2026:
LLM06 - Sensitive Information Disclosure.

Garantiza que ningún secreto, token de acceso, credencial de autorización,
contraseña o dato sensible de pago se persista en texto plano dentro de la
tabla de trazas forenses (executions.request_context).
"""

import copy
import re
from typing import Any, Dict, List, Set

# Patrones de claves sensibles (case-insensitive)
SENSITIVE_KEY_NAMES: Set[str] = {
    "api_key",
    "apikey",
    "secret",
    "password",
    "token",
    "bearer",
    "access_token",
    "refresh_token",
    "authorization",
    "auth",
    "private_key",
    "client_secret",
    "cvv",
    "cvc",
    "credit_card",
    "card_number",
    "pin",
}

# Expresiones regulares para valores de patrones sensibles
BEARER_REGEX = re.compile(r"(?i)bearer\s+[a-z0-9\-_~+/]+=*")
JWT_REGEX = re.compile(r"ey[A-Za-z0-9\-_=]+\.ey[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+")
CREDIT_CARD_REGEX = re.compile(r"\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{13,19}\b")


class SanitizerService:
    """Sanitiza de forma recursiva estructuras de contexto y parámetros."""

    @classmethod
    def _is_sensitive_key(cls, key: str) -> bool:
        """Determina si un nombre de clave indica contenido confidencial."""
        key_lower = key.lower()
        if key_lower in SENSITIVE_KEY_NAMES:
            return True
        for pattern in SENSITIVE_KEY_NAMES:
            if pattern in key_lower:
                return True
        return False

    @classmethod
    def _sanitize_string_value(cls, val: str) -> str:
        """Enmascara patrones conocidos de secretos dentro de cadenas de texto."""
        # 1. Enmascarar tokens Bearer
        if BEARER_REGEX.search(val):
            val = BEARER_REGEX.sub("Bearer ***REDACTED***", val)

        # 2. Enmascarar JWTs
        if JWT_REGEX.search(val):
            val = JWT_REGEX.sub("***REDACTED_JWT***", val)

        # 3. Enmascarar números de tarjetas de crédito preservando últimos 4 dígitos
        def _mask_cc(match: re.Match) -> str:
            raw = match.group(0)
            digits = re.sub(r"\D", "", raw)
            if len(digits) >= 13:
                last4 = digits[-4:]
                return f"****-****-****-{last4}"
            return raw

        if CREDIT_CARD_REGEX.search(val):
            val = CREDIT_CARD_REGEX.sub(_mask_cc, val)

        return val

    @classmethod
    def _sanitize_recursive(cls, data: Any) -> Any:
        """Recorre recursivamente diccionarios y listas para redactar secretos."""
        if isinstance(data, dict):
            sanitized: Dict[str, Any] = {}
            for k, v in data.items():
                if cls._is_sensitive_key(str(k)):
                    sanitized[k] = "***REDACTED***"
                else:
                    sanitized[k] = cls._sanitize_recursive(v)
            return sanitized

        elif isinstance(data, (list, tuple, set)):
            return [cls._sanitize_recursive(item) for item in data]

        elif isinstance(data, str):
            return cls._sanitize_string_value(data)

        return data

    @classmethod
    def sanitize(cls, context: Dict[str, Any]) -> Dict[str, Any]:
        """Retorna una copia profunda y sanitizada del contexto de ejecución."""
        if not context:
            return {}
        cloned = copy.deepcopy(context)
        return cls._sanitize_recursive(cloned)


sanitizer_service = SanitizerService()
