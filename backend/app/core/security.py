"""Módulo de Seguridad, Criptografía y Tokens JWT para AgentGuard."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import uuid

import bcrypt
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Identificador único generado en memoria al iniciar el proceso del servidor Backend.
# Permite invalidar sesiones JWT heredadas de ejecuciones previas tras un reinicio.
SERVER_BOOT_ID: str = uuid.uuid4().hex

# Compatibilidad passlib con bcrypt >= 4.0 / 5.0 (antes de instanciar CryptContext)
if not hasattr(bcrypt, "__about__"):
    setattr(bcrypt, "__about__", type("about", (), {"__version__": bcrypt.__version__}))

_orig_hashpw = bcrypt.hashpw


def _safe_hashpw(password: bytes, salt: bytes) -> bytes:
    if len(password) > 72:
        password = password[:72]
    return _orig_hashpw(password, salt)


setattr(bcrypt, "hashpw", _safe_hashpw)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña en texto plano contra su hash bcrypt."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Genera el hash bcrypt de una contraseña."""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Crea y firma un JWT con expiración calculada e identificador de arranque del servidor."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.setdefault("boot_id", SERVER_BOOT_ID)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodifica y valida la firma, expiración y vigencia del arranque del servidor."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        token_boot_id = payload.get("boot_id")
        if token_boot_id is not None and token_boot_id != SERVER_BOOT_ID:
            return None
        return payload
    except JWTError:
        return None
