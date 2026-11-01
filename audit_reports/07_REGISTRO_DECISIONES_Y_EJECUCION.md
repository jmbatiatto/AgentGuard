# 07 — Registro Formal de Decisiones de Arquitectura y Plan de Ejecución

- **Proyecto:** `AgentGuard` — Runtime Authorization & Governance for AI Agents
- **Fecha de Decisión:** 1 de noviembre de 2026
- **Rama de Trabajo:** `remediacion-auditoria`
- **Metodología:** Spec-Driven Development (SDD), ejecución atómica con pruebas continuas.

---

## 1. Decisiones Técnicas y Justificación (Resolución de las 14 Preguntas de Auditoría)

| # | Pregunta Clave | Decisión Adoptada | Justificación Técnica y Arquitectónica |
| :-: | :--- | :--- | :--- |
| **1** | Modelo de Autenticación & Autorización (JWT / API Key / RBAC) | **Opción A (Seguridad Completa + Modo Demo Ágil)** | Se implementa soporte JWT con `PyJWT` para usuarios del Dashboard y cabecera `X-AgentGuard-Key` (hasheada en SHA-256 contra tabla `api_keys`) en el Gateway. En modo de desarrollo, el selector de perfiles emite tokens JWT válidos al instante para no entorpecer la defensa académica. |
| **2** | Destino de la Tabla `audit_events` (Regla 7 WORM) | **Opción A (Implementar Ciclo Completo)** | Se implementa `AuditService` para registrar eventos administrativos (`POLICY_CREATED`, `APPROVAL_RESOLVED`, `ALERT_RESOLVED`, etc.) y se expone `GET /api/v1/audit-events` para roles `ADMIN` y `AUDITOR`, dando cumplimiento estricto a la Regla 7. |
| **3** | WORM Inmutable vs. Purga de Trazas | **Opción A (Inmutabilidad WORM Estricta)** | Prevalece la Regla 7 innegociable de `AGENTS.md`. Se elimina la purga destructiva en `SettingsView.tsx` y se formaliza la retención como política de archivado en frío no destructivo. |
| **4** | Protocolo HITL (`REQUIRE_APPROVAL`) | **Opción A (Formalizar Asíncrono 202 + `response_payload`)** | Mantener `HTTP 202 Accepted` es el patrón web estándar. Se agrega columna `response_payload JSONB` en `executions` para almacenar la respuesta de la herramienta cuando el ticket es aprobado, recuperable mediante `GET /executions/{id}`. |
| **5** | Custodia de Parámetros Pre-Redacción HITL | **Opción A (Bóveda Cifrada en Redis con TTL 15m)** | PostgreSQL almacena únicamente el contexto sanitizado (`"***REDACTED***"`, cumpliendo OWASP LLM06). Redis custodia temporalmente el payload original cifrado con `Fernet` bajo `hitl:payload:{approval_id}` (TTL 900s) y lo consume de forma atómica (`GETDEL`) al reanudar el despacho. |
| **6** | Despacho Upstream (`_dispatch_to_tool`) | **Opción A (Separación SANDBOX vs. LIVE_REST)** | Las herramientas en modo `SANDBOX` devuelven respuestas controladas simuladas. Las herramientas `LIVE_REST` fallan cerrado (`502 Bad Gateway` / `504 Timeout`) y registran `ExecutionStatus.FAILED` sin falsificar éxitos. |
| **7** | Orden de Pipeline Gateway (OWASP vs. `AgentTool`) | **Opción A (Inspección Zero-Trust Completa)** | `ThreatDetector` se evalúa antes del corte de capacidades y genera `Alert` SIEM + WebSocket siempre que haya amenaza (incluso si falta `AgentTool`). Todo intento de agente suspendido/revocado genera traza forense inmutable en `executions`. |
| **8** | Roles Canónicos y Semilla (`Lucia Vance`) | **Opción A (4 Roles Canónicos + Sembrar a Lucia Vance)** | Se unifican los 4 roles en Backend y Frontend: `ADMIN`, `APPROVER`, `OPERATOR`, `AUDITOR`. Se siembra a `Lucia Vance` (`...2204`) con rol `AUDITOR` en `seed_demo.py` y se corrigen discrepancias de emails. |
| **9** | Máquinas de Estado (`ExecutionStatus`, `Alert`, `Tool.status`) | **Opción A (Ampliación Completa de Estados y REST)** | `ExecutionStatus` se amplía a `BLOCKED`, `PENDING_APPROVAL`, `EXECUTED`, `REJECTED`, `EXPIRED`, `FAILED`. Se agrega `latency_ms` y `response_payload` en `executions`. Se añade columna `status` (`ACTIVE`/`PAUSED`/`INACTIVE`) a `tools` y se eliminan opciones `MCP`/`gRPC` según ADR-003. |
| **10** | Redis 7, Multi-Tenancy y Operadores PDP | **Opción B Enriquecida (Caché + Pub/Sub + Operadores PDP + Tenant Guard)** | Se activa caché de políticas en Redis con invalidación, Redis Pub/Sub para WebSockets, los operadores `neq`, `contains`, `allowed_hours` y `allowed_roles` en `pdp_engine.py`, y filtro mandatorio `TenantContext` en repositorios. |
| **11** | Eliminación de Modo "Wizard-of-Oz" (`mockData.ts`) | **Opción A (Fidelidad 100% Real)** | Se eliminan los fallbacks silenciosos a `mockData.ts` en `api.ts`. Los errores HTTP se notifican con toasts de alerta reales y rollback, y las listas vacías muestran estados vacíos auténticos. |
| **12** | Alcance de `SettingsView.tsx` | **Opción A (Persistencia Real de General, API Keys y Postura)** | Se implementa persistencia en backend para actualización de organización (`General`), emisión y revocación de `API Keys`, y configuración de postura de seguridad. |
| **13** | Evolución de Playground y `agent-demo/` | **Opción A (Simulador Libre + CLI Python)** | Se habilita simulación de payloads libres en `PlaygroundView` conectada al backend y se implementa el cliente autónomo CLI en `agent-demo/` en Python 3.12+ para los 5 escenarios. |
| **14** | Gobernanza de Reset Demo e Idioma UI | **Opción A (Reset Exclusivo ADMIN + Interfaz en Español)** | `POST /demo/reset` se restringe a rol `ADMIN` y se bloquea en producción. Toda la interfaz del Frontend se unifica en Español con terminología técnica estándar. |

---

## 2. Plan Secuencial Atómico de Implementación

1. **Paso 1: Higiene y Limpieza de Código Muerto (Informe 04)**
   - Eliminar archivos huérfanos (`App.css`, assets starter de Vite, scripts legacy).
   - Eliminar `.bat` duplicados (`start_dev.bat`, `stop_dev.bat`) y exportación redundante.
   - Purgar dependencias obsoletas en `requirements.txt` y scripts rotos en `package.json`.
   - Pruebas: `git status`, `pnpm build:frontend`, tests backend existentes.

2. **Paso 2: Correcciones Críticas de Backend (Informe 03)**
   - Migración Alembic `002`: agregar columnas (`latency_ms`, `response_payload` a `executions`; `status` a `tools`; tabla `api_keys`; índices compuestos optimizados).
   - Corregir los 5 crashes `MissingGreenlet` (`POST/PATCH /tools`, `POST/PATCH /policies`, `POST /policy-rules`) recargando relaciones de forma explícita.
   - Corregir los 5 `IntegrityError` (`DELETE /agents/{id}`, `DELETE /users/{id}`, `POST /approvals/{id}/resolve`, `PATCH /alerts/{id}/status`, `delegator_user_id`).
   - Corregir el pipeline de `pep_gateway_service.py`: evaluación OWASP antes de return temprano, registro forense siempre en fallos tempranos, cálculo y persistencia de latencia real.
   - Pruebas: tests de regresión en `backend/tests/`.

3. **Paso 3: Bóveda HITL, Operadores PDP, Redis y Multi-Tenancy (Informes 01 y 03)**
   - Implementar custodia de payload original cifrado en Redis para HITL.
   - Bloqueo pesimista `FOR UPDATE` en `resolve_approval` y worker/tarea periódica de expiración TTL a 15 min.
   - Incorporar operadores `neq`, `contains`, `allowed_hours` y `allowed_roles` en `pdp_engine.py`.
   - Integrar caché de políticas en Redis e invalidación reactiva.
   - Implementar `AuditService` y endpoint `GET /api/v1/audit-events`.
   - Pruebas: tests unitarios y de integración de PDP y approvals.

4. **Paso 4: Correcciones Críticas y Alma Máter en Frontend (Informes 01 y 02)**
   - Corregir crash fatal de pantalla blanca en `TracesView.tsx` (`id` vs `execution_id`).
   - Eliminar fallbacks silenciosos a `mockData.ts` en `api.ts`, reportando errores reales.
   - Reparar mapeo de agentes (`assigned_tools`) y aprobaciones con metadatos dinámicos.
   - Sincronizar usuarios de `seed_demo.py` y `AuthContext.tsx` con `Lucia Vance`.
   - Reparar variables CSS (`--bg-canvas`, `.animate-spin`) y consistencia en tema claro.
   - Habilitar Simulador Libre en `PlaygroundView.tsx` y vista de alertas (`AlertsView` para `CU-11`).
   - Pruebas: `pnpm build:frontend` y validación de tipos TypeScript.

5. **Paso 5: Implementación de `agent-demo/` en Python 3.12+ (Informe 01 y 06)**
   - Crear script ejecutable de demostración interactiva que consuma el Gateway PEP para los 5 escenarios.
   - Pruebas: ejecución de prueba contra backend.

6. **Paso 6: Sincronización Documental y Suite de Verificación Final**
   - Actualizar `AGENTS.md`, `README.md` y diagramas de estados para reflejar el estado real.
   - Sincronizar grafo de conocimiento `graphify update .`.
   - Ejecutar suite completa de tests de backend y build de frontend.

