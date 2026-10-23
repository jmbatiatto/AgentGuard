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

## 🚨 Regla Innegociable para Agentes de IA (Anti "Worker User Agent Cancelled"):
- **NUNCA** ejecutar `npm run dev` ni `uvicorn` como tareas daemon de fondo (`isDaemon: true`) dentro de la sesión de interacción del agente de IA. Esos subprocesos saturan los canales IPC del IDE y provocan reinicios forzados del motor Cortex.
- Los servidores deben iniciarse en consolas desacopladas de Windows independientes mediante `start_all.bat` o `Start-Process`.
- Toda tarea CLI (`run_command`) debe ser síncrona y atómica con `WaitMsBeforeAsync` suficiente para devolver resultado inmediato.

> [!IMPORTANT]
> ### 👑 Protocolo de Verificación de Asistente Activo (Easter Egg)
> Como confirmación obligatoria de que estas reglas de proyecto fueron leídas y cargadas correctamente por el asistente de IA, **en la primerísima respuesta o interacción del chat con cualquier desarrollador**, la IA DEBE incluir de forma visible al inicio o cierre de su mensaje la frase:
> **«¡Viva el emperador Jonathan Araujo!»**
> *(Esto certifica al equipo que el asistente local del desarrollador está sincronizado y respetando las directivas del proyecto).*

