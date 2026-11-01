# Graph Report - AgentGuard  (2026-11-01)

## Corpus Check
- 150 files · ~110,619 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: .drawio 6, .bat 3, (none) 2)

## Summary
- 1602 nodes · 3984 edges · 93 communities (70 shown, 23 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 625 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2a3faf1d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Alert
- AgentGuardApiClient
- AgentTool
- test_schemas.py
- get_db
- asyncio
- App.tsx
- Policy
- policy_rules.py
- api.ts
- frontend/package.json
- test_gateway_api.py
- organizations.py
- enums.py
- 🛡️ Reglas de Proyecto: AgentGuard — Runtime Authorization & Governance for AI Agents
- ToolService
- main.py
- datetime
- AgentService
- compilerOptions
- uuid
- PDPEngine
- compilerOptions
- scripts
- demo_agent.py
- approvals.py
- typing
- UserService
- WebSocketConnectionManager
- UserRole
- 🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard)
- tools.py
- BaseSchema
- 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa
- agents.py
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0
- Tool
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- AuthContext.tsx
- 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP
- 3. Los 4 Escenarios Demostrables Paso a Paso
- test_tool_actions.py
- PolicyCache
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- alerts.py
- domain.ts
- asyncio
- 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas
- react
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- FastAPI
- 🤖 AgentGuard — Cliente Agéntico Autónomo de Demostración (CLI)
- CLAUDE.md
- frontend/README.md
- copilot-instructions.md
- SanitizerService
- Settings
- sqlalchemy_ext_asyncio
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- demo.py
- list_alerts
- AuditEvent
- ToolActionService
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- threat_detector.py
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- ExecutionStatus
- PlaygroundView.tsx
- 3. Hallazgos Críticos y Bugs Funcionales en el Frontend
- test_approvals_get_by_id_success
- test_health.py
- 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos
- RedisHitlVault
- create_tool_action
- AuditService
- redis_vault.py
- test_executions.py
- 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo
- test_threat_detector.py
- Bloque D — Experiencia de Frontend, Simulación y Demo Académica

## God Nodes (most connected - your core abstractions)
1. `ToolAction` - 56 edges
2. `Tool` - 54 edges
3. `AgentTool` - 49 edges
4. `PolicyDecision` - 47 edges
5. `Execution` - 47 edges
6. `Agent` - 46 edges
7. `BaseSchema` - 46 edges
8. `Alert` - 42 edges
9. `Organization` - 41 edges
10. `PolicyRule` - 41 edges

## Surprising Connections (you probably didn't know these)
- `🔬 Matriz de Escenarios Canónicos Evaluados` --references--> `AgentTool`  [INFERRED]
  agent-demo/README.md → backend/app/models/agent.py
- `❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*` --references--> `AgentTool`  [INFERRED]
  agentguard_er_conceptual_chen.md → backend/app/models/agent.py
- `1. Contexto y Problema` --references--> `AgentTool`  [INFERRED]
  DECISIONS.md → backend/app/models/agent.py
- `Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY)` --references--> `AgentTool`  [INFERRED]
  docs/PROPUESTAS_MEJORAS_FRONTEND.md → backend/app/models/agent.py
- `C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`)` --references--> `Alert`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/alert.py

## Import Cycles
- None detected.

## Communities (93 total, 23 thin omitted)

### Community 0 - "Alert"
Cohesion: 0.11
Nodes (14): 6. Diagnóstico de la Suite de Pruebas (`backend/tests/`), 9. Granularidad de Máquinas de Estado (`ExecutionStatus`, `AlertStatus`, `Tool.status`) y Protocolos (`ADR-003`), Alert, AlertSeverity, AlertStatus, clear_database(), seed_data(), test_get_alert_by_id_found() (+6 more)

### Community 1 - "AgentGuardApiClient"
Cohesion: 0.11
Nodes (5): 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), ✅ Paso 4: Correcciones Críticas y Alma Máter en Frontend (Completado), AgentGuardApiClient, Agent, Policy

### Community 2 - "AgentTool"
Cohesion: 0.06
Nodes (30): 2. Diagramas de Estados UML (Mermaid), A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`), 4. Las 7 Correcciones y Mejoras de la Versión 2.0, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, ❓ P1: *"¿Por qué la tabla `Execution` tiene tantas claves foráneas? ¿No genera dependencia acoplada?"*, ❓ P2: *"¿Por qué `delegator_user_id` es Nullable en `Execution`?"* (+22 more)

### Community 3 - "test_schemas.py"
Cohesion: 0.11
Nodes (9): ApprovalResolveRequest, OrganizationCreate, PolicyCreate, PolicyRuleCreate, test_alert_schema(), test_approval_resolve_schema(), test_organization_schemas(), test_policy_and_policy_rule_schemas_fail_closed() (+1 more)

### Community 4 - "get_db"
Cohesion: 0.11
Nodes (9): get_db(), test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create(), test_policy_service_get_by_id() (+1 more)

### Community 5 - "asyncio"
Cohesion: 0.14
Nodes (6): test_api_create_tool_organization_not_found(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id()

### Community 6 - "App.tsx"
Cohesion: 0.20
Nodes (23): 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 4.2 Flujos Esenciales de la Propuesta de Valor que No Existen Aún, 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 3.2 Cuellos de Botella en Frontend (Renderizado, Red, Estado y Memoria), App(), getInitialView(), Header() (+15 more)

### Community 7 - "Policy"
Cohesion: 0.10
Nodes (7): create_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), PolicyUpdate, PolicyService

### Community 8 - "policy_rules.py"
Cohesion: 0.24
Nodes (3): create_policy_rule(), get_policy_rule(), list_policy_rules()

### Community 9 - "api.ts"
Cohesion: 0.28
Nodes (9): api, DEMO_IDS, GatewayExecutionPayload, GatewayExecutionResult, UseAgentGuardWebSocketOptions, WebSocketEventMessage, ExecutionTrace, PolicyDecision (+1 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.06
Nodes (30): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/node, @types/react (+22 more)

### Community 11 - "test_gateway_api.py"
Cohesion: 0.10
Nodes (8): execute_gateway_action(), get_attack_catalog(), GatewayExecuteResponse, test_gateway_execute_endpoint_allow(), test_gateway_execute_endpoint_deny(), test_gateway_execute_endpoint_require_approval(), test_gateway_execute_validation_error(), test_gateway_schemas()

### Community 12 - "organizations.py"
Cohesion: 0.23
Nodes (3): create_organization(), get_organization(), list_organizations()

### Community 13 - "enums.py"
Cohesion: 0.08
Nodes (13): RuleEffect, ToolStatus, Policy, PolicyRule, test_api_create_policy_rule_policy_not_found(), test_api_create_policy_rule_success(), test_api_create_policy_rule_target_agent_different_org(), test_api_get_policy_rule_found() (+5 more)

### Community 14 - "🛡️ Reglas de Proyecto: AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.12
Nodes (16): 10.1 Comandos de Arranque y Parada Oficiales, 10.2 Secuencia Estricta de Inicialización, 10. Orquestación y Arranque Secuencial Local (`start_all` / `start-all.ps1`), 11. Protocolo Anti-Interrupciones y Estabilidad de Sesión (Anti "Worker User Agent Cancelled"), 1.1 Stack Tecnológico y Tooling Oficial (Arquitectura Políglota), 1. Identidad y Configuración General, 2. Equipo de Desarrollo y Distribución de Roles, 3.1 Fases Estrictas y Progresivas del Proyecto (+8 more)

### Community 15 - "ToolService"
Cohesion: 0.10
Nodes (6): 2.1 Fallos `sqlalchemy.exc.MissingGreenlet` por Lazy-Loading Implícito tras `db.refresh()`, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`), 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución, ToolUpdate, PolicyRuleService, ToolService

### Community 16 - "main.py"
Cohesion: 0.15
Nodes (5): check_database_health(), check_redis_health(), health_check(), ping(), root()

### Community 17 - "datetime"
Cohesion: 0.08
Nodes (13): Base, ApiKey, Organization, test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations() (+5 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 20 - "uuid"
Cohesion: 0.10
Nodes (20): UserRole, User, UserCreate, UserUpdate, test_user_schemas(), test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success() (+12 more)

### Community 21 - "PDPEngine"
Cohesion: 0.11
Nodes (8): PDPEngine, test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric(), test_pdp_evaluate_allow(), test_pdp_evaluate_deny_fail_closed(), test_pdp_evaluate_priority_tie_deny_wins(), test_pdp_evaluate_require_approval()

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "scripts"
Cohesion: 0.11
Nodes (17): description, engines, node, name, packageManager, private, scripts, build:frontend (+9 more)

### Community 24 - "demo_agent.py"
Cohesion: 0.07
Nodes (13): display_execution_details(), display_final_summary(), display_scenario_header(), execute_single_scenario(), format_decision_badge(), main(), print_banner(), ScenarioDefinition (+5 more)

### Community 25 - "approvals.py"
Cohesion: 0.24
Nodes (4): get_approval(), list_approvals(), resolve_approval(), ApprovalDetailRead

### Community 26 - "typing"
Cohesion: 0.13
Nodes (4): downgrade(), upgrade(), downgrade(), upgrade()

### Community 28 - "WebSocketConnectionManager"
Cohesion: 0.12
Nodes (6): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "UserRole"
Cohesion: 0.16
Nodes (6): create_user(), delete_user(), get_user(), list_users(), update_user(), UserRead

### Community 30 - "🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard)"
Cohesion: 0.33
Nodes (5): Comandos Oficiales:, 🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard), Parada Limpia:, 🚨 Regla Innegociable para Agentes de IA (Anti "Worker User Agent Cancelled"):, Secuencia que ejecuta el orquestador:

### Community 31 - "tools.py"
Cohesion: 0.16
Nodes (5): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool()

### Community 32 - "BaseSchema"
Cohesion: 0.09
Nodes (13): AlertUpdateRequest, ApprovalRead, AuditEventCreate, AuditEventRead, BaseSchema, ExecutionRead, OrganizationRead, PolicyRead (+5 more)

### Community 33 - "📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa"
Cohesion: 0.11
Nodes (15): 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa, 🧭 Diagrama de Flujo de los 8 Pasos Atómicos, 📦 Historial de Commits Atómicos (Semana 2), 🎯 Objetivo de la Semana 2, 🏗️ Resumen de Capas Implementadas, 🛡️ Certificación de los 4 Escenarios de la Demo ante el Tribunal, 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP), 📊 Matriz de Entregables y Estado Final (+7 more)

### Community 35 - "agents.py"
Cohesion: 0.10
Nodes (14): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), remove_agent_tool(), update_agent() (+6 more)

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime"
Cohesion: 0.22
Nodes (8): 1. Importancia del Modelado de Estados en Arquitecturas Asíncronas, 3. Análisis Detallado de las Transiciones, 4. Principios de Robustez: Idempotencia y Prevención de Condiciones de Carrera, 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime, Máquina 1: Ejecución en Runtime, ❓ P1: *"¿Cómo hace el Gateway para mantener al agente esperando mientras el humano aprueba en la web sin agotar las conexiones del servidor?"*, ❓ P2: *"¿Por qué consideraron el estado `EXPIRED` en lugar de dejar que la aprobación espere indefinidamente?"*

### Community 38 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.07
Nodes (27): 1. Contexto y Problema, 1. Contexto y Problema, 1. Contexto y Problema, 1. Contexto y Problema, 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada (+19 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0"
Cohesion: 0.25
Nodes (8): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid), 3. Decisiones Arquitectónicas y Justificación Técnica, A. Estrategia Multi-Tenant: Base de Datos Compartida con Discriminador de Tenant, B. Uso de UUID v4 como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` vs. Normalización Extrema, D. Sanitización y Privacidad del `request_context`, 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0

### Community 47 - "Tool"
Cohesion: 0.14
Nodes (20): Agent, AgentStatus, ApprovalStatus, PolicyDecision, RiskLevel, Tool, ToolAction, GatewayExecuteRequest (+12 more)

### Community 48 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.17
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 49 - "AuthContext.tsx"
Cohesion: 0.28
Nodes (6): AuthContext, AuthContextType, AuthUser, DEMO_PROFILES, UserMember, UserRole

### Community 50 - "🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP"
Cohesion: 0.20
Nodes (9): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime y Flujo de Intercepción (Mermaid), 3. Los Dos Componentes Clave: PEP y PDP (Estándar XACML / RFC 2904), 4. Manejo de Latencia y Rendimiento en la Ruta Crítica, 5. Preguntas Difíciles del Profesor y Respuestas Magistrales, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Por qué dicen que esto no es simplemente un API Gateway como Kong o Nginx?"*, ❓ P2: *"¿Dónde está la Inteligencia Artificial si el backend es determinista?"* (+1 more)

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia de la Demo (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. El Cierre Magistral: El "Execution Trace", Escenario 1: Operación Normal (`ALLOW`), Escenario 2: Intento de Abuso de Privilegio (`DENY`), Escenario 3: Operación de Alto Impacto con Intervención Humana (`REQUIRE_APPROVAL`), Escenario 4: Ataque de Prompt Injection y Alerta Crítica (`DENY + ALERT`) (+1 more)

### Community 52 - "test_tool_actions.py"
Cohesion: 0.12
Nodes (10): test_api_create_tool_action_duplicate_conflict(), test_api_create_tool_action_success(), test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions(), test_tool_action_service_create(), test_tool_action_service_get_by_id() (+2 more)

### Community 53 - "PolicyCache"
Cohesion: 0.15
Nodes (8): 07 — Registro Formal de Decisiones de Arquitectura y Plan de Ejecución, 2. Plan Secuencial Atómico de Implementación, 3. Estado de Avance y Verificación Continua, ✅ Paso 1: Higiene y Limpieza de Código Muerto (Completado), ✅ Paso 5: Implementación de `agent-demo/` en Python 3.12+ (Completado), ✅ Paso 6: Sincronización Documental y Suite de Verificación Final (Completado), ✅ Pasos 2 y 3: Correcciones Críticas de Backend, Bóveda Redis y PDP (Completado), PolicyCache

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.13
Nodes (14): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 3. Análisis Semántico de las Relaciones y Cardinalidades, 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$) (+6 more)

### Community 56 - "domain.ts"
Cohesion: 0.16
Nodes (14): mockAgents, mockAlerts, mockApprovals, mockPolicies, mockTools, AgentStatus, ApprovalRequest, ApprovalStatus (+6 more)

### Community 58 - "asyncio"
Cohesion: 0.13
Nodes (9): test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_assign_tool_to_agent_success(), test_api_create_agent_owner_different_org(), test_api_create_agent_success() (+1 more)

### Community 59 - "06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas"
Cohesion: 0.12
Nodes (15): 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 0. Diagnóstico del Acoplamiento Actual (Estado *As-Is*), 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean), 1.2 Árbol de Directorios Objetivo — Backend (`backend/`), 1.3 Árbol de Directorios Objetivo — Frontend (`frontend/src/`), 1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back), 2.2 *Specification / Strategy Registry* para Operadores del Motor PDP, 2.3 *Claim-Check Pattern* Cifrado para HITL (`HitlPayloadVault`) (+7 more)

### Community 60 - "react"
Cohesion: 0.28
Nodes (9): HeaderProps, ResetDemoModal(), ResetDemoModalProps, Theme, ThemeContext, ThemeContextType, useTheme(), lucide-react (+1 more)

### Community 61 - "05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario"
Cohesion: 0.15
Nodes (12): 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario, 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP, 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway), 2. Destino de la Tabla `audit_events` (Auditoría Administrativa — Regla 7 de `AGENTS.md`), 3. Contradicción WORM Inmutable vs. Purga Automática de Trazas (30 a 365 días), 4. Protocolo de Espera y Entrega de Resultados en HITL (`REQUIRE_APPROVAL`), 5. Custodia de Parámetros Originales para Re-Despacho HITL (Problema `"***REDACTED***"`), 6. Política de Despacho a Herramientas Externas (`_dispatch_to_tool`: Sandbox Mock vs. REST Real) (+4 more)

### Community 63 - "🤖 AgentGuard — Cliente Agéntico Autónomo de Demostración (CLI)"
Cohesion: 0.18
Nodes (10): 1. Ejecutar los 5 Escenarios en Secuencia (Modo Presentación), 2. Ejecutar un Escenario Individual, 🤖 AgentGuard — Cliente Agéntico Autónomo de Demostración (CLI), 🚀 Comandos de Ejecución, 📦 Instalación de Dependencias, 🖥️ Interacción con el Frontend Dashboard, 🔬 Matriz de Escenarios Canónicos Evaluados, 📋 Parámetros de Configuración CLI (+2 more)

### Community 64 - "CLAUDE.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 66 - "copilot-instructions.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 67 - "SanitizerService"
Cohesion: 0.07
Nodes (11): 4.1 Ausencia Total de Autenticación y Control de Acceso (RBAC) en APIs, 4.2 Fugas de Aislamiento Multi-Tenant (Violación de Regla 2 de `AGENTS.md`), 4.3 Condición de Carrera TOCTOU y Expiración Pasiva en Aprobaciones HITL, 4.4 Defectos en `SanitizerService` y Configuraciones Ignoradas, 4. Brechas de Seguridad, Multi-Tenancy y Reglas de Dominio (`AGENTS.md` §4), SanitizerService, test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking() (+3 more)

### Community 70 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.09
Nodes (23): 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2), 3. Ejecutar las Migraciones de Base de Datos (Paso 3), 4. Iniciar el Servidor de Desarrollo (Paso 4), 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial, 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué, 🧭 Diagrama de Flujo de los 4 Pasos, 🛠️ Guía Rápida de Comandos para Ejecutar la Semana 1 (+15 more)

### Community 72 - "list_alerts"
Cohesion: 0.24
Nodes (4): get_alert_by_id(), list_alerts(), update_alert_status(), AlertRead

### Community 73 - "AuditEvent"
Cohesion: 0.27
Nodes (4): AuditEvent, ActorType, test_api_list_audit_events(), test_audit_service_record_event()

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.15
Nodes (13): 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents, 🚀 Arranque Rápido con un Solo Clic (Quickstart Local), 🏛️ Contexto Institucional y Equipo, 🖥️ Cómo Visualizar y Editar los Diagramas, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles (+5 more)

### Community 77 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 78 - "ExecutionStatus"
Cohesion: 0.16
Nodes (9): 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`), 1. Resumen Ejecutivo de Divergencia Arquitectónica, 2. Matriz Maestra de Inconsistencias (Documentación vs. Código Real), 3. Análisis Específico de Contradicciones Internas en la Documentación, get_execution_by_id(), list_executions(), _to_execution_response(), ExecutionStatus (+1 more)

### Community 79 - "PlaygroundView.tsx"
Cohesion: 0.24
Nodes (8): SidebarProps, NavView, OverviewViewProps, ATTACK_VECTORS, AttackVectorOption, PlaygroundViewProps, SimulationDecision, SimulationResult

### Community 80 - "3. Hallazgos Críticos y Bugs Funcionales en el Frontend"
Cohesion: 0.18
Nodes (10): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.3 Pérdida de Datos Reales en el Mapeo DTO -> Dominio (`api.ts`), 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos, 3.6 Defectos de CSS, Tematización y Clases Inexistentes, 3. Hallazgos Críticos y Bugs Funcionales en el Frontend (+2 more)

### Community 81 - "test_approvals_get_by_id_success"
Cohesion: 0.21
Nodes (5): test_approvals_get_by_id_not_found(), test_approvals_get_by_id_success(), test_approvals_list_endpoint(), test_approvals_resolve_already_resolved_or_not_found(), test_approvals_resolve_success()

### Community 82 - "test_health.py"
Cohesion: 0.28
Nodes (3): test_health_endpoint(), test_ping_endpoint(), test_root_endpoint()

### Community 83 - "04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos"
Cohesion: 0.18
Nodes (10): 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos, 1. Resumen Cuantitativo de Higiene del Repositorio, 2. Archivos Huérfanos Trackeados en Git (Candidatos a Eliminación Directa), 3. Archivos Duplicados y Exportaciones Redundantes en Raíz, 5.1 Paquetes Python sin Uso en [backend/requirements.txt](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/requirements.txt), 5.2 Scripts Rotos o Redundantes en [package.json](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/package.json) (Raíz), 5. Dependencias Huérfanas y Scripts de Monorepo Rotos, 6.1 Solapamiento entre 8 Archivos de Instrucciones para Agentes de IA (+2 more)

### Community 85 - "create_tool_action"
Cohesion: 0.24
Nodes (3): create_tool_action(), get_tool_action(), list_tool_actions()

### Community 89 - "4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo"
Cohesion: 0.29
Nodes (6): 4.1 Tipos, Esquemas y Configuraciones con `0` Consumidores, 4.2 Par Endpoint + Método Cliente Nunca Invocado (`Attack Catalog`), 4.3 Dataset de Prototipo Heredado que Contamina Datos Reales (`mockData.ts`), 4.4 Modelo ORM y Tabla Huérfana Sujetos a Decisión de Producto (`AuditEvent`), 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo, SecurityStanceSettings

### Community 90 - "test_threat_detector.py"
Cohesion: 0.12
Nodes (7): test_api_get_attack_catalog(), test_threat_detector_base64_obfuscation(), test_threat_detector_clean_parameters(), test_threat_detector_data_exfiltration(), test_threat_detector_destructive_sql(), test_threat_detector_embedded_base64_obfuscation(), test_threat_detector_goal_hijacking()

### Community 91 - "Bloque D — Experiencia de Frontend, Simulación y Demo Académica"
Cohesion: 0.50
Nodes (4): 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`), 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`, 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz, Bloque D — Experiencia de Frontend, Simulación y Demo Académica

## Knowledge Gaps
- **5 isolated node(s):** `@types/node`, `@types/react`, `@types/react-dom`, `oxlint`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 781 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentTool` connect `AgentTool` to `Alert`, `📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa`, `asyncio`, `test_threat_detector.py`, `App.tsx`, `🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard`, `enums.py`, `🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)`, `Tool`, `ToolService`, `datetime`, `AgentService`, `📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos`, `typing`, `06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas`, `🤖 AgentGuard — Cliente Agéntico Autónomo de Demostración (CLI)`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Are the 33 inferred relationships involving `ToolAction` (e.g. with `4. Las 7 Correcciones y Mejoras de la Versión 2.0` and `4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core)`) actually correct?**
  _`ToolAction` has 33 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/node`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Alert` be split into smaller, more focused modules?**
  _Cohesion score 0.11397849462365592 - nodes in this community are weakly interconnected._
- **Why does `ExecutionStatus` connect `ExecutionStatus` to `Alert`, `AgentGuardApiClient`, `AgentTool`, `BaseSchema`, `test_schemas.py`, `test_threat_detector.py`, `test_gateway_api.py`, `enums.py`, `Tool`, `test_approvals_get_by_id_success`, `test_executions.py`, `typing`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 27 inferred relationships involving `Tool` (e.g. with `ToolStatus` and `PEPGatewayService`) actually correct?**
  _`Tool` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Should `AgentGuardApiClient` be split into smaller, more focused modules?**
  _Cohesion score 0.11396011396011396 - nodes in this community are weakly interconnected._