# Graph Report - AgentGuard  (2026-11-13)

## Corpus Check
- 186 files · ~157,083 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: .drawio 6, .bat 3, (none) 2)

## Summary
- 2230 nodes · 6040 edges · 127 communities (91 shown, 36 thin omitted)
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 1062 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `397be76c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- FastAPI
- domain.ts
- sqlalchemy
- ActorType
- 0.1 Backend: Servicios "Dios", Fuga de ORM hacia HTTP y Dominio Impuro
- AgentService
- App.tsx
- policies.py
- uuid
- api.ts
- frontend/package.json
- Skeleton.tsx
- organizations.py
- approvals.py
- uuid
- test_analytics.py
- package.json
- UserService
- ._dispatch_to_tool
- compilerOptions
- uuid
- api/auth.py
- compilerOptions
- asyncio
- env.py
- test_schemas.py
- schemas/api_key.py
- PlaygroundView.tsx
- websocket_manager.py
- users.py
- asyncio
- update_tool
- PolicyService
- ⚙️ AgentGuard — Backend (Python + FastAPI)
- agents.py
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0
- User
- typing
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP
- 3. Los 4 Escenarios Demostrables Paso a Paso
- ApiKey
- tool_service.py
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- OverviewView.tsx
- domain.ts
- main
- PolicyRule
- scripts
- ToolAction
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- ToolAction
- 🤖 AgentGuard — Cliente Agéntico Autónomo de Demostración (CLI)
- CLAUDE.md
- frontend/README.md
- copilot-instructions.md
- SanitizerService
- sqlalchemy_ext_asyncio
- PolicyRuleService
- organization_service.py
- ApiKey
- Execution
- api/gateway.py
- devDependencies
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- threat_detector.py
- dependencies
- webhook_service.py
- AuthContext.tsx
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- auth-ui.tsx
- 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo
- generate_diagrams.py
- scripts
- get_analytics_overview
- audit_events.py
- cleanup_overrides
- deps.py
- 3. Hallazgos Críticos y Bugs Funcionales en el Frontend
- asyncio
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- `_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard
- test_siem_webhook_test_ping_missing_url
- test_api_get_attack_catalog
- 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural
- 1.2 Inventario Individual (39 archivos `.md`)
- revoke_api_key
- health_check
- 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos
- 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas
- test_threat_detector_goal_hijacking
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- test_threat_detector_data_exfiltration
- test_threat_detector_base64_obfuscation
- test_threat_detector_embedded_base64_obfuscation
- test_threat_detector_destructive_sql
- test_threat_detector_clean_parameters
- BRIEFING — 2026-11-03 02:34:00 UTC
- 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)
- test_agent_service_assign_tool
- 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa
- 4. Brechas de Seguridad, Multi-Tenancy y Reglas de Dominio (`AGENTS.md` §4)
- Master Handoff Report — Sentinel (Fase 1, Fase 2 y Fase 3)
- react
- dependencies
- cleanup_overrides
- test_get_execution_by_id_not_found
- get_attack_catalog
- test_organization_service_create
- ExecutionStatus
- list_executions

## God Nodes (most connected - your core abstractions)
1. `User` - 110 edges
2. `UserRole` - 74 edges
3. `ToolAction` - 73 edges
4. `Tool` - 71 edges
5. `Organization` - 66 edges
6. `BaseSchema` - 64 edges
7. `PolicyDecision` - 63 edges
8. `Execution` - 62 edges
9. `Agent` - 61 edges
10. `AgentTool` - 55 edges

## Surprising Connections (you probably didn't know these)
- `3.2 Superficie HTTP/WebSocket real (`backend/app/api/`)` --references--> `get_current_user()`  [INFERRED]
  docs/archive/_MASTER_PROJECT_SNAPSHOT.md → backend/app/api/deps.py
- `4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens)` --references--> `require_admin_user()`  [INFERRED]
  AGENTS.md → backend/app/api/deps.py
- `¿Qué se hace concretamente?` --references--> `get_db()`  [INFERRED]
  docs/archive/desglose_de_pasos_semana_1_base_de_datos_y_setup_inicial.md → backend/app/core/database.py
- `¿Por qué es necesaria cada tecnología y qué rol cumple?` --references--> `lifespan()`  [INFERRED]
  docs/archive/desglose_de_pasos_semana_1_base_de_datos_y_setup_inicial.md → backend/app/main.py
- `❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*` --references--> `AgentTool`  [INFERRED]
  agentguard_er_conceptual_chen.md → backend/app/models/agent.py

## Import Cycles
- None detected.

## Communities (127 total, 36 thin omitted)

### Community 0 - "FastAPI"
Cohesion: 0.10
Nodes (7): get_alert_by_id(), list_alerts(), update_alert_status(), websocket_global_endpoint(), websocket_tenant_endpoint(), lifespan(), 5. Hoja de Ruta Sugerida de Ejecución Incremental (Post-Aprobación de Decisiones)

### Community 1 - "domain.ts"
Cohesion: 0.07
Nodes (31): 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), 1.3 El Patrón de Resiliencia Opaca: Riesgo de los *Silent Fallbacks*, Riesgos Técnicos Asociados:, Alcance de la Fase 2:, Contexto y Reglas Obligatorias:, Criterios de Aceptación:, Criterios de Aceptación:, Entregables: (+23 more)

### Community 2 - "sqlalchemy"
Cohesion: 0.11
Nodes (10): downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade() (+2 more)

### Community 3 - "ActorType"
Cohesion: 0.09
Nodes (13): AuditEvent, ActorType, AuditService, test_api_audit_events_anti_ai_shield(), test_api_get_audit_event_by_id_success(), test_api_get_audit_event_not_found(), test_api_list_audit_events_offset_alias_and_filters(), test_api_list_audit_events_success() (+5 more)

### Community 6 - "App.tsx"
Cohesion: 0.19
Nodes (36): Frontend, Demo, Docs, Cache y Graphify (`frontend/`, `agent-demo/`, `docs/`, `.pytest_cache/`, `graphify-out/`) — 10 archivos, 4.2 Flujos Esenciales de la Propuesta de Valor que No Existen Aún, 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 3.2 Cuellos de Botella en Frontend (Renderizado, Red, Estado y Memoria), 1. Observation, 2. Logic Chain, 2.2 Tabla Maestra de Vistas, Componentes y Estado de Consumo (+28 more)

### Community 7 - "policies.py"
Cohesion: 0.16
Nodes (6): create_policy(), create_policy_rule_in_policy(), delete_policy(), get_policy(), list_policies(), update_policy()

### Community 8 - "uuid"
Cohesion: 0.09
Nodes (14): test_api_create_api_key_blocks_ai_agents(), test_api_create_api_key_org_not_found(), test_api_create_api_key_returns_raw_key_once_and_hides_hash(), test_api_get_api_key_by_id_not_found(), test_api_get_api_key_by_id_success(), test_api_list_api_keys_blocks_ai_agents(), test_api_list_api_keys_does_not_leak_plaintext_or_hash(), test_api_multi_tenant_isolation_cross_tenant_forbidden() (+6 more)

### Community 9 - "api.ts"
Cohesion: 0.08
Nodes (41): EmptyStateAction, EmptyStateProps, HeaderProps, ResetDemoModal(), ResetDemoModalProps, AGENT_STATUS_LABELS, AGENT_STATUS_STYLES, APPROVAL_STATUS_LABELS (+33 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.14
Nodes (13): name, private, type, version, oxlint, react-dom, @tailwindcss/vite, @types/node (+5 more)

### Community 11 - "Skeleton.tsx"
Cohesion: 0.14
Nodes (13): 2. Reglas Innegociables de Seguridad, Dominio e Idioma, 2.1 Mapa de Duplicaciones Principales (7 grupos), 2.2 Mapa de Contradicciones (Doc vs. Doc y Doc vs. Código/Graphify), 2. Mapa de Duplicaciones y Contradicciones, 4.1 Módulos construidos y verificables en código, INC-11: Refactorización de `api.ts` (Propagación Explícita de Errores y `ApiError`), DEFAULT_WIDTHS, Skeleton() (+5 more)

### Community 12 - "organizations.py"
Cohesion: 0.16
Nodes (7): create_organization(), get_organization(), get_organization_settings(), list_organizations(), test_organization_siem_webhook(), update_organization_settings(), SiemWebhookTestResponse

### Community 13 - "approvals.py"
Cohesion: 0.05
Nodes (37): get_approval(), list_approvals(), resolve_approval(), ApprovalDetailRead, 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota, 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado), 1.4 Métricas Globales de Cobertura de la Auditoría, 1. Resumen Ejecutivo y Diagnóstico Global del Sistema (+29 more)

### Community 14 - "uuid"
Cohesion: 0.04
Nodes (52): RuleEffect, UserRole, Policy, PolicyRule, test_api_get_audit_event_tenant_mismatch(), test_api_list_audit_events_tenant_isolation_forbidden(), test_mutation_policy_rules_logs_audit_events(), test_api_create_policy_organization_not_found() (+44 more)

### Community 15 - "test_analytics.py"
Cohesion: 0.05
Nodes (19): AnalyticsOverviewResponse, AnalyticsTimeseriesResponse, TimeseriesPoint, AnalyticsService, ToolActionService, MockOverviewRow, MockTimeseriesRow, test_analytics_service_get_overview_empty_state() (+11 more)

### Community 16 - "package.json"
Cohesion: 0.11
Nodes (17): description, devDependencies, tailwindcss, @tailwindcss/vite, engines, node, name, packageManager (+9 more)

### Community 18 - "._dispatch_to_tool"
Cohesion: 0.18
Nodes (9): 3.1 Falso Éxito Silencioso en `_dispatch_to_tool` (Violación Directa de Fail-Closed), 3.2 Re-Despacho HITL Corrupto con Parámetros `"***REDACTED***"` y Pérdida de Resultado, 3.3 Bug de Orden de Validación en el Pipeline del Gateway (Supresión de Alertas OWASP y Trazas), 3.4 Latencia Forense Ficticia (`latency_ms=21.5`), 3. Stubs, Retornos Ficticios y Fallos de Lógica en el Core PEP/PDP, 2.2 *Specification / Strategy Registry* para Operadores del Motor PDP, 2.3 *Claim-Check Pattern* Cifrado para HITL (`HitlPayloadVault`), 2.4 *Strategy + Circuit Breaker* para Despacho de Herramientas (`LiveRestDispatcher` vs. `SandboxMockDispatcher`) (+1 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 20 - "uuid"
Cohesion: 0.07
Nodes (14): test_api_admin_user_same_tenant_allowed(), test_api_anti_ia_shield_blocks_agent_on_get(), test_api_anti_ia_shield_blocks_agent_on_patch(), test_api_get_settings_not_found(), test_api_get_settings_success(), test_api_multi_tenant_isolation_get_cross_tenant_denied(), test_api_multi_tenant_isolation_patch_cross_tenant_denied(), test_api_patch_settings_not_found() (+6 more)

### Community 21 - "api/auth.py"
Cohesion: 0.11
Nodes (7): get_me(), login(), register(), create_access_token(), get_password_hash(), verify_password(), TokenResponse

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "asyncio"
Cohesion: 0.11
Nodes (8): test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id(), test_tool_service_list_by_org()

### Community 24 - "env.py"
Cohesion: 0.06
Nodes (9): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online(), Settings, test_health_endpoint(), test_ping_endpoint(), test_root_endpoint() (+1 more)

### Community 25 - "test_schemas.py"
Cohesion: 0.08
Nodes (12): create_tool_action(), get_tool_action(), list_tool_actions(), ApprovalResolveRequest, ToolActionCreate, ToolActionRead, ToolRead, test_alert_schema() (+4 more)

### Community 26 - "schemas/api_key.py"
Cohesion: 0.22
Nodes (4): create_api_key(), ApiKeyCreate, ApiKeyCreatedResponse, ApiKeyResponse

### Community 27 - "PlaygroundView.tsx"
Cohesion: 0.20
Nodes (9): ATTACK_VECTORS, AttackVectorOption, CompanyDatabaseState, INITIAL_DATABASE_STATE, SimulatedCustomer, SimulatedProduct, SimulatedTransaction, SimulationDecision (+1 more)

### Community 28 - "websocket_manager.py"
Cohesion: 0.12
Nodes (6): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "users.py"
Cohesion: 0.12
Nodes (9): create_user(), delete_user(), get_user(), list_users(), update_user(), UserCreate, UserRead, UserUpdate (+1 more)

### Community 30 - "asyncio"
Cohesion: 0.09
Nodes (11): test_anti_ai_shielding_in_control_plane(), test_get_me_invalid_token(), test_get_me_missing_token(), test_get_me_success(), test_login_demo_credentials_and_alias(), test_login_invalid_password(), test_login_nonexistent_user(), test_login_seed_user_fallback() (+3 more)

### Community 31 - "update_tool"
Cohesion: 0.16
Nodes (5): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool()

### Community 32 - "PolicyService"
Cohesion: 0.12
Nodes (5): PolicyCreate, PolicyUpdate, PolicyRuleCreateInPolicy, PolicyRuleUpdate, PolicyService

### Community 33 - "⚙️ AgentGuard — Backend (Python + FastAPI)"
Cohesion: 0.33
Nodes (5): ⚙️ AgentGuard — Backend (Python + FastAPI), 🏗️ Arquitectura de la API REST, 📋 Especificaciones y Hitos de Desarrollo, 📁 Estructura del Código Fuente, 🗄️ Versionado de Base de Datos con Alembic

### Community 35 - "agents.py"
Cohesion: 0.10
Nodes (13): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentCreate (+5 more)

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime"
Cohesion: 0.15
Nodes (12): 1. Importancia del Modelado de Estados en Arquitecturas Asíncronas, 2. Diagramas de Estados UML (Mermaid), 3. Análisis Detallado de las Transiciones, 4. Principios de Robustez: Idempotencia y Prevención de Condiciones de Carrera, 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`) (+4 more)

### Community 38 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.11
Nodes (19): 1. Contexto y Problema, 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 2. Decisión Tomada, 2. Decisión Tomada, 2. Decisión Tomada (+11 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0"
Cohesion: 0.15
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid), 3. Decisiones Arquitectónicas y Justificación Técnica, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Base de Datos Compartida con Discriminador de Tenant, B. Uso de UUID v4 como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` vs. Normalización Extrema, D. Sanitización y Privacidad del `request_context` (+4 more)

### Community 47 - "User"
Cohesion: 0.10
Nodes (7): Base, get_db(), Organization, User, test_api_create_agent_owner_different_org(), test_mutation_policy_lifecycle_logs_audit_events(), test_api_create_user_email_conflict()

### Community 48 - "typing"
Cohesion: 0.08
Nodes (14): AlertRead, AlertUpdateRequest, ApprovalRead, AuditEventPagination, LoginRequest, RegisterRequest, UserMeResponse, BaseSchema (+6 more)

### Community 49 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.08
Nodes (23): 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2), 3. Ejecutar las Migraciones de Base de Datos (Paso 3), 4. Iniciar el Servidor de Desarrollo (Paso 4), 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial, 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué, 🧭 Diagrama de Flujo de los 4 Pasos, 🛠️ Guía Rápida de Comandos para Ejecutar la Semana 1 (+15 more)

### Community 50 - "🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP"
Cohesion: 0.20
Nodes (9): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime y Flujo de Intercepción (Mermaid), 3. Los Dos Componentes Clave: PEP y PDP (Estándar XACML / RFC 2904), 4. Manejo de Latencia y Rendimiento en la Ruta Crítica, 5. Preguntas Difíciles del Profesor y Respuestas Magistrales, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Por qué dicen que esto no es simplemente un API Gateway como Kong o Nginx?"*, ❓ P2: *"¿Dónde está la Inteligencia Artificial si el backend es determinista?"* (+1 more)

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia de la Demo (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. El Cierre Magistral: El "Execution Trace", Escenario 1: Operación Normal (`ALLOW`), Escenario 2: Intento de Abuso de Privilegio (`DENY`), Escenario 3: Operación de Alto Impacto con Intervención Humana (`REQUIRE_APPROVAL`), Escenario 4: Ataque de Prompt Injection y Alerta Crítica (`DENY + ALERT`) (+1 more)

### Community 53 - "tool_service.py"
Cohesion: 0.17
Nodes (4): ToolCreate, ToolUpdate, ToolService, 2.1 Fallos `sqlalchemy.exc.MissingGreenlet` por Lazy-Loading Implícito tras `db.refresh()`

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.13
Nodes (14): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 3. Análisis Semántico de las Relaciones y Cardinalidades, 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$) (+6 more)

### Community 55 - "OverviewView.tsx"
Cohesion: 0.14
Nodes (17): B. Matriz Comparativa de Enums, Fase 5: Conexión de Maquetas Auxiliares (Timeseries, Keys, SIEM), DEMO_IDS, UseAgentGuardWebSocketOptions, WebSocketEventMessage, AnalyticsTimeseries, SecurityAlert, ToolActionItem (+9 more)

### Community 56 - "domain.ts"
Cohesion: 0.22
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 57 - "main"
Cohesion: 0.20
Nodes (8): 1. Identidad, Stack Políglota y Equipo, 3. Testing, Zero-Regression y Comandos Canónicos en Windows, 4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens), 🛡️ Reglas Operativas del Proyecto: AgentGuard, main(), 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`), 1. Resumen Ejecutivo de Divergencia Arquitectónica, 3. Análisis Específico de Contradicciones Internas en la Documentación

### Community 58 - "PolicyRule"
Cohesion: 0.11
Nodes (8): PDPEngine, test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric(), test_pdp_evaluate_allow(), test_pdp_evaluate_deny_fail_closed(), test_pdp_evaluate_priority_tie_deny_wins(), test_pdp_evaluate_require_approval()

### Community 59 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build:frontend, dev:backend, dev:frontend, lint:frontend, start, start:all, start:backend (+4 more)

### Community 60 - "ToolAction"
Cohesion: 0.07
Nodes (43): Agent, AgentTool, AgentStatus, PolicyDecision, RiskLevel, Tool, ToolAction, GatewayExecuteRequest (+35 more)

### Community 62 - "ToolAction"
Cohesion: 0.11
Nodes (8): test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions(), test_tool_action_service_create(), test_tool_action_service_get_by_id(), test_tool_action_service_get_by_tool_and_name(), test_tool_action_service_list_actions()

### Community 67 - "SanitizerService"
Cohesion: 0.12
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 68 - "sqlalchemy_ext_asyncio"
Cohesion: 0.15
Nodes (5): create_policy_rule(), delete_policy_rule(), get_policy_rule(), list_policy_rules(), update_policy_rule()

### Community 70 - "organization_service.py"
Cohesion: 0.17
Nodes (3): OrganizationSettings, OrganizationSettingsUpdate, OrganizationService

### Community 71 - "ApiKey"
Cohesion: 0.08
Nodes (3): reset_demo_data(), _AutoYieldOverrides, _AutoYieldOverrides

### Community 72 - "Execution"
Cohesion: 0.07
Nodes (26): 4. Las 7 Correcciones y Mejoras de la Versión 2.0, Alert, Approval, AlertSeverity, AlertStatus, ApprovalStatus, Execution, PEPGatewayService (+18 more)

### Community 74 - "devDependencies"
Cohesion: 0.25
Nodes (8): devDependencies, oxlint, @types/node, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.15
Nodes (13): 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents, 🚀 Arranque Rápido con un Solo Clic (Quickstart Local), 🏛️ Contexto Institucional y Equipo, 🖥️ Cómo Visualizar y Editar los Diagramas, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles (+5 more)

### Community 76 - "threat_detector.py"
Cohesion: 0.17
Nodes (3): ThreatAnalysisResult, ThreatDetectorService, 5. Deuda Técnica y Riesgos Detectados

### Community 77 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, class-variance-authority, clsx, @radix-ui/react-label, @radix-ui/react-slot, tailwind-merge, tw-animate-css

### Community 79 - "AuthContext.tsx"
Cohesion: 0.09
Nodes (30): 2.1 Arquitectura de Ruteo y Navegación Hash, 2. Inventario Exhaustivo de Vistas y Componentes del Frontend, Fase 4: Autenticación JWT y Propagación Formal de Tenant Isolation, 1.1 Qué problema resuelve, 1.2 Roles y realidad SaaS B2B vs. solicitud PaaS Superadmin, 1. Propósito y Modelo de Negocio (SaaS B2B vs. PaaS Multi-tenant), SidebarProps, DashboardSidebarProps (+22 more)

### Community 80 - "05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario"
Cohesion: 0.12
Nodes (15): 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario, 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP, 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`), 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`, 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz, 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway), 3. Contradicción WORM Inmutable vs. Purga Automática de Trazas (30 a 365 días), 4. Protocolo de Espera y Entrega de Resultados en HITL (`REQUIRE_APPROVAL`) (+7 more)

### Community 81 - "auth-ui.tsx"
Cohesion: 0.21
Nodes (19): AuthContentProps, AuthFormContainer(), AuthUI(), AuthUIProps, Button, ButtonProps, buttonVariants, cn() (+11 more)

### Community 82 - "4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo"
Cohesion: 0.40
Nodes (5): 4.1 Tipos, Esquemas y Configuraciones con `0` Consumidores, 4.2 Par Endpoint + Método Cliente Nunca Invocado (`Attack Catalog`), 4.3 Dataset de Prototipo Heredado que Contamina Datos Reales (`mockData.ts`), 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo, SecurityStanceSettings

### Community 83 - "generate_diagrams.py"
Cohesion: 0.19
Nodes (5): root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 84 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 85 - "get_analytics_overview"
Cohesion: 0.27
Nodes (4): get_analytics_overview(), get_analytics_timeseries(), _validate_and_parse_org_id(), _verify_tenant_access()

### Community 86 - "audit_events.py"
Cohesion: 0.18
Nodes (5): get_audit_event(), list_audit_events(), AuditEventBase, AuditEventCreate, AuditEventResponse

### Community 88 - "deps.py"
Cohesion: 0.22
Nodes (3): get_current_user(), require_admin_user(), decode_access_token()

### Community 89 - "3. Hallazgos Críticos y Bugs Funcionales en el Frontend"
Cohesion: 0.15
Nodes (12): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.3 Pérdida de Datos Reales en el Mapeo DTO -> Dominio (`api.ts`), 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos, 3.6 Defectos de CSS, Tematización y Clases Inexistentes (+4 more)

### Community 90 - "asyncio"
Cohesion: 0.13
Nodes (7): test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_get_by_id(), test_organization_service_list_all()

### Community 91 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.15
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 92 - "`_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard"
Cohesion: 0.15
Nodes (12): 2.1 Stack políglota verificado, 2.2 Topología PEP / PDP y aislamiento multi-tenant, 2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel), 2. Arquitectura y Stack Tecnológico, 3.1 Esquema PostgreSQL real (13 tablas, migraciones `001`–`005`), 3.2 Superficie HTTP/WebSocket real (`backend/app/api/`), 3. Modelo de Datos y Contratos Clave, 4.2 Módulos a medio hacer o parcialmente cableados (+4 more)

### Community 93 - "test_siem_webhook_test_ping_missing_url"
Cohesion: 0.20
Nodes (5): test_list_organizations_success(), test_siem_webhook_settings_update(), mock_execute(), test_siem_webhook_test_ping_missing_url(), test_siem_webhook_test_ping_success()

### Community 95 - "03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural"
Cohesion: 0.17
Nodes (8): test_api_reset_demo_success(), test_seed_data_already_exists_without_reset(), 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural, 1. Veredicto Ejecutivo del Backend, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`), 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución, 5. Deuda Técnica Estructural, Contratos Incompletos y Configuración, 6. Diagnóstico de la Suite de Pruebas (`backend/tests/`)

### Community 96 - "1.2 Inventario Individual (39 archivos `.md`)"
Cohesion: 0.17
Nodes (11): 1.1 Árbol Documental del Repositorio, 1.2 Inventario Individual (39 archivos `.md`), 1.3 Bloque Aparte: Logs Históricos de Ejecución (`.agents/teamwork/*/*`), 1.4 Artefactos No-Markdown Relacionados, 1. Inventario Completo de Archivos Markdown (`.md`), 3. Propuesta de Poda y Estructura Oficial Recomendada, `_AUDIT_MD_INDEX.md` — Auditoría, Mapa de Contradicciones y Propuesta de Poda Documental, Backend (`backend/`) — 5 archivos (+3 more)

### Community 97 - "revoke_api_key"
Cohesion: 0.24
Nodes (3): get_api_key(), list_api_keys(), revoke_api_key()

### Community 98 - "health_check"
Cohesion: 0.18
Nodes (4): check_database_health(), check_redis_health(), health_check(), ping()

### Community 99 - "04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos"
Cohesion: 0.18
Nodes (10): 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos, 1. Resumen Cuantitativo de Higiene del Repositorio, 2. Archivos Huérfanos Trackeados en Git (Candidatos a Eliminación Directa), 3. Archivos Duplicados y Exportaciones Redundantes en Raíz, 5.1 Paquetes Python sin Uso en [backend/requirements.txt](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/requirements.txt), 5.2 Scripts Rotos o Redundantes en [package.json](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/package.json) (Raíz), 5. Dependencias Huérfanas y Scripts de Monorepo Rotos, 6.1 Solapamiento entre 8 Archivos de Instrucciones para Agentes de IA (+2 more)

### Community 100 - "06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas"
Cohesion: 0.20
Nodes (9): 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean), 1.2 Árbol de Directorios Objetivo — Backend (`backend/`), 1.3 Árbol de Directorios Objetivo — Frontend (`frontend/src/`), 1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back), 3. Detección de Cuellos de Botella de Rendimiento y Estrategias de Optimización, 4.1 Estándares de Backend (`Python 3.12+` / `FastAPI` / `SQLAlchemy 2.0` / `Pydantic v2`), 4.2 Estándares de Frontend (`TypeScript 6` / `React 19` / `Vite 8` / `pnpm`) (+1 more)

### Community 102 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 108 - "BRIEFING — 2026-11-03 02:34:00 UTC"
Cohesion: 0.22
Nodes (8): Artifact Index, BRIEFING — 2026-11-03 02:34:00 UTC, 🔒 Key Constraints, Mission, 🔒 My Identity, Project Status, User Context, Victory Audit Status

### Community 109 - "🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)"
Cohesion: 0.29
Nodes (6): 🛡️ Certificación de los 4 Escenarios de la Demo ante el Tribunal, 🎓 Conclusión y Próximos Pasos (Semana 4), 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP), 📊 Matriz de Entregables y Estado Final, 🧪 Métricas de Calidad y Cobertura (Pytest), 🎯 Resumen Ejecutivo de Entrega de la Semana 3

### Community 110 - "test_agent_service_assign_tool"
Cohesion: 0.33
Nodes (3): test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh()

### Community 111 - "📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa"
Cohesion: 0.33
Nodes (5): 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa, 🧭 Diagrama de Flujo de los 8 Pasos Atómicos, 📦 Historial de Commits Atómicos (Semana 2), 🎯 Objetivo de la Semana 2, 🏗️ Resumen de Capas Implementadas

### Community 112 - "4. Brechas de Seguridad, Multi-Tenancy y Reglas de Dominio (`AGENTS.md` §4)"
Cohesion: 0.40
Nodes (5): 4.1 Ausencia Total de Autenticación y Control de Acceso (RBAC) en APIs, 4.2 Fugas de Aislamiento Multi-Tenant (Violación de Regla 2 de `AGENTS.md`), 4.3 Condición de Carrera TOCTOU y Expiración Pasiva en Aprobaciones HITL, 4.4 Defectos en `SanitizerService` y Configuraciones Ignoradas, 4. Brechas de Seguridad, Multi-Tenancy y Reglas de Dominio (`AGENTS.md` §4)

### Community 113 - "Master Handoff Report — Sentinel (Fase 1, Fase 2 y Fase 3)"
Cohesion: 0.40
Nodes (4): 3. Caveats, 4. Conclusion, 5. Verification Method, Master Handoff Report — Sentinel (Fase 1, Fase 2 y Fase 3)

### Community 114 - "react"
Cohesion: 0.22
Nodes (10): TOAST_CONFIG, ToastItem(), Theme, ThemeContext, ThemeContextType, Toast, ToastContext, ToastContextType (+2 more)

### Community 115 - "dependencies"
Cohesion: 0.50
Nodes (4): dependencies, lucide-react, react, react-dom

### Community 123 - "ExecutionStatus"
Cohesion: 0.14
Nodes (8): ExecutionStatus, GatewayExecuteResponse, GatewayExecutionTraceRead, test_gateway_execute_endpoint_allow(), test_gateway_execute_endpoint_deny(), test_gateway_execute_endpoint_require_approval(), test_gateway_execute_validation_error(), test_gateway_schemas()

### Community 136 - "list_executions"
Cohesion: 0.27
Nodes (4): get_execution_by_id(), list_executions(), _to_execution_response(), ExecutionResponse

## Knowledge Gaps
- **7 isolated node(s):** `@types/node`, `@types/react`, `@types/react-dom`, `oxlint`, `typescript` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1050 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentTool` connect `ToolAction` to `FastAPI`, `agents.py`, `AgentService`, `App.tsx`, `🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)`, `Execution`, `Skeleton.tsx`, `User`, `📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa`, `._dispatch_to_tool`, `tool_service.py`, `📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos`, `ExecutionStatus`, `03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Are the 73 inferred relationships involving `User` (e.g. with `get_analytics_overview()` and `get_analytics_timeseries()`) actually correct?**
  _`User` has 73 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/node`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `FastAPI` be split into smaller, more focused modules?**
  _Cohesion score 0.10344827586206896 - nodes in this community are weakly interconnected._
- **Why does `1.3 Flujo principal operativo vs. onboarding en "pocos clics"` connect `App.tsx` to `uuid`, `AuthContext.tsx`, `ApiKey`, `OverviewView.tsx`, `ToolAction`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Are the 53 inferred relationships involving `UserRole` (e.g. with `register()` and `require_admin_user()`) actually correct?**
  _`UserRole` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07432651736449204 - nodes in this community are weakly interconnected._