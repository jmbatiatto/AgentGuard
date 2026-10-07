# Reglas de Negocio (Business Rules) — AgentGuard
**Plataforma de Autorización Contextual y Gobernanza en Tiempo de Ejecución para Agentes de IA**  
*Versión 2.0 — Especificación Formal de Reglas de Negocio y Gobernanza*  
*Código de Documento: AG-RN-02*

---

## 1. Introducción y Taxonomía de Reglas

Las reglas de negocio de **AgentGuard** definen los invariantes, restricciones de seguridad, algoritmos de decisión y políticas operativas que gobiernan la interacción entre los agentes de IA, las herramientas externas y los usuarios humanos.

Cada regla se identifica con el código `RN-XX` y especifica:
- **Nombre y Clasificación**: Invariante de seguridad, regla de autorización, control de ciclo de vida o regla de auditoría.
- **Entidades MER v2.0 Involucradas**.
- **Descripción Operativa & Lógica de Validación**.
- **Acción ante Incumplimiento & Código de Error**.

---

## 2. Reglas de Tenencia, Identidad y Mínimo Privilegio

### `RN-01`: Aislamiento Multi-Tenant Estricto
- **Clasificación**: Invariante de Seguridad / Aislamiento.
- **Entidades**: `Organization`, todas las entidades del modelo.
- **Descripción**:
  - Toda entidad creada en el sistema debe pertenecer obligatoriamente a una `Organization` mediante `organization_id`.
  - Ninguna consulta, mutación ni evaluación de runtime puede cruzar límites de organizaciones. Cualquier petición que intente referenciar un recurso, agente o herramienta perteneciente a otro tenant debe ser abortada inmediatamente.
- **Acción ante Incumplimiento**: Rechazo HTTP 403 Forbidden. Código de error: `ERR_CROSS_TENANT_ACCESS_DENIED`. Emisión de `AuditEvent` de seguridad.

---

### `RN-02`: Responsabilidad y Custodia Humana de Agentes
- **Clasificación**: Regla de Gobernanza y Atribución.
- **Entidades**: `Agent`, `User`.
- **Descripción**:
  - Todo agente de IA debe tener un usuario humano asignado como responsable en el atributo `owner_user_id`.
  - El usuario custodio debe pertenecer a la misma organización del agente y poseer rol `ADMIN` u `OPERATOR`.
  - Si un usuario custodio es dado de baja o eliminado, el sistema debe exigir la reasignación inmediata de sus agentes a otro custodio activo.
- **Acción ante Incumplimiento**: No se permite la creación ni modificación del agente. Código de error: `ERR_INVALID_AGENT_OWNER`.

---

### `RN-03`: Validación del Estado Operativo del Agente
- **Clasificación**: Control de Runtime.
- **Entidades**: `Agent`, `Execution`.
- **Descripción**:
  - Un agente únicamente puede solicitar autorización de ejecución si su atributo `status` es estrictamente igual a `ACTIVE`.
  - Si el agente se encuentra en estado `SUSPENDED` (suspensión temporal preventiva) o `REVOKED` (revocación permanente por compromiso de seguridad), el Runtime Gateway debe emitir `decision = DENY` de forma inmediata sin evaluar reglas de políticas adicionales.
- **Acción ante Incumplimiento**: Decisión `DENY` en la ejecución. Código de error: `ERR_AGENT_NOT_ACTIVE`. Emisión de `Alert` si el agente revocado intenta operar.

---

### `RN-04`: Principio de Mínimo Privilegio en Herramientas (`AgentTool`)
- **Clasificación**: Autorización Basada en Capacidades.
- **Entidades**: `Agent`, `Tool`, `AgentTool`, `Execution`.
- **Descripción**:
  - Un agente solo puede solicitar la ejecución de acciones sobre herramientas con las que tenga una relación registrada en la tabla `AgentTool` con `enabled = true`.
  - Si un agente intenta invocar una herramienta que no le ha sido asignada expresamente, la solicitud debe ser interpretada como un intento de escalamiento de privilegios (*Privilege Escalation*).
- **Acción ante Incumplimiento**: Decisión `DENY`. Código de error: `ERR_CAPABILITY_NOT_GRANTED`. Se genera una `Alert` con severidad `HIGH`.

---

### `RN-05`: Unicidad y Criticidad de Acciones (`ToolAction`)
- **Clasificación**: Integridad de Datos.
- **Entidades**: `Tool`, `ToolAction`.
- **Descripción**:
  - El par `(tool_id, action_name)` debe ser único dentro de la organización.
  - Toda acción debe poseer un nivel de riesgo tipificado (`risk_level` $\in \{\text{LOW}, \text{MEDIUM}, \text{HIGH}, \text{CRITICAL}\}$).
  - Las acciones tipificadas como `CRITICAL` no pueden tener reglas de efecto `ALLOW` incondicionales; deben requerir condiciones restrictivas o aprobación humana.
- **Acción ante Incumplimiento**: Rechazo en la creación de la acción o política. Código de error: `ERR_INVALID_TOOL_ACTION_RISK`.

---

## 3. Reglas de Autorización, Precedencia y Evaluación de Políticas

### `RN-06`: Jerarquía y Ordenamiento de Políticas por Prioridad
- **Clasificación**: Algoritmo de Evaluación (PDP).
- **Entidades**: `Policy`, `PolicyRule`.
- **Descripción**:
  - Las políticas activas (`is_active = true`) se ordenan en forma descendente por `Policy.priority` (números más altos se evalúan primero).
  - Dentro de una política, sus reglas se ordenan en forma descendente por `PolicyRule.priority`.
  - Si una regla coincide con la acción solicitada (`tool_action_id`), el agente objetivo (`target_agent_id` o global si es `NULL`) y sus condiciones contextuales (`conditions`), su efecto es seleccionado para la resolución final.

---

### `RN-07`: Precedencia Terminante de `DENY` sobre `ALLOW`
- **Clasificación**: Invariante de Seguridad.
- **Entidades**: `PolicyRule`, `Execution`.
- **Descripción**:
  - Si durante la evaluación de políticas aplicables coexisten reglas con veredictos contradictorios, el efecto **`DENY` prevalece de manera absoluta e irrevocable** sobre cualquier regla `ALLOW`.
  - La única excepción a la ejecución inmediata de una regla de rechazo es una regla explícita de mayor prioridad que mandate `REQUIRE_APPROVAL` para someter la solicitud a escrutinio humano.
- **Fórmula de Precedencia**:
  $$\text{Veredicto} = \begin{cases} \text{DENY}, & \text{si existe al menos un } \text{DENY} \text{ coincidente} \\ \text{REQUIRE\_APPROVAL}, & \text{si no hay DENY y existe al menos un } \text{REQUIRE\_APPROVAL} \\ \text{ALLOW}, & \text{si solo existen reglas } \text{ALLOW} \text{ coincidentes} \end{cases}$$

---

### `RN-08`: Seguridad por Defecto (*Default Deny* / *Fail-Closed*)
- **Clasificación**: Invariante de Seguridad.
- **Entidades**: `PolicyRule`, `Execution`.
- **Descripción**:
  - Si una solicitud de acción no coincide con ninguna regla de política activa en la organización, el sistema debe resolver **`DENY` por defecto**.
  - Si durante la evaluación ocurre un error de base de datos, falla de conectividad o excepción de formato en el JSON de condiciones, el sistema debe aplicar el principio *Fail-Closed*, emitiendo `DENY` y bloqueando la llamada.
- **Acción ante Incumplimiento**: Decisión `DENY`. Código de error: `ERR_NO_MATCHING_POLICY_RULE` o `ERR_FAIL_CLOSED_SYSTEM_ERROR`.

---

### `RN-09`: Enrutamiento y Creación de Aprobación Humana (`REQUIRE_APPROVAL`)
- **Clasificación**: Human-in-the-Loop (HITL).
- **Entidades**: `Execution`, `Approval`.
- **Descripción**:
  - Cuando el motor de políticas resuelve `REQUIRE_APPROVAL`:
    1. Se registra la `Execution` con `status = PENDING_APPROVAL` y `decision = REQUIRE_APPROVAL`.
    2. Se crea un registro único en la tabla `Approval` con `status = PENDING`.
    3. La llamada a la herramienta externa queda suspendida; **el Gateway jamás invoca la herramienta**.
    4. Se retorna al agente una respuesta estructurada con `approval_id` para consulta asíncrona o espera de webhook.

---

### `RN-10`: Resolución Obligatoria de Aprobación con Justificación
- **Clasificación**: Gobernanza Humana.
- **Entidades**: `Approval`, `User`, `Execution`.
- **Descripción**:
  - Solo los usuarios con rol `APPROVER` o `ADMIN` pueden resolver un ticket en estado `PENDING`.
  - Toda resolución (sea `APPROVED` o `REJECTED`) debe incluir obligatoriamente un texto de justificación no vacío en el campo `resolution_reason` (mínimo 10 caracteres).
  - Al resolver:
    - Si es `APPROVED`: `Approval.status = APPROVED`, `Execution.status = EXECUTED`, se sella `resolved_at` y se libera la invocación.
    - Si es `REJECTED`: `Approval.status = REJECTED`, `Execution.status = REJECTED` y la acción queda abortada.
- **Acción ante Incumplimiento**: Rechazo de la transacción de resolución. Código de error: `ERR_APPROVAL_REASON_REQUIRED`.

---

### `RN-11`: Caducidad y Expiración Temporal de Aprobaciones
- **Clasificación**: Control Temporal de Seguridad.
- **Entidades**: `Approval`, `Execution`.
- **Descripción**:
  - Toda aprobación pendiente tiene una ventana máxima de validez configurable por tenant (por defecto 24 horas).
  - Si una solicitud no es resuelta dentro de dicha ventana, su estado pasa automáticamente a `EXPIRED` y la ejecución asociada a `REJECTED`.
  - Una aprobación expirada no puede ser aprobada retroactivamente.
- **Acción ante Incumplimiento**: Código de error: `ERR_APPROVAL_TICKET_EXPIRED`.

---

## 4. Reglas de Protección de Datos, Auditoría e Incidentes

### `RN-12`: Sanitización Activa de Secretos en `request_context`
- **Clasificación**: Privacidad y Protección de Datos.
- **Entidades**: `Execution`.
- **Descripción**:
  - Antes de almacenar el payload de entrada en el campo `request_context`, el sistema debe ejecutar un proceso determinista de redacción y enmascaramiento.
  - Claves sensibles identificadas por patrones (ej. `password`, `token`, `secret`, `api_key`, `cvv`, `authorization`) deben ser reemplazadas por la máscara `"[REDACTED]"`.
  - Bajo ninguna circunstancia se persistirán secretos o tokens Bearer en texto plano en la base de datos.
- **Acción ante Incumplimiento**: La sanitización es obligatoria en el pipeline del Gateway antes del `INSERT` en `Execution`.

---

### `RN-13`: Disparo Determinista de Alertas ante Amenazas
- **Clasificación**: Detección de Incidentes.
- **Entidades**: `Alert`, `Execution`.
- **Descripción**:
  - El sistema debe generar automáticamente un registro en `Alert` con severidad `CRITICAL` cuando:
    1. Una acción con `risk_level = CRITICAL` sea invocada y denegada.
    2. Se detecte un intento explícito de exfiltración de datos o violación del propósito del agente (Prompt Injection).
    3. Un mismo agente acumule 5 o más denegaciones consecutivas en una ventana de 5 minutos (posible agente descontrolado o ataque de fuerza bruta).
  - Las alertas nacen en estado `OPEN` y solo usuarios `ADMIN` pueden marcarlas como `RESOLVED` o `DISMISSED`.

---

### `RN-14`: Inmutabilidad y No Repudio de Auditoría
- **Clasificación**: Integridad y Cumplimiento.
- **Entidades**: `AuditEvent`, `Execution`.
- **Descripción**:
  - Los registros de las tablas `AuditEvent` y `Execution` son estrictamente de solo adición (*Append-Only*).
  - Ninguna API, procedimiento almacenado ni interfaz de usuario debe proporcionar operaciones `UPDATE` o `DELETE` sobre estas tablas.
  - Todo cambio de configuración, evaluación de runtime o resolución humana debe quedar registrado con su timestamp UTC no editable.
- **Acción ante Incumplimiento**: Error fatal de base de datos / Denegación de permisos de escritura a nivel de esquema.
