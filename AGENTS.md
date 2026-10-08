# 🛡️ Reglas de Proyecto: AgentGuard — Runtime Authorization & Governance for AI Agents

## 1. Identidad y Configuración General
- **Proyecto:** `AgentGuard`
- **Dominio:** Plataforma SaaS multi-tenant de autorización contextual, gobernanza y observabilidad en tiempo de ejecución para agentes de Inteligencia Artificial conectados a herramientas y APIs empresariales.
- **Premisa Central:** «IAM responde quién eres; AgentGuard decide qué puedes hacer ahora».
- **Contexto Institucional y Académico:** Cátedra de Desarrollo Web (5to Semestre), Tecnicatura Universitaria en Desarrollo de Software, Instituto Tecnológico Universitario (ITU) — Universidad Nacional de Cuyo (2026).
- **Repositorio Remoto:** `https://github.com/jmbatiatto/AgentGuard.git` (rama principal: `main`).
- **Directorio de Trabajo Oficial:** `C:\Users\jonat\Downloads\Codigos\AgentGuard`

---

## 2. Equipo de Desarrollo y Distribución de Roles
El proyecto es desarrollado por un equipo de cuatro desarrolladores. Toda tarea ejecutada por cualquier agente de IA debe respetar estrictamente esta asignación de responsabilidades:

| Integrante | Rol Oficial | Áreas de Responsabilidad Principal |
| :--- | :--- | :--- |
| **Agustín Belardinelli** | Product Owner & Backend Core | Definición del alcance, visión funcional del producto, historias de usuario, motor PDP de evaluación de políticas y lógica de negocio. |
| **Juan Martín Battiato** | Scrum Master & Frontend Core | Facilitación ágil, seguimiento de sprints, dashboard web de auditoría, panel de control de agentes y bandeja de aprobaciones reactivas en vivo. |
| **Mateo Ortega** | Diseñador UI/UX & Frontend | Diseño visual de la interfaz, mockups y wireframes, componentes de diseño interactivos y experiencia de usuario del dashboard. |
| **Jonathan Araujo** | Backend Architecture & Gateway | Arquitectura del API Gateway (PEP), interceptor de llamadas a herramientas vía API REST, capa de persistencia (PostgreSQL/Redis), integración y suite de pruebas. |

> [!IMPORTANT]
> ### 🚨 Regla de Convivencia para Agentes de IA (Anti "Over-coding" / Anti Descontrol)
> Cuando cualquier integrante del equipo clone este repositorio en su entorno local y su agente de IA (Antigravity, Cursor, Copilot, Claude Code, etc.) lea este archivo:
> 1. **ESTÁ ESTRICTAMENTE PROHIBIDO "codear a lo loco"** o generar decenas de archivos y scaffolding no solicitados de forma autónoma.
> 2. **NO tomar decisiones arquitectónicas unilaterales.**
> 3. **Seguir la metodología SDD:** Todo cambio de código debe estar precedido por una especificación o plan acotado, consultado y aprobado por el desarrollador a cargo.
> 4. **Avanzar en incrementos atómicos y testeables:** Cambios pequeños, verificables y de fácil revisión en equipo.

---

## 3. Metodología de Desarrollo: SDD (Spec-Driven Development)
Todo trabajo en este repositorio se rige bajo el principio de **Desarrollo Guiado por Especificaciones**:

### 3.1 Fases Estrictas y Progresivas del Proyecto
1. **Fase 0 (Completada): Visión del Producto y Propuesta Reformulada v2.0**
   - Documento oficial de propuesta validada: [`AgentGuard_Propuesta_Desarrollo_Web_v2.pdf`](./AgentGuard_Propuesta_Desarrollo_Web_v2.pdf).
   - Resumen ejecutivo del equipo: [`guia_simple_proyecto_agentguard.pdf`](./guia_simple_proyecto_agentguard.pdf) / [`guia_simple_proyecto_agentguard.md`](./guia_simple_proyecto_agentguard.md).
   - Marco teórico, benchmark de mercado (estudios CSA 2026) y modelo de amenazas (OWASP Top 10 for Agentic Applications 2026).

2. **Fase 1 (Completada): Suite de Especificación Arquitectónica y Modelado Formal**
   - La arquitectura del sistema está completamente formalizada en los 6 diagramas vectoriales Draw.io y sus guías de defensa técnica en Markdown ubicados en la raíz:
     - [`agentguard_mer_relacional.drawio`](./diagramas/agentguard_mer_relacional.drawio) & [`agentguard_mer_relacional.md`](./diagramas/agentguard_mer_relacional.md) — Modelo Relacional Lógico/Físico (PostgreSQL, 12 tablas, UUIDs, JSONB, aislamiento estricto por tenant).
     - [`agentguard_er_conceptual_chen.drawio`](./diagramas/agentguard_er_conceptual_chen.drawio) & [`agentguard_er_conceptual_chen.md`](./diagramas/agentguard_er_conceptual_chen.md) — Modelo Conceptual formal con notación Chen y biblioteca de atributos desacoplada.
     - [`agentguard_arquitectura_runtime.drawio`](./diagramas/agentguard_arquitectura_runtime.drawio) & [`agentguard_arquitectura_runtime.md`](./diagramas/agentguard_arquitectura_runtime.md) — Arquitectura Zero Trust (PEP / PDP), proxy HTTP REST y caché Redis.
     - [`agentguard_secuencia_demo.drawio`](./diagramas/agentguard_secuencia_demo.drawio) & [`agentguard_secuencia_demo.md`](./diagramas/agentguard_secuencia_demo.md) — Diagrama de Secuencia con los 4 escenarios de evaluación en tiempo real de la demo.
     - [`agentguard_estados_ciclo_vida.drawio`](./diagramas/agentguard_estados_ciclo_vida.drawio) & [`agentguard_estados_ciclo_vida.md`](./diagramas/agentguard_estados_ciclo_vida.md) — Máquinas de estados para ejecuciones asíncronas, cola de aprobaciones e incidentes.
     - [`agentguard_casos_de_uso.drawio`](./diagramas/agentguard_casos_de_uso.drawio) & [`agentguard_casos_de_uso.md`](./diagramas/agentguard_casos_de_uso.md) — Casos de uso UML con relaciones `<<include>>` y `<<extend>>`.

3. **Fase 2 (Próxima): Plan de Implementación a Largo Plazo y Contratos Técnicos**
   - Definición de estructura del proyecto / monorepo.
   - Contratos de APIs y esquemas de mensajes (OpenAPI / JSON REST).
   - Migraciones DDL iniciales para PostgreSQL y semillas de prueba (`seeds`).

4. **Fase 3+: Implementación Guiada Módulo a Módulo**
   - Gateway (PEP) & Interceptor de llamadas a herramientas.
   - Motor de Políticas (PDP) determinista con reglas JSONB.
   - Capa de Persistencia multi-tenant y auditoría.
   - Frontend: Dashboard web, vista de trazas y bandeja de aprobación humana (HITL).

---

## 4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core)
Cualquier fragmento de código o diseño implementado en este proyecto debe cumplir con estas reglas de dominio:

1. **Principio Fail-Closed (Denegación por Defecto):**
   - Si una regla no coincide, si hay ambigüedad, si el PDP está offline o ante empate de prioridades entre políticas, el sistema **SIEMPRE emite `DENY`**. Jamás permitir una acción por omisión o excepción no controlada.
2. **Aislamiento Multi-Tenant Estricto:**
   - Toda consulta o mutación de persistencia DEBE estar acotada por `organization_id`. Queda terminantemente prohibido filtrar datos o compartir identificadores entre organizaciones.
3. **Sanitización y Enmascaramiento de Contexto (Anti-Data Leaks):**
   - Cumpliendo con OWASP GenAI (LLM06 - Sensitive Information Disclosure), el gateway debe sanitizar y enmascarar tokens, credenciales, contraseñas y datos personales antes de almacenar el `request_context` en las trazas de ejecución.
4. **Desacoplamiento Agente ↔ Herramientas (N:N con `AgentTool`):**
   - Ningún agente puede invocar herramientas arbitrarias. Debe existir una relación explícita y activa en `AgentTool` con su configuración individual (`config JSONB`).
5. **Granularidad Fina de Acción (`ToolAction` y Niveles de Riesgo):**
   - La autorización no se evalúa a nivel genérico de herramienta, sino a nivel de acción atómica (`tool_action_id`) tipificada con su `risk_level` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
6. **Bandeja de Aprobación Humana (HITL - Human-in-the-Loop):**
   - Toda solicitud que resulte en `REQUIRE_APPROVAL` debe pasar a estado `PENDING` en la tabla `approvals` y quedar a la espera de resolución explícita por un usuario con rol `APPROVER`. Debe contar con expiración automática (`EXPIRED`).
7. **Trazabilidad Forense Inmutable:**
   - Cada decisión de autorización produce un registro inmutable en `executions` (para runtime) y en `audit_events` (para operaciones administrativas). Queda prohibido alterar o eliminar trazas de auditoría.

---

## 5. Control de Versiones y Convención de Commits
1. **Idioma de Commits:**
   - **Exclusivamente en Español**, con formato convencional y descriptivo:
     - `feat: ...` (nuevas funcionalidades o módulos)
     - `fix: ...` (corrección de errores o fallos detectados)
     - `test: ...` (pruebas unitarias, de integración o regresión)
     - `docs: ...` (documentación, guías y diagramas)
     - `chore: ...` (mantenimiento, tooling, dependencias, configuración de entorno)
     - `refactor: ...` (reorganización o mejoras de código sin alterar comportamiento)
2. **Atomicidad:**
   - Commits pequeños, precisos y acotados a una sola tarea o módulo. Prohibido acumular cambios dispersos o no relacionados en un único commit masivo.

---

## 6. Calidad de Software, Testing y Regresión Continua
1. **Testing Obligatorio de Componentes:**
   - Ningún endpoint del Gateway, función de evaluación del PDP ni consulta de base de datos se da por finalizado sin sus correspondientes pruebas automatizadas.
2. **Suite de Regresión sobre los 4 Escenarios Clave de la Demo:**
   - El sistema debe validar permanentemente en pruebas automatizadas los 4 flujos de la demo:
     - **Escenario 1 (ALLOW):** Acción legítima permitida dentro de umbrales normales (ej. `create_quote`).
     - **Escenario 2 (DENY):** Acción no autorizada / abuso de privilegio bloqueado deterministamente (ej. `update_price`).
     - **Escenario 3 (REQUIRE_APPROVAL):** Acción sensible que suspende ejecución y espera aprobación humana (ej. `refund`).
     - **Escenario 4 (DENY + ALERT):** Intento de violación o inyección de prompt detectada que bloquea y dispara alerta de seguridad (ej. `export_customers`).
3. **Política Zero-Regression:**
   - Todo commit correctivo (`fix:`) debe incorporar obligatoriamente una prueba que reproduzca el error para certificar que no vuelva a ocurrir.

---

## 7. Persistencia y Base de Datos (PostgreSQL)
1. **Identificadores Descentralizados:**
   - Claves primarias obligatorias basadas en **UUID v4** para prevenir ataques IDOR (*Insecure Direct Object References*) y permitir generación descentralizada por parte de servicios o gateways.
2. **Migraciones Versionadas y Semillas (`seed`):**
   - El esquema debe gestionarse mediante migraciones versionadas y reproducibles.
   - Proveer scripts de `seed` con datos controlados de prueba (organizaciones de demostración, usuarios con roles, agentes simulados, herramientas y reglas base).
3. **Uso Estratégico de JSONB:**
   - Los campos semiestructurados (`conditions`, `request_context`, `config`, `metadata`) deben aprovechar índices GIN en PostgreSQL para consultas veloces sin sacrificar la rigidez relacional.

---

## 8. Variables de Entorno y Configuración Fail-Fast
1. **Validación Temprana:**
   - Validar variables de entorno críticas en el arranque del servidor. Si falta una variable requerida (ej. conexión a PostgreSQL, claves de cifrado), el proceso debe detenerse de inmediato (*fail-fast*) con un mensaje descriptivo.
2. **Sincronización de `.env.example`:**
   - Cada nueva variable requerida debe reflejarse en `.env.example` con comentarios claros y sin valores confidenciales.
