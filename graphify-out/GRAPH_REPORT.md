# Graph Report - AgentGuard  (2026-10-22)

## Corpus Check
- 130 files · ~72,020 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .drawio 6, .bat 5, (none) 2)

## Summary
- 1231 nodes · 3147 edges · 73 communities (56 shown, 17 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 450 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1e0d0cce`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- list_alerts
- App.tsx
- Tool
- convert_docs_to_docx.py
- organizations.py
- users.py
- test_schemas.py
- asyncio
- enums.py
- frontend/package.json
- main.py
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- OrganizationCreate
- env.py
- create_tool_action
- ToolService
- asyncio
- test_tools.py
- compilerOptions
- uuid
- PDPEngine
- compilerOptions
- scripts
- policy_rules.py
- typing
- backend/scripts/seed_demo.py
- list_approvals
- test_websocket.py
- policies.py
- 🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard)
- tools.py
- PolicyRule
- 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa
- assign_tool_to_agent
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0
- ADR-002: Estructura Monorepo Políglota y Distribución Modular de Carpetas
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP
- 3. Los 4 Escenarios Demostrables Paso a Paso
- test_tool_actions.py
- sanitizer_service.py
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- ADR-005: Control de Versiones y Migraciones de Base de Datos con Alembic
- 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)
- test_approvals_get_by_id_success
- agent-demo/README.md
- CLAUDE.md
- frontend/README.md
- copilot-instructions.md
- test_health.py
- execute_gateway_action
- downgrade
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- 3. Análisis Semántico de las Relaciones y Cardinalidades
- 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)

## God Nodes (most connected - your core abstractions)
1. `Tool` - 47 edges
2. `ToolAction` - 47 edges
3. `PolicyDecision` - 45 edges
4. `Agent` - 42 edges
5. `BaseSchema` - 39 edges
6. `Organization` - 38 edges
7. `Execution` - 37 edges
8. `RiskLevel` - 36 edges
9. `AgentTool` - 34 edges
10. `ExecutionStatus` - 33 edges

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

## Communities (73 total, 17 thin omitted)

### Community 0 - "list_alerts"
Cohesion: 0.27
Nodes (3): get_alert_by_id(), list_alerts(), update_alert_status()

### Community 1 - "App.tsx"
Cohesion: 0.08
Nodes (50): App(), getInitialView(), Header(), HeaderProps, Sidebar(), SidebarProps, Theme, ThemeContext (+42 more)

### Community 2 - "Tool"
Cohesion: 0.11
Nodes (24): Agent, AgentTool, AgentStatus, ExecutionStatus, PolicyDecision, RiskLevel, Tool, ToolAction (+16 more)

### Community 3 - "convert_docs_to_docx.py"
Cohesion: 0.07
Nodes (17): check_database_health(), check_redis_health(), health_check(), ping(), root(), add_markdown_to_docx(), build_docx_files(), set_cell_background() (+9 more)

### Community 4 - "organizations.py"
Cohesion: 0.22
Nodes (3): create_organization(), get_organization(), list_organizations()

### Community 5 - "users.py"
Cohesion: 0.19
Nodes (5): create_user(), get_user(), list_users(), UserRead, test_user_schemas()

### Community 6 - "test_schemas.py"
Cohesion: 0.07
Nodes (18): AlertRead, AlertUpdateRequest, ApprovalDetailRead, ApprovalRead, ApprovalResolveRequest, BaseSchema, ExecutionRead, GatewayExecuteRequest (+10 more)

### Community 7 - "asyncio"
Cohesion: 0.20
Nodes (4): test_api_create_policy_organization_not_found(), test_api_get_policy_not_found(), test_policy_service_create(), test_policy_service_get_by_id()

### Community 9 - "enums.py"
Cohesion: 0.13
Nodes (9): Alert, AlertSeverity, AlertStatus, test_get_alert_by_id_found(), test_get_alert_by_id_not_found(), test_list_alerts_endpoint(), test_update_alert_status(), test_seed_data_already_exists_without_reset() (+1 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.07
Nodes (29): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/node, @types/react (+21 more)

### Community 11 - "main.py"
Cohesion: 0.11
Nodes (5): test_get_execution_by_id_not_found(), test_gateway_execute_endpoint_allow(), test_gateway_execute_endpoint_deny(), test_gateway_execute_endpoint_require_approval(), test_gateway_execute_validation_error()

### Community 12 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.08
Nodes (23): lifespan(), 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2), 3. Ejecutar las Migraciones de Base de Datos (Paso 3), 4. Iniciar el Servidor de Desarrollo (Paso 4), 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial, 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué, 🧭 Diagrama de Flujo de los 4 Pasos (+15 more)

### Community 13 - "OrganizationCreate"
Cohesion: 0.18
Nodes (3): OrganizationCreate, OrganizationService, test_organization_schemas()

### Community 14 - "env.py"
Cohesion: 0.05
Nodes (21): 10.1 Comandos de Arranque y Parada Oficiales, 10.2 Secuencia Estricta de Inicialización, 10. Orquestación y Arranque Secuencial Local (`start_all` / `start-all.ps1`), 1. Identidad y Configuración General, 2. Equipo de Desarrollo y Distribución de Roles, 3.1 Fases Estrictas y Progresivas del Proyecto, 3. Metodología de Desarrollo: SDD (Spec-Driven Development), 4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core) (+13 more)

### Community 15 - "create_tool_action"
Cohesion: 0.24
Nodes (3): create_tool_action(), get_tool_action(), list_tool_actions()

### Community 16 - "ToolService"
Cohesion: 0.16
Nodes (4): ToolActionCreate, ToolCreate, ToolService, test_tool_and_action_schemas()

### Community 17 - "asyncio"
Cohesion: 0.14
Nodes (6): test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create(), test_organization_service_get_by_id()

### Community 18 - "test_tools.py"
Cohesion: 0.14
Nodes (6): test_api_create_tool_organization_not_found(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_tool_service_create(), test_tool_service_get_by_id(), test_tool_service_list_by_org()

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 20 - "uuid"
Cohesion: 0.09
Nodes (19): UserRole, User, test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_assign_tool_to_agent_success(), test_api_create_agent_owner_different_org(), test_api_create_agent_success(), test_api_list_agent_tools() (+11 more)

### Community 21 - "PDPEngine"
Cohesion: 0.17
Nodes (4): PDPEngine, test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric()

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "scripts"
Cohesion: 0.10
Nodes (19): description, engines, node, name, packageManager, private, scripts, build:frontend (+11 more)

### Community 24 - "policy_rules.py"
Cohesion: 0.10
Nodes (7): create_policy_rule(), get_policy_rule(), list_policy_rules(), PolicyRuleCreate, PolicyRuleRead, PolicyRuleService, test_policy_and_policy_rule_schemas_fail_closed()

### Community 25 - "typing"
Cohesion: 0.10
Nodes (4): get_db(), PolicyService, ToolActionService, UserService

### Community 26 - "backend/scripts/seed_demo.py"
Cohesion: 0.10
Nodes (13): Base, AuditEvent, ActorType, Execution, Organization, Policy, test_api_create_organization_success(), test_organization_service_list_all() (+5 more)

### Community 27 - "list_approvals"
Cohesion: 0.27
Nodes (3): get_approval(), list_approvals(), resolve_approval()

### Community 28 - "test_websocket.py"
Cohesion: 0.06
Nodes (12): get_execution_by_id(), list_executions(), _to_execution_response(), websocket_global_endpoint(), websocket_tenant_endpoint(), WebSocketConnectionManager, ExecutionResponse, test_websocket_endpoint_ping_pong() (+4 more)

### Community 29 - "policies.py"
Cohesion: 0.24
Nodes (3): create_policy(), get_policy(), list_policies()

### Community 30 - "🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard)"
Cohesion: 0.40
Nodes (4): Comandos Oficiales:, 🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard), Parada Limpia:, Secuencia que ejecuta el orquestador:

### Community 31 - "tools.py"
Cohesion: 0.24
Nodes (3): create_tool(), get_tool(), list_tools()

### Community 32 - "PolicyRule"
Cohesion: 0.11
Nodes (14): RuleEffect, PolicyRule, test_pdp_evaluate_allow(), test_pdp_evaluate_deny_fail_closed(), test_pdp_evaluate_require_approval(), test_api_create_policy_rule_policy_not_found(), test_api_create_policy_rule_success(), test_api_create_policy_rule_target_agent_different_org() (+6 more)

### Community 33 - "📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa"
Cohesion: 0.33
Nodes (6): 🛡️ Cumplimiento de Reglas Innegociables del Dominio, 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa, 🧭 Diagrama de Flujo de los 8 Pasos Atómicos, 📦 Historial de Commits Atómicos (Semana 2), 🎯 Objetivo de la Semana 2, 🏗️ Resumen de Capas Implementadas

### Community 35 - "assign_tool_to_agent"
Cohesion: 0.07
Nodes (14): assign_tool_to_agent(), create_agent(), get_agent(), list_agent_tools(), list_agents(), AgentCreate, AgentRead, AgentToolCreate (+6 more)

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime"
Cohesion: 0.15
Nodes (12): 1. Importancia del Modelado de Estados en Arquitecturas Asíncronas, 2. Diagramas de Estados UML (Mermaid), 3. Análisis Detallado de las Transiciones, 4. Principios de Robustez: Idempotencia y Prevención de Condiciones de Carrera, 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`) (+4 more)

### Community 38 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.18
Nodes (11): 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 2. Decisión Tomada, 2. Justificación Técnica, 3. Justificación Técnica, ADR-001: Arquitectura Políglota — Backend en Python (FastAPI) y Frontend en TypeScript (React), ADR-003: Supresión de MCP y Estandarización en Protocolo HTTP REST Puro (+3 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0"
Cohesion: 0.17
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid), 3. Decisiones Arquitectónicas y Justificación Técnica, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Base de Datos Compartida con Discriminador de Tenant, B. Uso de UUID v4 como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` vs. Normalización Extrema, D. Sanitización y Privacidad del `request_context` (+4 more)

### Community 47 - "ADR-002: Estructura Monorepo Políglota y Distribución Modular de Carpetas"
Cohesion: 0.50
Nodes (4): 1. Contexto y Problema, 2. Decisión Tomada, 3. Asignación por Paquete, ADR-002: Estructura Monorepo Políglota y Distribución Modular de Carpetas

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
Cohesion: 0.13
Nodes (8): test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions(), test_tool_action_service_create(), test_tool_action_service_get_by_id(), test_tool_action_service_get_by_tool_and_name(), test_tool_action_service_list_actions()

### Community 53 - "sanitizer_service.py"
Cohesion: 0.09
Nodes (6): SanitizerService, test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.25
Nodes (7): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos, ❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*, ❓ P2: *"¿Por qué la relación entre `EJECUCIÓN` y `APROBACIÓN` es `(0,1)` y no `(1,1)`?"*

### Community 58 - "ADR-005: Control de Versiones y Migraciones de Base de Datos con Alembic"
Cohesion: 0.67
Nodes (3): 1. Contexto y Problema, 2. Decisión Tomada, ADR-005: Control de Versiones y Migraciones de Base de Datos con Alembic

### Community 59 - "🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)"
Cohesion: 0.25
Nodes (5): ⚙️ AgentGuard — Backend (Python + FastAPI), 🏗️ Arquitectura de la API REST, 📋 Especificaciones y Hitos de Desarrollo, 📁 Estructura del Código Fuente, 🗄️ Versionado de Base de Datos con Alembic

### Community 62 - "test_approvals_get_by_id_success"
Cohesion: 0.20
Nodes (8): 4. Las 7 Correcciones y Mejoras de la Versión 2.0, Approval, ApprovalStatus, test_approvals_get_by_id_not_found(), test_approvals_get_by_id_success(), test_approvals_list_endpoint(), test_approvals_resolve_already_resolved_or_not_found(), test_approvals_resolve_success()

### Community 64 - "CLAUDE.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 66 - "copilot-instructions.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 67 - "test_health.py"
Cohesion: 0.28
Nodes (3): test_health_endpoint(), test_ping_endpoint(), test_root_endpoint()

### Community 74 - "downgrade"
Cohesion: 0.53
Nodes (6): 1.1 Stack Tecnológico y Tooling Oficial (Arquitectura Políglota), downgrade(), upgrade(), ¿Qué se hace concretamente?, 3. Justificación Técnica, 💻 Stack Tecnológico Oficial (Arquitectura Políglota)

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.17
Nodes (12): 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents, 🚀 Arranque Rápido con un Solo Clic (Quickstart Local), 🏛️ Contexto Institucional y Equipo, 🖥️ Cómo Visualizar y Editar los Diagramas, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles (+4 more)

### Community 77 - "3. Análisis Semántico de las Relaciones y Cardinalidades"
Cohesion: 0.29
Nodes (7): 3. Análisis Semántico de las Relaciones y Cardinalidades, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$), D. Herramienta y Acción: `EXPONE`, E. Ejecución en Runtime: `SOLICITA` e `INVOCA`, F. Aprobación Humana: `REQUIERE_INTERVENCIÓN`

### Community 78 - "🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)"
Cohesion: 0.33
Nodes (6): 🛡️ Certificación de los 4 Escenarios de la Demo ante el Tribunal, 🎓 Conclusión y Próximos Pasos (Semana 4), 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP), 📊 Matriz de Entregables y Estado Final, 🧪 Métricas de Calidad y Cobertura (Pytest), 🎯 Resumen Ejecutivo de Entrega de la Semana 3

## Knowledge Gaps
- **5 isolated node(s):** `@types/node`, `@types/react`, `@types/react-dom`, `oxlint`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 599 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `🛡️ Reglas de Proyecto: AgentGuard — Runtime Authorization & Governance for AI Agents` connect `env.py` to `README.md`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `Tool` (e.g. with `PEPGatewayService` and `ToolService`) actually correct?**
  _`Tool` has 24 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/node`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0759493670886076 - nodes in this community are weakly interconnected._
- **Why does `Reglas para Agentes de IA:` connect `env.py` to `App.tsx`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Are the 27 inferred relationships involving `ToolAction` (e.g. with `4. Las 7 Correcciones y Mejoras de la Versión 2.0` and `4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core)`) actually correct?**
  _`ToolAction` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Should `Tool` be split into smaller, more focused modules?**
  _Cohesion score 0.11215538847117794 - nodes in this community are weakly interconnected._