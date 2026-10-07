# Especificación de Requisitos de Software (SRS) — AgentGuard
**Plataforma de Autorización Contextual y Gobernanza en Tiempo de Ejecución para Agentes de IA**  
*Versión 2.0 — Especificación Formal de Requisitos*  
*Código de Documento: AG-SRS-01*

---

## 1. Introducción y Alcance

Este documento especifica los requisitos funcionales (RF) y no funcionales (RNF) del sistema **AgentGuard**, derivados de la propuesta reformulada v2.0 y del Modelo Entidad-Relación (MER v2.0).

### 1.1 Objetivo del Sistema
Garantizar que toda acción ejecutada por un agente de inteligencia artificial sobre herramientas y servicios externos sea interceptada, evaluada contra políticas contextuales y auditada de forma determinista y segura, implementando mecanismos de bloqueo automático y de aprobación humana cuando la sensibilidad de la acción lo amerite.

### 1.2 Alcance del MVP (Prioridades MoSCoW)
- **P0 (Must Have)**: Multi-tenancy básico, registro de agentes y herramientas con acciones y niveles de riesgo, motor de políticas determinista (ALLOW/DENY/REQUIRE_APPROVAL), interceptor/gateway de runtime y generación de trazas de auditoría.
- **P1 (Should Have)**: Bandeja de aprobación humana (HITL), alertas de seguridad deterministas, simulación interactiva en Playground y adaptador MCP.
- **P2 (Could Have / Post-MVP)**: Detección de anomalías conductuales complejas (ML), integraciones SSO corporativas y plantillas automáticas de gobernanza.

---

## 2. Requisitos Funcionales (RF)

### Módulo 1: Identidad, Multi-Tenancy y Accesos

#### `RF-01`: Gestión de Organizaciones (Tenants) y Usuarios
- **Descripción**: El sistema debe soportar una arquitectura multi-tenant estricta donde cada organización posee sus propios usuarios, agentes, herramientas, políticas y auditorías completamente aislados.
- **Detalle de roles**:
  - `ADMIN`: Control total de la organización, gestión de usuarios, registro de agentes y herramientas, configuración de políticas globales.
  - `OPERATOR`: Monitoreo de trazas de ejecución, visualización de métricas, operación del Playground de simulación.
  - `APPROVER`: Autorizado para revisar, conceder o denegar solicitudes pendientes de aprobación humana (HITL).
- **Criterios de Aceptación**:
  - Ningún usuario de la organización $A$ puede listar, modificar o consultar recursos pertenecientes a la organización $B$.
  - Los correos electrónicos deben ser únicos en el sistema y estar vinculados a un `role` válido.

#### `RF-02`: Registro y Ciclo de Vida de Agentes de IA
- **Descripción**: El sistema debe permitir registrar la identidad de cada agente de IA, asociándolo a un usuario responsable (`owner_user_id`).
- **Atributos gestionados**: `id` (UUID), `name`, `purpose` (declaración de propósito funcional), `status` (`ACTIVE`, `SUSPENDED`, `REVOKED`), `created_at`.
- **Criterios de Aceptación**:
  - Si un agente se encuentra en estado `SUSPENDED` o `REVOKED`, el Runtime Gateway debe rechazar inmediatamente cualquier solicitud de acción con `DENY`, registrando un evento de seguridad.
  - El propósito (`purpose`) debe quedar registrado de forma explícita para cotejo de gobernanza y auditoría.

---

### Módulo 2: Registro de Herramientas y Acciones Granulares

#### `RF-03`: Registro de Herramientas Externas y Protocolos
- **Descripción**: El sistema debe mantener un catálogo de herramientas externas integrables, soportando inicialmente protocolos estándar como `MCP` (Model Context Protocol) y APIs `REST`.
- **Atributos de Herramienta**: `id` (UUID), `organization_id`, `name`, `protocol` (`MCP`, `REST`), `endpoint_url`, `description`.
- **Criterios de Aceptación**:
  - Cada herramienta pertenece a una única organización.
  - El sistema valida la URL de endpoint y almacena metadatos descriptivos para visualización en el dashboard.

#### `RF-04`: Definición de Acciones Atómicas y Niveles de Riesgo (`ToolAction`)
- **Descripción**: Cada herramienta debe descomponerse en acciones atómicas operativas, asignando a cada una un nivel de riesgo estandarizado.
- **Niveles de riesgo admitidos**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- **Criterios de Aceptación**:
  - La combinación de `(tool_id, action_name)` debe ser única.
  - Cada acción debe categorizarse en uno de los 4 niveles de riesgo para ser utilizada por las reglas de autorización y generación de alertas.

#### `RF-05`: Asignación de Herramientas a Agentes (`AgentTool` - N:N)
- **Descripción**: El sistema debe modelar explícitamente el acceso de los agentes a las herramientas mediante la entidad intermedia `AgentTool`.
- **Atributos**: `id`, `agent_id`, `tool_id`, `enabled` (booleano), `config` (JSONB para credenciales seguras o endpoints locales).
- **Criterios de Aceptación**:
  - Un agente solo puede solicitar acciones sobre herramientas que tenga asignadas con `enabled = true`. Cualquier llamada a una herramienta no asignada genera `DENY` por violación de mínimos privilegios (*Privilege Escalation attempt*).

---

### Módulo 3: Motor de Políticas de Autorización (Policy Decision Point)

#### `RF-06`: Configuración de Políticas y Reglas Jerárquicas
- **Descripción**: El sistema debe permitir definir políticas compuestas por múltiples reglas ordenadas por prioridad determinista.
- **Atributos de Política (`Policy`)**: `name`, `description`, `priority` (Integer), `is_active` (booleano).
- **Atributos de Regla (`PolicyRule`)**: `priority` (Integer), `effect` (`ALLOW`, `DENY`, `REQUIRE_APPROVAL`), `tool_action_id` (FK), `target_agent_id` (FK opcional), `conditions` (JSONB).
- **Criterios de Aceptación**:
  - Si `target_agent_id` es `null`, la regla aplica a todos los agentes de la organización que posean acceso a dicha acción. Si se especifica un agente, la regla es exclusiva para él.
  - El motor debe admitir condiciones sobre el contexto de la llamada (ej. `amount < 10000`, `user.role == "vip"`, `time_window == "business_hours"`).

#### `RF-07`: Algoritmo de Evaluación de Decisiones y Resolución de Conflictos
- **Descripción**: El Policy Decision Point (PDP) debe evaluar las reglas activas correspondientes al contexto de la llamada aplicando un orden estricto de precedencia:
  1. Se ordenan las políticas por `Policy.priority` descendente.
  2. Dentro de cada política, se evalúan las reglas por `PolicyRule.priority` descendente.
  3. **Precedencia de Efectos**: `DENY` tiene precedencia absoluta sobre `ALLOW`.
  4. Si una regla coincidente estipula `REQUIRE_APPROVAL`, la acción se suspende a la espera del flujo HITL.
  5. **Default Deny**: Si ninguna regla explícita autoriza la acción, la decisión por defecto es `DENY`.

---

### Módulo 4: Runtime Enforcement Gateway y Ejecuciones

#### `RF-08`: Interceptación en Tiempo Real de Solicitudes de Acción
- **Descripción**: El Agent Runtime Gateway (PEP) debe recibir las llamadas a herramientas emitidas por los agentes antes de que alcancen el recurso protegido.
- **Entrada de Evaluación**:
  - `organization_id`, `agent_id`, `delegator_user_id` (opcional), `tool_id`, `tool_action_id`, `resource` (identificador del objeto), `request_context` (parámetros de la llamada).
- **Criterios de Aceptación**:
  - El gateway valida la autenticidad del agente (token/API Key).
  - El payload de `request_context` debe sanitizarse automáticamente para evitar persistir contraseñas, secretos o tokens bancarios en texto claro.

#### `RF-09`: Enforcement Garantizado (Bloqueo de Invocación)
- **Descripción**: Si la decisión es `DENY`, el gateway **nunca reenvía la petición a la herramienta externa**. Retorna un error estructurado 403 Forbidden al agente con la causa de la denegación.
- **Criterios de Aceptación**:
  - El sistema verifica en logs y en red que la herramienta no recibió tráfico cuando la decisión fue `DENY` o `REQUIRE_APPROVAL`.

---

### Módulo 5: Human-in-the-Loop (HITL) y Aprobaciones

#### `RF-10`: Gestión del Ciclo de Vida de Aprobaciones (`Approval`)
- **Descripción**: Cuando una decisión resulta en `REQUIRE_APPROVAL`, se genera un ticket en la tabla `Approval` asociado a la `Execution`.
- **Estados admitidos**: `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`.
- **Criterios de Aceptación**:
  - Un usuario con rol `APPROVER` o `ADMIN` puede consultar la cola de aprobaciones pendientes, ver los detalles de la solicitud (agente, herramienta, recurso, parámetros sanitizados) y resolverla ingresando un motivo (`resolution_reason`).
  - Si es aprobada, el estado de la ejecución pasa a `EXECUTED` y la acción se reanuda o autoriza. Si es rechazada, pasa a `REJECTED`.

---

### Módulo 6: Alertas de Seguridad y Trazabilidad de Auditoría

#### `RF-11`: Generación Determinista de Incidentes de Seguridad (`Alert`)
- **Descripción**: El sistema debe levantar alertas automáticas ante eventos de riesgo definidos por política, tales como intentos de manipulación de objetivos (Prompt Injection), llamadas a acciones `CRITICAL` no autorizadas, o violaciones reiteradas de permisos.
- **Atributos**: `severity` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `status` (`OPEN`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`), `resolved_by_user_id`, `resolved_at`.
- **Criterios de Aceptación**:
  - Cada alerta puede vincularse a la `execution_id` causante.
  - La resolución de la alerta debe registrar al usuario responsable y la marca temporal.

#### `RF-12`: Registro Inmutable de Auditoría (`AuditEvent` & `Execution Trace`)
- **Descripción**: Toda decisión de runtime y todo cambio de configuración administrativa (altas de políticas, revocación de agentes, cambios de usuarios) debe registrarse en la tabla `AuditEvent`.
- **Atributos**: `actor_type` (`USER`, `AGENT`, `SYSTEM`), `actor_id`, `event_type`, `metadata` (JSONB), `timestamp`.
- **Criterios de Aceptación**:
  - Los eventos de auditoría son de solo adición (append-only); no pueden ser modificados ni eliminados desde la interfaz web ni por APIs estándar.

---

### Módulo 7: Simulación y Dashboard de Gobernanza

#### `RF-13`: AgentGuard Playground (Simulador de Ejecuciones)
- **Descripción**: La plataforma debe proveer una interfaz de simulación que permita a ingenieros y evaluadores académicos ejecutar solicitudes de prueba sin necesidad de invocar herramientas reales de producción.
- **Capacidades**:
  - Selección de agente, herramienta, acción y context payload.
  - Visualización inmediata de la decisión (`ALLOW`, `DENY`, `REQUIRE_APPROVAL`), la regla de política específica evaluada y la traza generada.
  - Ejecución precargada de los 4 escenarios de la demo principal (Ventas bajo umbral, Cambio de precio, Reembolso sensible, y Prompt Injection de exfiltración).

---

## 3. Requisitos No Funcionales (RNF)

| Código | Dimensión | Especificación del Requisito |
| :--- | :--- | :--- |
| **`RNF-01`** | **Seguridad & Aislamiento** | Aislamiento lógico multi-tenant estricto por `organization_id` en todas las consultas y mutations. Almacenamiento seguro de credenciales con hashing (Argon2/bcrypt) y variables de entorno protegidas. |
| **`RNF-02`** | **Trazabilidad & Correlación** | Cada ejecución genera un `execution_id` (UUID v4) único que correlaciona la llamada HTTP, la regla de política evaluada, la aprobación eventual y los eventos de auditoría. |
| **`RNF-03`** | **Determinismo** | El motor de decisiones no contiene modelos generativos probabilísticos en su ruta crítica de evaluación; cada decisión se basa estrictamente en reglas de negocio y condiciones lógicas. |
| **`RNF-04`** | **Latencia & Desempeño** | La latencia añadida por la evaluación del Policy Decision Point no debe superar los 25 milisegundos en percentil 95 (P95) para cargas habituales de simulación. |
| **`RNF-05`** | **Principio Fail-Closed (Seguridad por Defecto)** | Ante cualquier excepción no controlada, error de conexión con la base de datos o sintaxis corrupta en las condiciones de una política, el sistema debe responder `DENY` por defecto. |
| **`RNF-06`** | **Privacidad & Minimización** | El campo `request_context` debe someterse a sanitización automática, enmascarando claves sensibles (`authorization`, `api_key`, `secret`, `card_number`, `password`). |
| **`RNF-07`** | **Extensibilidad de Arquitectura** | La arquitectura debe desacoplar claramente el Policy Decision Point (PDP) del Policy Enforcement Point (PEP) y los adaptadores de herramientas (Mock, REST, MCP). |
| **`RNF-08`** | **Testabilidad** | El sistema debe incluir suites de pruebas unitarias y de integración que verifiquen los cuatro escenarios clave de la demo y la precedencia de políticas con un comando automatizado. |

---

## 4. Matriz de Trazabilidad: Requisitos vs. Modelo de Datos (MER v2.0)

| Requisito Funcional | Entidades MER v2.0 Involucradas | Operaciones Clave |
| :--- | :--- | :--- |
| `RF-01` (Tenancy & Users) | `Organization`, `User` | Creación y aislamiento de tenant, login, asignación de roles. |
| `RF-02` (Agent Lifecycle) | `Agent`, `Organization`, `User` | Registro de agente, asignación de owner, verificación de status. |
| `RF-03`, `RF-04` (Tools & Actions) | `Tool`, `ToolAction`, `Organization` | Catálogo de herramientas, definición de protocolos y risk levels. |
| `RF-05` (Agent Capabilities) | `AgentTool`, `Agent`, `Tool` | Habilitación N:N, verificación de `enabled`. |
| `RF-06`, `RF-07` (Policy Engine) | `Policy`, `PolicyRule`, `ToolAction`, `Agent` | Evaluación por prioridad, match de condiciones, precedencia `DENY`. |
| `RF-08`, `RF-09` (Runtime Interception) | `Execution`, `ToolAction`, `PolicyRule` | Registro de execution trace, sanitización de context, bloqueo. |
| `RF-10` (Human Approval) | `Approval`, `Execution`, `User` | Transición de estados de aprobación, registro de resolución. |
| `RF-11` (Alerts) | `Alert`, `Organization`, `Execution`, `User` | Disparo de incidentes, triaje, resolución por usuario. |
| `RF-12` (Auditing) | `AuditEvent`, `Organization` | Registro append-only de eventos de usuario, agente y sistema. |
| `RF-13` (Playground) | Todas las entidades anteriores | Simulación de escenarios reproducibles de extremo a extremo. |
