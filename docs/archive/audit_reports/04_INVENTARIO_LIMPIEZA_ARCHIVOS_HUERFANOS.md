# 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos

- **Alcance:** Escaneo estático cruzado de referencias (`import`, `from`, `src=`, `href=`, invocaciones CLI y `git ls-files`) sobre la totalidad del monorepo `AgentGuard`.
- **Fecha de Auditoría:** 30 de octubre de 2026 (`HEAD: a2bcd19`, rama `main`).
- **Política Aplicada:** *Zero-Modification Policy* — Ningún archivo listado aquí fue eliminado ni alterado; este documento constituye el manifiesto técnico auditable para ejecutar la limpieza una vez autorizada.

---

## 1. Resumen Cuantitativo de Higiene del Repositorio

| Categoría de Limpieza | Cantidad Detectada | Acción Recomendada |
| :--- | :---: | :--- |
| **Archivos huérfanos trackeados en Git (0 referencias funcionales)** | **8 archivos** | Eliminación directa (`git rm`) |
| **Archivos duplicados 100% idénticos o exportaciones redundantes** | **3 archivos** | Consolidación / Eliminación |
| **Símbolos internos muertos (interfaces, esquemas, métodos, proxies)** | **6 bloques** | Eliminación o reconexión explícita |
| **Dependencias Python instaladas con `0` imports reales** | **3 paquetes** | Purga o reemplazo moderno en `requirements.txt` |
| **Scripts de `package.json` rotos o redundantes** | **3 entradas** | Corrección / Consolidación |
| **Archivos de instrucciones IA solapados + residuos locales en disco** | **8 rutas** | Unificación documental y limpieza local |

---

## 2. Archivos Huérfanos Trackeados en Git (Candidatos a Eliminación Directa)

Todos los archivos de esta tabla están actualmente versionados en Git, suman peso y ruido cognitivo al repositorio, y cuentan con **0 importaciones o referencias activas** comprobadas mediante búsqueda estática integral:

| Ruta del Archivo | Tamaño / Líneas | Origen del Residuo | Evidencia Técnica de Inutilidad (`0` Referencias) |
| :--- | :---: | :--- | :--- |
| [frontend/src/App.css](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/App.css) | 184 líneas | Plantilla inicial `pnpm create vite` (`react-ts`) | Define selectores del contador demo de Vite (`.counter`, `.hero`, `#next-steps`, `#spacer`). Ni [App.tsx](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/App.tsx) ni [main.tsx](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/main.tsx) lo importan (`main.tsx:3` solo importa `./index.css`). |
| [frontend/src/assets/hero.png](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/assets/hero.png) | 13,057 bytes | Plantilla inicial Vite 8 | `0` coincidencias para `hero.png` en todo `frontend/`. |
| [frontend/src/assets/react.svg](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/assets/react.svg) | 4,126 bytes | Plantilla inicial Vite | `0` coincidencias para `react.svg` en todo `frontend/`. |
| [frontend/src/assets/vite.svg](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/assets/vite.svg) | 8,710 bytes | Plantilla inicial Vite | `0` coincidencias para `vite.svg` en todo `frontend/`. |
| [frontend/public/icons.svg](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/public/icons.svg) | 5,055 bytes | Sprite SVG starter de Vite (logos Discord/GitHub/Vite/X) | `0` coincidencias para `icons.svg` en todo `frontend/` (toda la iconografía real usa `lucide-react`). *(Nota: conservar [frontend/public/favicon.svg](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/public/favicon.svg), que sí es referenciado en [frontend/index.html](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/index.html#L5)).* |
| [scripts/convert_docs_to_docx.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/scripts/convert_docs_to_docx.py) | 84 líneas | Iteración documental previa (Propuesta v1) | Apunta a un directorio relativo inexistente `../01-product/` y requiere la librería `python-docx` (no declarada en `requirements.txt`). Fallará con `FileNotFoundError` / `ModuleNotFoundError` al ejecutarse. |
| [scripts/convert_domain_to_docx.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/scripts/convert_domain_to_docx.py) | 82 líneas | Iteración documental previa (Propuesta v1) | Apunta al directorio inexistente `../02-domain/` y depende de `python-docx` no instalado. Obsoleto tras la consolidación documental de Fase 0 y Fase 1. |
| [scripts/generate_diagrams.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/scripts/generate_diagrams.py) | 856 líneas | Generador temprano de diagramas MER v2.0 (Septiembre 2026) | Genera archivos `.mmd`/`.dot` en `scripts/out/` con un **esquema obsoleto que contradice la BD real**: usa `alert_type` y `resolved_at` en `alerts` (inexistentes en `001_initial_schema.py`), solo 3 roles en `UserRole` y omite `approvals.created_at`. Fue reemplazado oficialmente por los 6 `.drawio` de `diagramas/` ([AGENTS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/AGENTS.md#L48-L55)). |

---

## 3. Archivos Duplicados y Exportaciones Redundantes en Raíz

| Archivo Duplicado | Archivo Canónico Equivalente | Justificación Técnica para Eliminar el Duplicado |
| :--- | :--- | :--- |
| [start_dev.bat](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/start_dev.bat) (374 bytes) | [start_all.bat](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/start_all.bat) (374 bytes) | **Copia byte a byte 100% idéntica.** Ambos invocan `powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-all.ps1" %*`. Mantener dos `.bat` idénticos en la raíz genera ambigüedad innecesaria. |
| [stop_dev.bat](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/stop_dev.bat) (149 bytes) | [stop_all.bat](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/stop_all.bat) (149 bytes) | **Copia byte a byte 100% idéntica.** Ambos invocan `scripts\stop-all.ps1`. |
| [guia_simple_proyecto_agentguard.html](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/guia_simple_proyecto_agentguard.html) | [guia_simple_proyecto_agentguard.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/guia_simple_proyecto_agentguard.md) + [guia_simple_proyecto_agentguard.pdf](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/guia_simple_proyecto_agentguard.pdf) | Exportación HTML intermedia sin referencias desde `AGENTS.md` ni `README.md`, coexistiendo con la fuente editable `.md` y el entregable cerrado `.pdf`. |

---

## 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo

### 4.1 Tipos, Esquemas y Configuraciones con `0` Consumidores
1. **`SecurityStanceSettings` ([frontend/src/types/domain.ts](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/types/domain.ts#L153-L160)):** Interfaz TypeScript exportada (`failClosedEnabled`, `autoQuarantineHighAlerts`, `approvalTimeoutMinutes`, `dataMaskingStrict`, `auditRetentionDays`) con **`0` importaciones** en todo el proyecto (`SettingsView.tsx` implementó sus propios `useState` sueltos sin tipar contra este contrato).
2. **`ExecutionRead` ([backend/app/schemas/gateway.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/schemas/gateway.py#L109-L126)):** Esquema Pydantic muerto con **`0` usos** en routers, servicios o tests. Fue desplazado por `ExecutionResponse` ([backend/app/schemas/execution.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/schemas/execution.py#L12-L35)), dejando dos representaciones divergentes de una traza forense en `app/schemas/`.
3. **Configuración `server.proxy` en Vite ([frontend/vite.config.ts](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/vite.config.ts#L9-L18)):**
   - Declara proxy para `'/api' -> 'http://localhost:8000'` y `'/ws' -> 'ws://localhost:8000'`.
   - **Completamente puenteado (código muerto):** [api.ts](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/services/api.ts#L44) construye URLs absolutas contra `http://localhost:8000`, y [useAgentGuardWebSocket.ts](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/services/useAgentGuardWebSocket.ts#L72-L73) conecta directamente a `ws://localhost:8000/api/v1/ws/...` (además, la clave `'/ws'` del proxy ni siquiera coincide con la ruta real `'/api/v1/ws'`).

### 4.2 Par Endpoint + Método Cliente Nunca Invocado (`Attack Catalog`)
- **Backend:** `GET /api/v1/gateway/attacks` ([backend/app/api/gateway.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/gateway.py#L55-L133)).
- **Frontend:** `api.getAttackVectors()` ([frontend/src/services/api.ts](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/services/api.ts#L755-L818)).
- **Diagnóstico:** Ningún componente de React invoca `api.getAttackVectors()`. En su lugar, [PlaygroundView.tsx](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/views/PlaygroundView.tsx#L51-L103) duplica una constante local `ATTACK_VECTORS` hardcodeada.
- **Recomendación:** No eliminar el endpoint, sino **eliminar la duplicación hardcodeada en `PlaygroundView.tsx`** y consumir la fuente única del backend (ver Pregunta 11 en [05_PREGUNTAS_CLAVE_USUARIO.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/audit_reports/05_PREGUNTAS_CLAVE_USUARIO.md)).

### 4.3 Dataset de Prototipo Heredado que Contamina Datos Reales (`mockData.ts`)
- **Ubicación:** [frontend/src/data/mockData.ts](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/data/mockData.ts) (233 líneas).
- **Diagnóstico:** Remanente de la primera iteración puramente estática en inglés (`Support Assistant`, `Finance Copilot`, `Ops Automator`, IDs no-UUID como `ag_01`, `tool_01`, `pol_01`, `appr_01`). Actualmente actúa como *anti-patrón activo*: cuando una tabla real en PostgreSQL queda vacía (`[]`), `api.ts` inyecta estos objetos incompatibles con UUID v4, provocando errores `422 Unprocessable Entity` al interactuar con ellos.
- **Recomendación:** Si el equipo decide eliminar el modo *Wizard-of-Oz* silencioso (ver Pregunta 8 en `05_PREGUNTAS_CLAVE_USUARIO.md`), `mockData.ts` debe eliminarse de `frontend/src/data/` o moverse exclusivamente a `frontend/src/__fixtures__/` para pruebas unitarias con Vitest.

### 4.4 Modelo ORM y Tabla Huérfana Sujetos a Decisión de Producto (`AuditEvent`)
- **Ubicación:** [backend/app/models/audit.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/models/audit.py) + tabla `audit_events` en [001_initial_schema.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/alembic/versions/001_initial_schema.py#L197-L212).
- **Diagnóstico:** Importado únicamente en `app/models/__init__.py` y `alembic/env.py` para registrar metadatos DDL. Posee **`0` escrituras y `0` lecturas** en toda la aplicación. Su destino (implementar `AuditService` conforme a la Regla 7 de `AGENTS.md` o removerlo del alcance MVP) se eleva en la **Pregunta 2** de `05_PREGUNTAS_CLAVE_USUARIO.md`.

---

## 5. Dependencias Huérfanas y Scripts de Monorepo Rotos

### 5.1 Paquetes Python sin Uso en [backend/requirements.txt](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/requirements.txt)

| Línea | Dependencia Declarada | Importaciones en `backend/` | Diagnóstico Técnico |
| :---: | :--- | :---: | :--- |
| **L13** | `psycopg2-binary==2.9.9` | **0** | Driver PostgreSQL síncrono innecesario. Tanto el runtime (`app/core/database.py`) como Alembic (`alembic/env.py` con `async_engine_from_config`) utilizan exclusivamente `asyncpg==0.30.0`. |
| **L29** | `python-jose[cryptography]==3.3.0` | **0** | Instalada para JWT pero jamás importada. **Nota de Seguridad:** `python-jose` está abandonada/sin mantenimiento activo y presenta CVEs conocidos; cuando se implemente JWT real (Pregunta 1), se recomienda reemplazarla por **`PyJWT[crypto]`**. |
| **L30** | `passlib[bcrypt]==1.7.4` | **0** | Jamás importada (el modelo `User` en `models/user.py` ni siquiera tiene columna `password_hash`). **Nota de Compatibilidad:** `passlib 1.7.4` está rota en Python 3.12+ con `bcrypt >= 4.1` (`AttributeError: module 'bcrypt' has no attribute '__about__'`); si se agrega autenticación por contraseña, usar **`pwdlib[argon2]`** o **`bcrypt`** directo. |

### 5.2 Scripts Rotos o Redundantes en [package.json](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/package.json) (Raíz)
1. **Línea 9 (`"test:frontend": "pnpm --filter frontend test"`):** **ROTO.** [frontend/package.json](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/package.json#L6-L11) solo define `dev`, `build`, `lint` y `preview`. Ejecutar `pnpm test:frontend` falla con `ERR_PNPM_NO_SCRIPT Missing script: test`.
2. **Líneas 11 y 13 (`"dev:backend"` y `"start:backend"`):** Duplicados exactos (`powershell -ExecutionPolicy Bypass -File scripts/start-backend.ps1`).
3. **Líneas 14-17 (`"start"` / `"start:all"` y `"stop"` / `"stop:all"`):** Alias duplicados del mismo comando PowerShell.

---

## 6. Fragmentación de Reglas de IA y Residuos Locales No Versionados

### 6.1 Solapamiento entre 8 Archivos de Instrucciones para Agentes de IA
El repositorio mantiene simultáneamente **8 archivos de configuración de contexto para asistentes**, repitiendo las secciones de Graphify y `start-all.ps1`:
- [AGENTS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/AGENTS.md) y [CLAUDE.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/CLAUDE.md)
- [.agents/rules/graphify.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.agents/rules/graphify.md) y [.cursor/rules/graphify.mdc](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.cursor/rules/graphify.mdc)
- [.agents/rules/local_dev_orchestration.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.agents/rules/local_dev_orchestration.md) y [.cursor/rules/local_dev_orchestration.mdc](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.cursor/rules/local_dev_orchestration.mdc)
- [.github/copilot-instructions.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.github/copilot-instructions.md)
- [.agents/workflows/graphify.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.agents/workflows/graphify.md) *(formato legacy de workflow frente a skills modernas)*

**Recomendación:** Mantener `AGENTS.md` como **Única Fuente de Verdad (SSOT)** y hacer que `CLAUDE.md` / `.github/copilot-instructions.md` sean punteros breves hacia `AGENTS.md`, evitando deriva entre reglas cuando cambie un comando o convención.

### 6.2 Residuos Locales en Disco (Ignorados por `.gitignore`, No Trackeados)
Durante la inspección de directorios se detectaron artefactos históricos locales que ocupan espacio en el workspace sin cumplir función:
- `graphify-out/2026-10-22/` y `graphify-out/2026-10-23/`: snapshots fechados antiguos del grafo de conocimiento (ya superados por `graphify-out/graph.json` en la raíz de `graphify-out/`).
- `graphify-out/.graphify_labels.pending.json`: archivo temporal de etiquetado pendiente de una corrida previa de Graphify.
- `.pytest_cache/` en la raíz del repositorio (duplicado respecto a `backend/.pytest_cache/` generado al correr `pytest` fuera de `backend/`).

