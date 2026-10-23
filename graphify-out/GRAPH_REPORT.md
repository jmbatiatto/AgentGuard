# Graph Report - AgentGuard  (2026-10-23)

## Corpus Check
- 130 files · ~82,170 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .drawio 6, .bat 5, (none) 2)

## Summary
- 1288 nodes · 3281 edges · 71 communities (54 shown, 17 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 465 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7d129e50`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- list_alerts
- App.tsx
- PolicyService
- generate_diagrams.py
- services/__init__.py
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- BaseSchema
- asyncio
- AgentTool
- frontend/package.json
- ExecutionStatus
- 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué
- pytest
- 🛡️ Reglas de Proyecto: AgentGuard — Runtime Authorization & Governance for AI Agents
- typing
- ToolService
- asyncio
- test_tools.py
- compilerOptions
- test_users.py
- PolicyDecision
- compilerOptions
- scripts
- test_seed_data_fresh_creation
- database.py
- backend/scripts/seed_demo.py
- 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa
- WebSocketConnectionManager
- test_policies.py
- 🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard)
- tools.py
- PolicyRule
- 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa
- test_schemas.py
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0
- test_agents.py
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP
- 3. Los 4 Escenarios Demostrables Paso a Paso
- test_tool_actions.py
- sanitizer_service.py
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- env.py
- ADR-001: Arquitectura Políglota — Backend en Python (FastAPI) y Frontend en TypeScript (React)
- downgrade
- main.py
- test_approvals_get_by_id_success
- agent-demo/README.md
- CLAUDE.md
- frontend/README.md
- copilot-instructions.md
- httpx
- Tool
- Settings
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- 3. Análisis Semántico de las Relaciones y Cardinalidades

## God Nodes (most connected - your core abstractions)
1. `Tool` - 49 edges
2. `ToolAction` - 49 edges
3. `PolicyDecision` - 45 edges
4. `Agent` - 43 edges
5. `BaseSchema` - 42 edges
6. `Organization` - 38 edges
7. `Execution` - 37 edges
8. `PolicyRule` - 37 edges
9. `AgentTool` - 36 edges
10. `RiskLevel` - 36 edges

## Surprising Connections (you probably didn't know these)
- `❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*` --references--> `AgentTool`  [INFERRED]
  agentguard_er_conceptual_chen.md → backend/app/models/agent.py
- `C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`)` --references--> `Alert`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/alert.py
- `5. Especificación Detallada del Caso de Uso Crítico: UC05` --references--> `Approval`  [INFERRED]
  agentguard_casos_de_uso.md → backend/app/models/approval.py
- `B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval`)` --references--> `Approval`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/approval.py
- `A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution`)` --references--> `Execution`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/execution.py

## Import Cycles
- None detected.

## Communities (71 total, 17 thin omitted)

### Community 0 - "list_alerts"
Cohesion: 0.27
Nodes (3): get_alert_by_id(), list_alerts(), update_alert_status()

### Community 1 - "App.tsx"
Cohesion: 0.06
Nodes (52): App(), getInitialView(), Header(), HeaderProps, Sidebar(), SidebarProps, Theme, ThemeContext (+44 more)

### Community 3 - "generate_diagrams.py"
Cohesion: 0.19
Nodes (5): root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 4 - "services/__init__.py"
Cohesion: 0.10
Nodes (6): create_organization(), get_organization(), list_organizations(), OrganizationCreate, OrganizationRead, OrganizationService

### Community 5 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.20
Nodes (10): 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2), 3. Ejecutar las Migraciones de Base de Datos (Paso 3), 4. Iniciar el Servidor de Desarrollo (Paso 4), 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial, 🧭 Diagrama de Flujo de los 4 Pasos, 🛠️ Guía Rápida de Comandos para Ejecutar la Semana 1, 📊 Matriz Resumen de Tecnologías y Roles para la Defensa (+2 more)

### Community 6 - "BaseSchema"
Cohesion: 0.09
Nodes (11): get_approval(), list_approvals(), resolve_approval(), AlertRead, AlertUpdateRequest, ApprovalDetailRead, ApprovalRead, ApprovalResolveRequest (+3 more)

### Community 7 - "asyncio"
Cohesion: 0.14
Nodes (8): test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create(), test_policy_service_get_by_id(), test_policy_service_list_by_org()

### Community 9 - "AgentTool"
Cohesion: 0.13
Nodes (13): 4. Las 7 Correcciones y Mejoras de la Versión 2.0, AgentTool, Alert, AlertSeverity, AlertStatus, test_get_alert_by_id_found(), test_get_alert_by_id_not_found(), test_list_alerts_endpoint() (+5 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.07
Nodes (29): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/node, @types/react (+21 more)

### Community 11 - "ExecutionStatus"
Cohesion: 0.13
Nodes (9): ExecutionStatus, GatewayExecuteResponse, test_get_execution_by_id_not_found(), test_list_executions_endpoint(), test_gateway_execute_endpoint_allow(), test_gateway_execute_endpoint_deny(), test_gateway_execute_endpoint_require_approval(), test_gateway_execute_validation_error() (+1 more)

### Community 12 - "🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué"
Cohesion: 0.17
Nodes (11): lifespan(), 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué, 🧱 PASO 1: Infraestructura Local Reproducible (`docker-compose.yml`), 🐍 PASO 2: Entorno Backend & Configuración Fail-Fast (`backend/`), 🚀 PASO 4: Entrypoint FastAPI, Middlewares y Verificación (`backend/app/main.py`), ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Por qué es necesaria cada tecnología y qué rol cumple? (+3 more)

### Community 13 - "pytest"
Cohesion: 0.29
Nodes (3): test_approval_resolve_schema(), test_organization_schemas(), test_policy_and_policy_rule_schemas_fail_closed()

### Community 14 - "🛡️ Reglas de Proyecto: AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.14
Nodes (14): 10.1 Comandos de Arranque y Parada Oficiales, 10.2 Secuencia Estricta de Inicialización, 10. Orquestación y Arranque Secuencial Local (`start_all` / `start-all.ps1`), 2. Equipo de Desarrollo y Distribución de Roles, 3.1 Fases Estrictas y Progresivas del Proyecto, 3. Metodología de Desarrollo: SDD (Spec-Driven Development), 4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core), 5. Control de Versiones y Convención de Commits (+6 more)

### Community 15 - "typing"
Cohesion: 0.09
Nodes (9): create_tool_action(), get_tool_action(), list_tool_actions(), ToolActionCreate, ToolActionRead, ToolCreate, ToolUpdate, ToolActionService (+1 more)

### Community 17 - "asyncio"
Cohesion: 0.14
Nodes (8): test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create(), test_organization_service_get_by_id(), test_organization_service_list_all()

### Community 18 - "test_tools.py"
Cohesion: 0.10
Nodes (11): test_approvals_get_by_id_not_found(), test_approvals_list_endpoint(), test_approvals_resolve_already_resolved_or_not_found(), test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools() (+3 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 20 - "test_users.py"
Cohesion: 0.06
Nodes (18): create_user(), get_user(), list_users(), UserRole, UserCreate, UserRead, UserService, test_user_schemas() (+10 more)

### Community 21 - "PolicyDecision"
Cohesion: 0.06
Nodes (14): get_execution_by_id(), list_executions(), _to_execution_response(), execute_gateway_action(), PolicyDecision, ExecutionResponse, PDPDecisionResult, PDPEngine (+6 more)

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "scripts"
Cohesion: 0.10
Nodes (19): description, engines, node, name, packageManager, private, scripts, build:frontend (+11 more)

### Community 25 - "database.py"
Cohesion: 0.09
Nodes (6): create_policy_rule(), get_policy_rule(), list_policy_rules(), get_db(), PolicyRuleRead, PolicyRuleService

### Community 26 - "backend/scripts/seed_demo.py"
Cohesion: 0.17
Nodes (6): Base, AuditEvent, ActorType, Execution, Organization, User

### Community 27 - "📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa"
Cohesion: 0.33
Nodes (6): 🛡️ Cumplimiento de Reglas Innegociables del Dominio, 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa, 🧭 Diagrama de Flujo de los 8 Pasos Atómicos, 📦 Historial de Commits Atómicos (Semana 2), 🎯 Objetivo de la Semana 2, 🏗️ Resumen de Capas Implementadas

### Community 28 - "WebSocketConnectionManager"
Cohesion: 0.08
Nodes (8): websocket_global_endpoint(), websocket_tenant_endpoint(), WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "test_policies.py"
Cohesion: 0.13
Nodes (8): create_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), PolicyCreate, PolicyRead, PolicyUpdate

### Community 30 - "🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard)"
Cohesion: 0.40
Nodes (4): Comandos Oficiales:, 🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard), Parada Limpia:, Secuencia que ejecuta el orquestador:

### Community 31 - "tools.py"
Cohesion: 0.16
Nodes (6): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool(), ToolRead

### Community 32 - "PolicyRule"
Cohesion: 0.10
Nodes (12): RuleEffect, Policy, PolicyRule, test_api_create_policy_rule_policy_not_found(), test_api_create_policy_rule_success(), test_api_create_policy_rule_target_agent_different_org(), test_api_get_policy_rule_found(), test_api_get_policy_rule_not_found() (+4 more)

### Community 33 - "📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa"
Cohesion: 0.25
Nodes (5): 🛡️ Certificación de los 4 Escenarios de la Demo ante el Tribunal, 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP), 📊 Matriz de Entregables y Estado Final, 🧪 Métricas de Calidad y Cobertura (Pytest), 🎯 Resumen Ejecutivo de Entrega de la Semana 3

### Community 35 - "test_schemas.py"
Cohesion: 0.09
Nodes (15): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentCreate (+7 more)

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime"
Cohesion: 0.15
Nodes (12): 1. Importancia del Modelado de Estados en Arquitecturas Asíncronas, 2. Diagramas de Estados UML (Mermaid), 3. Análisis Detallado de las Transiciones, 4. Principios de Robustez: Idempotencia y Prevención de Condiciones de Carrera, 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`) (+4 more)

### Community 38 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.14
Nodes (14): 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 2. Decisión Tomada, 2. Decisión Tomada, 2. Justificación Técnica, 3. Asignación por Paquete (+6 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0"
Cohesion: 0.17
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid), 3. Decisiones Arquitectónicas y Justificación Técnica, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Base de Datos Compartida con Discriminador de Tenant, B. Uso de UUID v4 como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` vs. Normalización Extrema, D. Sanitización y Privacidad del `request_context` (+4 more)

### Community 47 - "test_agents.py"
Cohesion: 0.14
Nodes (10): Agent, test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_assign_tool_to_agent_success(), test_api_create_agent_owner_different_org() (+2 more)

### Community 48 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.17
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 50 - "🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP"
Cohesion: 0.20
Nodes (9): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime y Flujo de Intercepción (Mermaid), 3. Los Dos Componentes Clave: PEP y PDP (Estándar XACML / RFC 2904), 4. Manejo de Latencia y Rendimiento en la Ruta Crítica, 5. Preguntas Difíciles del Profesor y Respuestas Magistrales, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Por qué dicen que esto no es simplemente un API Gateway como Kong o Nginx?"*, ❓ P2: *"¿Dónde está la Inteligencia Artificial si el backend es determinista?"* (+1 more)

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia de la Demo (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. El Cierre Magistral: El "Execution Trace", Escenario 1: Operación Normal (`ALLOW`), Escenario 2: Intento de Abuso de Privilegio (`DENY`), Escenario 3: Operación de Alto Impacto con Intervención Humana (`REQUIRE_APPROVAL`), Escenario 4: Ataque de Prompt Injection y Alerta Crítica (`DENY + ALERT`) (+1 more)

### Community 52 - "test_tool_actions.py"
Cohesion: 0.10
Nodes (17): RiskLevel, ToolAction, GatewayExecuteRequest, test_pep_execute_allow_flow(), test_pep_execute_critical_alert_generation(), test_pep_execute_deny_capability_abuse(), test_pep_execute_require_approval_flow(), test_api_create_tool_action_duplicate_conflict() (+9 more)

### Community 53 - "sanitizer_service.py"
Cohesion: 0.06
Nodes (14): SanitizerService, test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys(), add_markdown_to_docx(), build_docx_files() (+6 more)

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.25
Nodes (7): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos, ❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*, ❓ P2: *"¿Por qué la relación entre `EJECUCIÓN` y `APROBACIÓN` es `(0,1)` y no `(1,1)`?"*

### Community 55 - "env.py"
Cohesion: 0.20
Nodes (4): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 56 - "ADR-001: Arquitectura Políglota — Backend en Python (FastAPI) y Frontend en TypeScript (React)"
Cohesion: 0.50
Nodes (4): 1. Contexto y Problema, 2. Decisión Tomada, 3. Justificación Técnica, ADR-001: Arquitectura Políglota — Backend en Python (FastAPI) y Frontend en TypeScript (React)

### Community 59 - "downgrade"
Cohesion: 0.19
Nodes (14): 1.1 Stack Tecnológico y Tooling Oficial (Arquitectura Políglota), 1. Identidad y Configuración General, downgrade(), upgrade(), 🗄️ PASO 3: Modelos Declarativos y Versionado DDL con Alembic (`backend/alembic/`), ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Qué se hace concretamente?, ⚙️ AgentGuard — Backend (Python + FastAPI) (+6 more)

### Community 60 - "main.py"
Cohesion: 0.16
Nodes (4): check_database_health(), check_redis_health(), health_check(), ping()

### Community 62 - "test_approvals_get_by_id_success"
Cohesion: 0.13
Nodes (8): Approval, AgentStatus, ApprovalStatus, PEPGatewayService, 🎓 Conclusión y Próximos Pasos (Semana 4), test_approvals_get_by_id_success(), test_approvals_resolve_success(), test_demo_scenario_3_high_impact_require_approval_and_resolve()

### Community 64 - "CLAUDE.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 66 - "copilot-instructions.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 67 - "httpx"
Cohesion: 0.24
Nodes (3): test_health_endpoint(), test_ping_endpoint(), test_root_endpoint()

### Community 71 - "Tool"
Cohesion: 0.15
Nodes (4): Tool, clear_database(), main(), seed_data()

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.17
Nodes (12): 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents, 🚀 Arranque Rápido con un Solo Clic (Quickstart Local), 🏛️ Contexto Institucional y Equipo, 🖥️ Cómo Visualizar y Editar los Diagramas, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles (+4 more)

### Community 77 - "3. Análisis Semántico de las Relaciones y Cardinalidades"
Cohesion: 0.29
Nodes (7): 3. Análisis Semántico de las Relaciones y Cardinalidades, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$), D. Herramienta y Acción: `EXPONE`, E. Ejecución en Runtime: `SOLICITA` e `INVOCA`, F. Aprobación Humana: `REQUIERE_INTERVENCIÓN`

## Knowledge Gaps
- **5 isolated node(s):** `@types/node`, `@types/react`, `@types/react-dom`, `oxlint`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 634 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `🛡️ Reglas de Proyecto: AgentGuard — Runtime Authorization & Governance for AI Agents` connect `🛡️ Reglas de Proyecto: AgentGuard — Runtime Authorization & Governance for AI Agents` to `README.md`, `downgrade`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `Tool` (e.g. with `PEPGatewayService` and `ToolService`) actually correct?**
  _`Tool` has 24 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/node`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06163401815575729 - nodes in this community are weakly interconnected._
- **Why does `Reglas para Agentes de IA:` connect `🛡️ Reglas de Proyecto: AgentGuard — Runtime Authorization & Governance for AI Agents` to `App.tsx`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `ToolAction` (e.g. with `4. Las 7 Correcciones y Mejoras de la Versión 2.0` and `4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core)`) actually correct?**
  _`ToolAction` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Should `services/__init__.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09879032258064516 - nodes in this community are weakly interconnected._