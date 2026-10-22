# 🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard)

Para levantar el entorno completo de desarrollo local de manera secuencial y coordinada:

## Comandos Oficiales:
- **Doble Clic (Windows Explorer):** `start_all.bat` (o `start_dev.bat`)
- **PowerShell:** `powershell -ExecutionPolicy Bypass -File scripts/start-all.ps1`
- **PNPM / NPM:** `pnpm start` o `npm run start`

## Secuencia que ejecuta el orquestador:
1. **Persistencia (Docker):** Inicia contenedores PostgreSQL 16 y Redis 7 (`docker compose up -d`) y sondea `pg_isready` hasta disponibilidad.
2. **Backend Setup:** Comprueba `.env`, crea `.venv` e instala dependencias si es necesario; aplica migraciones con `alembic upgrade head`.
3. **Seeder Oficial:** Ejecuta `scripts/seed_demo.py` asegurando la organización Acme Corp, agentes, herramientas, políticas y reglas deterministas.
4. **Backend FastAPI:** Inicia Uvicorn en el puerto 8000 en su propia consola titulada y monitorea `/health` hasta responder HTTP 200.
5. **Frontend Vite:** Inicia el servidor de desarrollo en el puerto 5173 en su propia consola titulada y espera disponibilidad.
6. **Apertura de Navegador:** Abre automáticamente `http://localhost:5173` en el navegador web predeterminado.

## Parada Limpia:
- **Doble Clic:** `stop_all.bat` (o `stop_dev.bat`)
- **PowerShell:** `powershell -ExecutionPolicy Bypass -File scripts/stop-all.ps1`
- **PNPM:** `pnpm stop`
