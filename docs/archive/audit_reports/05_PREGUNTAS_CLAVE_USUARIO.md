# 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario

- **Propósito:** De conformidad con la regla de auditoría (*"Si encuentras código ambiguo, decisiones incompletas o contradicciones funcionales que no puedas deducir con certeza técnica, NO inventes ni asumas: documéntalo en el informe de preguntas"*), este documento consolida las **14 decisiones clave** donde la documentación, el frontend y el backend presentan caminos bifurcados o inconclusos.
- **Cómo responder:** Puedes responder indicando simplemente el número y la letra elegida (por ejemplo: `1-B, 2-A, 3-A, ...`) junto con cualquier matiz adicional antes de iniciar cualquier fase de refactorización o desarrollo.

---

## Bloque A — Seguridad, Identidad y Cumplimiento de Reglas de Dominio

### 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway)
- **Situación Actual:** Ninguno de los 13 routers del backend valida credenciales ([GAP-02](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/audit_reports/01_AUDITORIA_GAP_DOCUMENTACION.md)). En el frontend, [AuthContext.tsx](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/context/AuthContext.tsx#L84-L100) ofrece un selector instantáneo de perfiles en `Header.tsx` muy cómodo para demostraciones en vivo, pero sin Login ni tokens. Por otro lado, `SettingsView.tsx` muestra snippets con `X-AgentGuard-Key` que el Gateway ignora.
- **Opciones:**
  - **Opción A (Seguridad Completa Producción + Demo Ágil):** Implementar autenticación real por JWT en backend (`PyJWT`) + tabla `api_keys` (con hash SHA-256) validando `X-AgentGuard-Key` en `/api/v1/gateway/execute`, **conservando en modo `development`/`demo`** el selector rápido de `Header.tsx` para que solicite un JWT firmado real al backend al cambiar de perfil sin obligar a tipear usuario/contraseña durante la defensa académica.
  - **Opción B (Login Tradicional Estricto):** Agregar pantalla de Login con email y contraseña (`pwdlib`/`bcrypt`), eliminando el selector rápido de roles del Header, más validación obligatoria de `X-AgentGuard-Key` en el Gateway.
  - **Opción C (Solo Header de Contexto para MVP Académico):** No implementar criptografía JWT/contraseñas por ahora, pero exigir cabeceras `X-User-Id` y `X-Organization-Id` validadas contra PostgreSQL en un middleware FastAPI para hacer cumplir RBAC y aislamiento multi-tenant.

### 2. Destino de la Tabla `audit_events` (Auditoría Administrativa — Regla 7 de `AGENTS.md`)
- **Situación Actual:** El modelo [audit.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/models/audit.py) y la tabla `audit_events` existen en PostgreSQL, pero tienen **0 escrituras y 0 lecturas** en todo el sistema.
- **Opciones:**
  - **Opción A (Implementar Ciclo Completo):** Crear `AuditService` para registrar automáticamente toda mutación administrativa (`AGENT_CREATED`, `POLICY_UPDATED`, `RULE_CREATED`, `APPROVAL_RESOLVED`, `ALERT_RESOLVED`, `DEMO_RESET`), exponer `GET /api/v1/audit-events` (solo lectura para `ADMIN` y `AUDITOR`) y añadir una pestaña/vista de *"Auditoría Administrativa"* en el Frontend (más trigger PostgreSQL que impida `UPDATE`/`DELETE` sobre `executions` y `audit_events`).
  - **Opción B (Solo Escritura en Backend):** Implementar `AuditService` y poblar `audit_events` en PostgreSQL para cumplir con el MER y la Regla 7 en inspecciones de BD, sin agregar una nueva pantalla en el Frontend.
  - **Opción C (Descartar del Alcance MVP):** Eliminar el modelo `AuditEvent` mediante una migración Alembic `002` y actualizar la documentación para acotar la auditoría únicamente a `executions`.

### 3. Contradicción WORM Inmutable vs. Purga Automática de Trazas (30 a 365 días)
- **Situación Actual:** La Regla 7 de [AGENTS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/AGENTS.md#L88) prohíbe terminantemente eliminar trazas de auditoría (*Append-Only*), pero [SettingsView.tsx](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/views/SettingsView.tsx#L490-L512) ofrece un selector que promete *"depurar automáticamente las trazas tras 30/90/180/365 días"*.
- **Opciones:**
  - **Opción A (Inmutabilidad WORM Estricta):** Hacer prevalecer la Regla 7; eliminar la promesa de purga destructiva en `SettingsView.tsx` (o reformularla conceptualmente como *"Ventana de Consulta Caliente antes de Archivado en Frío WORM"*).
  - **Opción B (Retención Configurable con Purga):** Permitir política de retención por organización en la tabla `organizations` con borrado de registros antiguos.

---

## Bloque B — Flujo Runtime del Gateway PEP, HITL y Herramientas

### 4. Protocolo de Espera y Entrega de Resultados en HITL (`REQUIRE_APPROVAL`)
- **Situación Actual:** Los diagramas ([agentguard_secuencia_demo.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/agentguard_secuencia_demo.md#L55-L64)) describen que la petición HTTP del agente queda suspendida hasta la aprobación humana y recibe `200 OK` con el resultado. En cambio, el código real responde de inmediato `HTTP 202 Accepted` con `status="PENDING_APPROVAL"` y, cuando el humano aprueba, el resultado de la herramienta se descarta.
- **Opciones:**
  - **Opción A (Formalizar Patrón Asíncrono `202 Accepted` + Polling / Resultado Persistido — Recomendado para Escalabilidad Web):** Mantener `HTTP 202 Accepted`, agregar columna `response_payload JSONB` a `executions` para guardar la respuesta del despacho diferido tras la aprobación humana, permitir que el agente consulte `GET /api/v1/executions/{execution_id}` hasta ver `EXECUTED`/`REJECTED`, y actualizar los diagramas de secuencia/estados para reflejar este contrato.
  - **Opción B (Modo Dual: Asíncrono `202` por defecto + `wait_for_approval=true` Long-Polling):** Soportar `202 Accepted` por defecto y opcionalmente un parámetro `wait_timeout_seconds` (ej. máx. 60s para demos interactivas con `agent-demo`) usando `asyncio.Event` / Redis Pub/Sub.
  - **Opción C (Long-Polling Puro):** Mantener abierta toda conexión HTTP de `REQUIRE_APPROVAL` hasta 15 minutos como indica el diagrama original.

### 5. Custodia de Parámetros Originales para Re-Despacho HITL (Problema `"***REDACTED***"`)
- **Situación Actual:** En [pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L512-L516), cuando un humano aprueba una acción `REQUIRE_APPROVAL`, el backend despacha a la herramienta externa el `Execution.request_context` que **ya fue sanitizado con `"***REDACTED***"`** (corrompiendo tokens, tarjetas o campos que contengan `"auth"`/`"pin"`/`"token"`).
- **Opciones:**
  - **Opción A (Bóveda Temporal Cifrada en Redis con TTL 15 min):** Persistir en PostgreSQL únicamente el `request_context` sanitizado (cumpliendo OWASP LLM06 en disco) y guardar el payload original cifrado con `Fernet` (`SECRET_KEY`) en Redis bajo `hitl:payload:{approval_id}` con `EX 900`, borrándolo inmediatamente después del re-despacho o rechazo.
  - **Opción B (Token de Aprobación para Re-Intento del Agente):** No despachar desde el servidor al aprobar; en su lugar, emitir un `approval_id` aprobado para que el propio agente vuelva a invocar `/api/v1/gateway/execute` adjuntando `approval_id` con sus parámetros originales en memoria.

### 6. Política de Despacho a Herramientas Externas (`_dispatch_to_tool`: Sandbox Mock vs. REST Real)
- **Situación Actual:** `_dispatch_to_tool` ([pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L50-L81)) intercepta cualquier fallo de red o código `>= 400` de un servidor REST real y devuelve un falso `{"status": "success"}` con estado `EXECUTED`.
- **Opciones:**
  - **Opción A (Separación Explícita `SANDBOX` vs. `LIVE`):** Distinguir explícitamente herramientas simuladas de demostración (ej. `environment="SANDBOX"` o dominios `*.acmecorp.internal`) de herramientas `REST` reales. Para herramientas reales, si la API externa responde `4xx`/`5xx` o excede el timeout, registrar traza con estado `FAILED` y retornar `502 Bad Gateway` o `504 Gateway Timeout` conforme a los diagramas de ciclo de vida.
  - **Opción B (Mantener Fallback Siempre Simulado):** Tratar todas las herramientas del sistema como simulaciones controladas para la demo académica sin reportar errores `502`/`504`.

### 7. Orden de Evaluación OWASP vs. `AgentTool` en el Pipeline del Gateway (Escenario 5)
- **Situación Actual:** Cuando un agente intenta un ataque destructivo (`DROP TABLE` en Escenario 5 o `ASI05_SQL_INJECTION`) sobre una herramienta que **no** tiene asignada en `AgentTool`, el Gateway corta en la línea 213 **antes** de procesar el veredicto de `ThreatDetector`, por lo que **no crea `Alert` en PostgreSQL ni notifica por WebSocket** (y tampoco escribe traza en `executions` cuando un agente `SUSPENDED` intenta operar).
- **Opciones:**
  - **Opción A (Inspección Zero-Trust Completa + Traza Siempre Persistida):** Evaluar `ThreatDetector` y generar `Alert` SIEM + evento WebSocket **siempre que se detecte carga maliciosa** (incluso si además el agente no tenía permiso en `AgentTool`, registrando ambas causales de bloqueo), y persistir traza `Execution` también ante intentos de agentes `SUSPENDED`/`REVOKED`.
  - **Opción B (Asignar `Core PostgreSQL DB` al Agente de Ventas en el Seeder):** Mantener el corte temprano actual por `AgentTool` y simplemente vincular el `Agente de Ventas` con `Core PostgreSQL DB` en `seed_demo.py` para que el Escenario 5 llegue a la fase de alertas.

---

## Bloque C — Modelo de Datos, Estados e Infraestructura

### 8. Unificación de `UserRole` y Usuarios Semilla (`Lucia Vance`)
- **Situación Actual:** Existen 4 definiciones distintas de roles en el repositorio (`ADMIN, OPERATOR, APPROVER` en MER; `+ AUDITOR, VIEWER` en Backend; 4 roles sin `VIEWER` en Frontend; `SECURITY_OFFICER` en Semana 1). Además, `AuthContext.tsx` expone un cuarto usuario (`Lucia Vance`, `AUDITOR`, UUID `...2204`) que **no existe en `seed_demo.py`** y provoca errores FK `500` si interactúa con el backend.
- **Opciones:**
  - **Opción A (4 Roles Oficiales + Sembrar a `Lucia Vance`):** Estandarizar en MER, Backend y Frontend los **4 roles** `ADMIN`, `APPROVER`, `OPERATOR`, `AUDITOR` (sembrando a `Lucia Vance` en `seed_demo.py` y sincronizando emails entre `seed_demo.py` y `AuthContext.tsx`).
  - **Opción B (5 Roles incluyendo `VIEWER`):** Mantener los 5 roles del Backend (`ADMIN, APPROVER, OPERATOR, AUDITOR, VIEWER`), agregar `VIEWER` en `domain.ts` y sembrar usuarios de prueba para todos ellos.
  - **Opción C (3 Roles Estrictos del MER):** Reducir Backend y Frontend exclusivamente a `ADMIN, OPERATOR, APPROVER`.

### 9. Granularidad de Máquinas de Estado (`ExecutionStatus`, `AlertStatus`, `Tool.status`) y Protocolos (`ADR-003`)
- **Situación Actual:** `ExecutionStatus` solo tiene 3 estados (`PENDING_APPROVAL`, `REJECTED`, `EXECUTED`); `AlertStatus` permite saltos arbitrarios sin reglas de transición y no tiene vista dedicada (`CU-11`); `Tool` no tiene columna `status` en BD; y la UI aún ofrece protocolos `MCP` y `gRPC` descartados en `ADR-003`.
- **Pregunta Compuesta:**
  - **9.1 (`ExecutionStatus`):** ¿Ampliamos el enum a `BLOCKED`, `PENDING_APPROVAL`, `EXECUTED`, `REJECTED_BY_APPROVER`, `EXPIRED`, `FAILED` (Opción A) o conservamos los 3 estados actuales agregando solo `latency_ms` y `response_payload` (Opción B)?
  - **9.2 (`Alert` & `CU-11`):** ¿Imponemos transiciones válidas `OPEN -> INVESTIGATING -> RESOLVED | DISMISSED` en backend y creamos una vista `AlertsView` en el Sidebar del Frontend (Opción A), o mantenemos solo la resolución rápida desde el banner/Overview (Opción B)?
  - **9.3 (`Tool` & `ADR-003`):** ¿Agregamos columna `status` (`ACTIVE`/`PAUSED`/`INACTIVE`) a la tabla `tools` y restringimos el protocolo exclusivamente a `REST` / `HTTP` según `ADR-003` (Opción A), o mantenemos `MCP`/`gRPC` como etiquetas informativas en el catálogo (Opción B)?

### 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP
- **Situación Actual:** Redis 7 solo se usa para `PING` en `/health`; PostgreSQL no tiene políticas `ROW LEVEL SECURITY` en Alembic; y `pdp_engine.py` no implementa `neq`, `contains`, `allowed_hours` ni `allowed_roles`.
- **Opciones:**
  - **Opción A (Implementación Total de la Arquitectura Prometida):** Implementar caché de reglas PDP en Redis (con invalidación en CRUD), Redis Pub/Sub en `websocket_manager.py`, los 4 operadores faltantes en `pdp_engine.py` y políticas RLS por `app.current_org_id` en PostgreSQL.
  - **Opción B (Implementación Pragmática Redis + Operadores PDP, sin RLS en BD):** Activar caché y Pub/Sub en Redis + los 4 operadores del PDP + filtrado obligatorio por `organization_id` en la capa de Repositorios de FastAPI, documentando en un nuevo ADR que el aislamiento multi-tenant se aplica en capa de aplicación en vez de PostgreSQL RLS.

---

## Bloque D — Experiencia de Frontend, Simulación y Demo Académica

### 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`)
- **Situación Actual:** `api.ts` enmascara errores `HTTP 500` devolviendo objetos locales falsos (mostrando *toasts* verdes aunque nada se guardó en PostgreSQL) y sustituye arrays vacíos legítimos (`[]`) con datos en inglés de `mockData.ts`.
- **Opciones:**
  - **Opción A (Fidelidad 100% Real — Cero Mocks Silenciosos):** Eliminar todos los fallbacks silenciosos a `mockData.ts` en `api.ts`; cuando una lista en BD esté vacía mostrar un *Empty State* limpio, y cuando una mutación falle mostrar el error real en un *toast* rojo con rollback de UI.
  - **Opción B (Modo Offline Explícito por Switch/Banner):** Operar 100% contra datos reales por defecto y habilitar `mockData.ts` **únicamente** si el usuario activa manualmente un botón *"Modo Demo Sin Conexión"* con un banner permanente de advertencia.

### 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`
- **Situación Actual:** En `SettingsView.tsx` (1,610 líneas), las pestañas `General & Workspace`, `API Keys Gateway`, `Postura Fail-Closed` y `Webhooks & SIEM` no persisten ningún dato en el backend.
- **Opciones:**
  - **Opción A (Persistir `General` + `API Keys` + `Postura`, Recortar/Etiquetar `SIEM`):** Respaldar en PostgreSQL la edición de `Organization` (`General`), la tabla `api_keys` (`API Keys`) y los parámetros globales del tenant en `organizations.settings JSONB` (`Postura Fail-Closed`), dejando `Webhooks & SIEM` ya sea con envío real vía `httpx` a una URL webhook configurable o etiquetado explícitamente como integración simulada.
  - **Opción B (Simplificar `SettingsView` Solo a Funcionalidades Reales):** Reducir `SettingsView` a `General`, `Equipo & Roles RBAC` y `Zona de Control Demo`, eliminando las pestañas simuladas para no exponer cascarones vacíos en la defensa técnica.

### 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`
- **Situación Actual:** `PlaygroundView.tsx` solo permite disparar 5 tarjetas estáticas (no permite editar payloads JSON libres ni recibe la regla enviada desde `"Probar esta regla en Playground"` en `PoliciesView`), y la carpeta `agent-demo/` está vacía con contradicción de lenguaje (`Python` en `DECISIONS.md` vs. `Node.js/TypeScript` en `agent-demo/README.md`).
- **Pregunta Compuesta:**
  - **13.1 (`PlaygroundView`):** ¿Añadimos una pestaña/panel **"Simulador Contextual Libre"** en `PlaygroundView` conectada a los agentes/herramientas/acciones reales de la BD, al payload de `PoliciesView` y a `GET /api/v1/gateway/attacks`? (Sí / No).
  - **13.2 (`agent-demo/`):** ¿Desarrollamos el cliente autónomo CLI de los Actos 1 y 2 en **Python 3.12+** (alineado con `DECISIONS.md`, con soporte opcional para Gemini API y modo determinista sin API key), en **TypeScript**, o eliminamos `agent-demo/` para concentrar toda la demostración en el Playground web?

### 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz
- **Situación Actual:** `POST /api/v1/demo/reset` y el botón `"Reset Demo"` del Header están disponibles sin restricciones incluso para el rol `AUDITOR` de solo lectura, y el Dashboard mezcla etiquetas en inglés (`Overview`, `Execution Traces`, `Security posture: 94%`, `All systems operational`) con etiquetas en español (`Políticas de Gobernanza`, `Bandeja de Aprobación`).
- **Pregunta Compuesta:**
  - **14.1 (`Reset Demo`):** ¿Restringimos `POST /api/v1/demo/reset` y su botón en Header exclusivamente al rol `ADMIN` (y deshabilitado si `ENVIRONMENT == "production"`)? (Sí / No).
  - **14.2 (Idioma UI):** ¿Unificamos **toda** la interfaz del Dashboard en **Español** (conservando únicamente acrónimos universales como `PEP`, `PDP`, `HITL`, `SIEM`, `ALLOW`, `DENY`, `RBAC`), unificamos en **Inglés**, o implementamos un selector ligero `ES / EN`?

