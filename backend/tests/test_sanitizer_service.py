"""Pruebas unitarias para el Servicio de Sanitización de Contexto (OWASP LLM06)."""

from app.services.sanitizer_service import SanitizerService, sanitizer_service


def test_sanitize_empty_context():
    """Valida que contextos vacíos no causen error."""
    assert sanitizer_service.sanitize({}) == {}
    assert sanitizer_service.sanitize(None) == {}


def test_sanitize_sensitive_keys():
    """Valida que claves como password, api_key, token o auth sean redactadas."""
    ctx = {
        "amount": 2500,
        "api_key": "sk-live-99238472918374",
        "user_password": "SuperSecretPassword123!",
        "auth_token": "token_xyz",
        "nested": {
            "client_secret": "secret_abc",
            "normal_field": "visible",
        },
    }

    sanitized = sanitizer_service.sanitize(ctx)

    assert sanitized["amount"] == 2500
    assert sanitized["api_key"] == "***REDACTED***"
    assert sanitized["user_password"] == "***REDACTED***"
    assert sanitized["auth_token"] == "***REDACTED***"
    assert sanitized["nested"]["client_secret"] == "***REDACTED***"
    assert sanitized["nested"]["normal_field"] == "visible"

    # Verificar que el diccionario original no fue mutado
    assert ctx["api_key"] == "sk-live-99238472918374"


def test_sanitize_bearer_token_in_string():
    """Valida detección y redacción de Bearer tokens dentro de strings."""
    ctx = {
        "header_authorization": "Bearer ya29.a0AfH6SMDh_fake_token_value",
        "description": "Call with Authorization: Bearer secret_123 to CRM",
    }

    sanitized = sanitizer_service.sanitize(ctx)
    assert sanitized["header_authorization"] == "***REDACTED***" or "Bearer ***REDACTED***" in sanitized["header_authorization"]
    assert "secret_123" not in sanitized["description"]


def test_sanitize_credit_card_masking():
    """Valida que números de tarjeta de crédito se enmascaren preservando últimos 4 dígitos."""
    ctx = {
        "payment": {
            "notes": "Cobro a la tarjeta 4532-1234-5678-9012 con éxito",
        }
    }

    sanitized = sanitizer_service.sanitize(ctx)
    assert "4532-1234-5678-9012" not in sanitized["payment"]["notes"]
    assert "9012" in sanitized["payment"]["notes"]
    assert "****-****-****-9012" in sanitized["payment"]["notes"]


def test_sanitize_lists_and_tuples():
    """Valida sanitización recursiva dentro de colecciones."""
    ctx = {
        "items": [
            {"product_id": 1, "card_number": "1234567812345678"},
            {"product_id": 2, "api_key": "secret_key"},
        ]
    }

    sanitized = sanitizer_service.sanitize(ctx)
    assert sanitized["items"][0]["card_number"] == "***REDACTED***"
    assert sanitized["items"][1]["api_key"] == "***REDACTED***"
    assert sanitized["items"][0]["product_id"] == 1
