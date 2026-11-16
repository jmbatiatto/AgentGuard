"""Punto de Entrada Autónomo para ACME Corporation (Looney Tunes).

Inicia el servidor web FastAPI y la API de servicios empresariales en el puerto 9000.
"""

import sys
from pathlib import Path

# Configurar codificación UTF-8 en Windows para consolas y emojis
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Asegurar que la raíz de acme-corp esté en sys.path
ACME_ROOT = Path(__file__).resolve().parent
if str(ACME_ROOT) not in sys.path:
    sys.path.insert(0, str(ACME_ROOT))

try:
    import uvicorn
except ModuleNotFoundError as exc:
    print(
        "[ERROR] Falta instalar dependencias de ACME Corp (no se encontró 'uvicorn' en este intérprete Python).\n"
        f"Intérprete actual: {sys.executable}\n"
        "Ejecutá usando el entorno virtual del proyecto o el lanzador independiente:\n"
        "  • backend\\.venv\\Scripts\\python.exe acme-corp\\run.py\n"
        "  • acme-corp\\start_acme.bat",
        file=sys.stderr,
    )
    raise SystemExit(1) from exc

from server.config import settings


def main() -> None:
    """Inicia el servidor uvicorn con la configuración establecida."""
    print("=" * 70)
    print("  💥 INICIANDO SERVIDOR ACME CORPORATION (LOONEY TUNES) 💥")
    print(f"  • Host: {settings.ACME_HOST}")
    print(f"  • Puerto: {settings.ACME_PORT}")
    print(f"  • URL Pública: {settings.ACME_PUBLIC_URL}")
    print(f"  • Base de Datos SQLite: {settings.resolve_db_path()}")
    print(f"  • Conexión AgentGuard: {settings.AGENTGUARD_URL}")
    print(f"  • Modelo Gemini: {settings.GEMINI_MODEL}")
    print("=" * 70)

    uvicorn.run(
        "server.app:app",
        app_dir=str(ACME_ROOT),
        host=settings.ACME_HOST,
        port=settings.ACME_PORT,
        reload=False,
        log_level="info",
    )


if __name__ == "__main__":
    main()
