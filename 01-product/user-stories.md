# Historias de Usuario (User Stories) — AgentGuard
**Plataforma de Autorización Contextual y Gobernanza en Tiempo de Ejecución para Agentes de IA**  
*Versión 2.0 — Agile Product Backlog con Criterios de Aceptación Gherkin*

---

## Índice de Épicas

- **Épica 1**: Multi-Tenancy, Identidad y Gestión de Agentes de IA
- **Épica 2**: Catálogo de Herramientas, Acciones y Mínimo Privilegio (N:N)
- **Épica 3**: Motor de Políticas Contextuales y Reglas de Autorización
- **Épica 4**: Interceptación en Runtime y Enforcement Garantizado
- **Épica 5**: Human-in-the-Loop (HITL) y Flujo de Aprobaciones
- **Épica 6**: Alertas de Seguridad y Trazabilidad de Auditoría Inmutable
- **Épica 7**: Playground de Simulación y Demostración Académica

---

## Épica 1: Multi-Tenancy, Identidad y Gestión de Agentes de IA

### `US-01`: Aislamiento Multi-Tenant por Organización
- **Como** Administrador de Seguridad de una empresa cliente (`ADMIN`),
- **Quiero** que todos los datos, agentes, políticas y registros de auditoría de mi organización estén estrictamente aislados de otros inquilinos en la base de datos,
- **Para** cumplir con normativas de privacidad y evitar fugas de información entre organizaciones (*Cross-tenant data leakage*).

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Acceso restringido por organización
  Dado que un usuario "alice@acme.com" pertenece a la Organización "Acme Corp"
  Y existe otra Organización "Beta Inc" con agentes y políticas registradas
  Cuando Alice consulta la lista de agentes o políticas en el dashboard o API
  Entonces solo recibe los registros cuyo organization_id coincida con "Acme Corp"
  Y cualquier intento de consultar con el ID de "Beta Inc" retorna un error 403 Forbidden.
```

---

### `US-02`: Registro y Asignación de Responsable para Agentes de IA
- **Como** Líder Técnico o Ingeniero de IA (`OPERATOR` / `ADMIN`),
- **Quiero** registrar un nuevo agente de IA asignándole un nombre descriptivo, un propósito explícito (`purpose`) y un usuario humano responsable (`owner_user_id`),
- **Para** que cada acción realizada por el modelo de IA tenga un responsable humano identificable y trazable en la organización.

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Registro exitoso de un agente
  Dado que el Administrador se encuentra en el panel de agentes
  Cuando registra un agente con nombre "Financial-Analyst-Bot", propósito "Generación de cotizaciones y reportes" y status "ACTIVE"
  Entonces el sistema genera un identificador UUID único para el agente
  Y asocia el owner_user_id al usuario que creó o seleccionó el responsable
  Y emite un evento de auditoría tipo "AGENT_REGISTERED".
```

---

### `US-03`: Suspensión Inmediata o Revocación de un Agente Comprometido
- **Como** Oficial de Seguridad (`ADMIN`),
- **Quiero** cambiar el estado de un agente de `ACTIVE` a `SUSPENDED` o `REVOKED` con un solo clic,
- **Para** neutralizar de inmediato cualquier intento de operación en caso de detectar comportamiento anómalo o sospecha de ataque.

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Bloqueo de llamadas para agente suspendido
  Dado que el agente "Support-Bot" ha sido cambiado a estado "SUSPENDED"
  Cuando el agente emite una solicitud de ejecución hacia cualquier herramienta
  Entonces el Runtime Gateway rechaza la solicitud de inmediato con decisión "DENY"
  Y el motivo de rechazo especifica que el agente no se encuentra activo
  Y la herramienta externa nunca es invocada.
```

---

## Épica 2: Catálogo de Herramientas, Acciones y Mínimo Privilegio

### `US-04`: Registro Granular de Herramientas y Acciones con Nivel de Riesgo
- **Como** Administrador de Sistemas (`ADMIN`),
- **Quiero** registrar herramientas externas (`Tool`) y desglosar sus operaciones en acciones atómicas (`ToolAction`) clasificadas por nivel de riesgo (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`),
- **Para** aplicar políticas diferenciadas según el impacto potencial de cada operación.

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Configuración de acciones de base de datos
  Dado que se registra la herramienta "PostgreSQL-CRM" de protocolo "REST"
  Cuando se añaden las acciones:
    | action_name   | risk_level |
    | select_record | LOW        |
    | update_record | MEDIUM     |
    | delete_table  | CRITICAL   |
  Entonces las tres acciones quedan vinculadas a tool_id
  Y no se permite duplicar el nombre de acción para la misma herramienta.
```

---

### `US-05`: Asignación de Capacidades a Agentes (Relación N:N - `AgentTool`)
- **Como** Ingeniero de Seguridad (`ADMIN`),
- **Quiero** habilitar o deshabilitar selectivamente el acceso de un agente a herramientas específicas mediante la relación `AgentTool`,
- **Para** aplicar el principio de menor privilegio (*Least Privilege*) y evitar que un agente invoque herramientas fuera de su ámbito.

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Intento de invocación de herramienta no asignada (Privilege Escalation)
  Dado que el agente "Sales-Bot" solo tiene asignada la herramienta "QuoteTool"
  Cuando "Sales-Bot" intenta invocar la acción "delete_table" de la herramienta "PostgreSQL-CRM"
  Entonces el gateway bloquea la llamada con decisión "DENY"
  Y se genera una alerta de seguridad por intento de escalamiento de privilegios.
```

---

## Épica 3: Motor de Políticas y Reglas de Autorización

### `US-06`: Creación de Reglas de Autorización Jerárquicas
- **Como** Oficial de Seguridad (`ADMIN`),
- **Quiero** definir políticas compuestas por reglas (`PolicyRule`) con prioridades numéricas y efectos (`ALLOW`, `DENY`, `REQUIRE_APPROVAL`),
- **Para** gobernar con precisión matemática qué operaciones están permitidas bajo qué condiciones de negocio.

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Regla de ventas con condición de monto
  Dado que existe la política "Política Comercial" con prioridad 100
  Cuando se crea una regla asociada a la acción "create_quote" con:
    | effect | priority | conditions              |
    | ALLOW  | 50       | {"amount": {"$lt": 10000}} |
  Entonces el motor guarda la regla vinculada a tool_action_id
  Y solo se autorizarán cotizaciones con montos estrictamente menores a 10.000 USD.
```

---

### `US-07`: Precedencia Estricta de `DENY` y Resolución de Conflictos
- **Como** CISO o Auditor de Cumplimiento,
- **Quiero** que el motor de evaluación otorgue precedencia absoluta a las reglas `DENY` sobre las reglas `ALLOW` ante cualquier conflicto de políticas activas,
- **Para** garantizar que ninguna regla permisiva pueda saltarse una prohibición de seguridad explícita.

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Conflicto entre regla permisiva y prohibitiva
  Dado que existe una regla global con efecto "ALLOW" para la herramienta "FileTransfer"
  Y existe una regla de mayor prioridad con efecto "DENY" cuando "destination == 'external'"
  Cuando el agente solicita transferir un archivo hacia un destino externo
  Entonces la evaluación del motor resuelve "DENY"
  Y se registra en la traza que la regla prohibitiva tuvo precedencia.
```

---

## Épica 4: Interceptación en Runtime y Enforcement Garantizado

### `US-08`: Interceptación en Tiempo Real vía Gateway (PEP)
- **Como** Desarrollador de Aplicaciones Agentic,
- **Quiero** enviar las llamadas de herramientas de mis agentes a través del endpoint `/api/v1/governance/authorize` de AgentGuard,
- **Para** obtener una autorización previa verificada antes de que el agente ejecute cualquier acción sobre el sistema final.

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Invocación autorizada (ALLOW)
  Dado un agente "Sales-Bot" autenticado en la plataforma
  Cuando envía una solicitud para "create_quote" con monto de 2.500 USD
  Entonces el gateway evalúa las políticas en menos de 25 milisegundos
  Y responde con un objeto JSON:
    """
    {
      "decision": "ALLOW",
      "status": "EXECUTED",
      "execution_id": "<UUID>",
      "evaluated_policy_rule_id": "<UUID>"
    }
    """
```

---

### `US-09`: Sanitización Automática del Contexto de Ejecución
- **Como** Oficial de Privacidad de Datos (DPO),
- **Quiero** que el sistema filtre y enmascare automáticamente cualquier token de autenticación, contraseña o dato confidencial presente en el payload de contexto antes de persistirlo en `request_context`,
- **Para** evitar la fuga de secretos en las bases de datos de auditoría.

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Enmascaramiento de credenciales en trazas
  Dado que el payload de la solicitud contiene campos "api_key" y "password"
  Cuando el gateway procesa la ejecución y la almacena en la tabla Execution
  Entonces los valores de "api_key" y "password" se reemplazan por "[REDACTED]"
  Y el payload sanitizado queda disponible para inspección segura.
```

---

## Épica 5: Human-in-the-Loop (HITL) y Flujo de Aprobaciones

### `US-10`: Enrutamiento de Acciones Sensibles a Aprobación Humana
- **Como** Gerente de Operaciones (`APPROVER`),
- **Quiero** que las acciones marcadas por política como `REQUIRE_APPROVAL` queden en estado `PENDING_APPROVAL` en una bandeja de trabajo centralizada,
- **Para** validar manualmente operaciones de alto impacto financiero o corporativo antes de su consumación.

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Solicitud de reembolso superior al umbral permitido
  Dado que existe una política que exige aprobación para "refund" mayores o iguales a 500 USD
  Cuando un agente financiero solicita un reembolso de 4.500 USD para el cliente "cust/102"
  Entonces el gateway retorna decisión "REQUIRE_APPROVAL" con estado "PENDING_APPROVAL"
  Y crea un registro en la tabla Approval con status "PENDING"
  Y la herramienta de pago NO es ejecutada hasta la resolución humana.
```

---

### `US-11`: Resolución Humana de Aprobaciones con Motivo Documentado
- **Como** Aprobador Autorizado (`APPROVER`),
- **Quiero** revisar los detalles de una solicitud pendiente y pulsar "Aprobar" o "Rechazar" registrando obligatoriamente un motivo de resolución,
- **Para** dejar constancia formal del consentimiento y permitir o abortar la ejecución del agente.

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Aprobador concede la operación
  Dado que una aprobación se encuentra en estado "PENDING"
  Cuando el usuario con rol APPROVER ingresa "Validado telefónicamente con el cliente" y presiona "Aprobar"
  Entonces el estado de la aprobación cambia a "APPROVED"
  Y el campo resolved_at se actualiza con la fecha y hora actual
  Y se emite un AuditEvent de tipo "APPROVAL_GRANTED".
```

---

## Épica 6: Alertas de Seguridad y Trazabilidad de Auditoría Inmutable

### `US-12`: Generación de Alerta de Seguridad por Manipulación (Prompt Injection)
- **Como** Analista de Seguridad (SecOps),
- **Quiero** que el sistema genere automáticamente una alerta de severidad `CRITICAL` cuando se detecte un intento de acción fuera del propósito del agente o prohibida explícitamente,
- **Para** investigar de inmediato potenciales incidentes de manipulación de agentes.

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Detección y alerta de exfiltración no autorizada
  Dado que un agente de soporte recibe una instrucción inyectada para llamar a "export_customers" hacia un servidor externo
  Cuando el gateway intercepta la llamada y verifica que la acción está prohibida
  Entonces el gateway responde con "DENY"
  Y crea un registro en la tabla Alert con:
    | severity | status | alert_type                       |
    | CRITICAL | OPEN   | UNAUTHORIZED_DATA_EXPORT_ATTEMPT |
  Y asocia la alerta a la execution_id correspondiente.
```

---

### `US-13`: Consulta de Bitácora de Auditoría Inmutable
- **Como** Auditor Interno o Externo (`ADMIN`),
- **Quiero** consultar el historial completo de eventos de auditoría filtrando por rango de fechas, actor, agente y tipo de evento,
- **Para** reconstruir la línea de tiempo de cualquier decisión tomada por el sistema sin riesgo de manipulación de registros.

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Consulta y garantía de inmutabilidad
  Dado que se han registrado 100 eventos en la tabla AuditEvent
  Cuando el auditor consulta el registro de auditoría
  Entonces puede filtrar por actor_type ("AGENT", "USER", "SYSTEM")
  Y no existe ningún endpoint ni botón en la interfaz que permita editar o borrar un AuditEvent.
```

---

## Épica 7: Playground de Simulación y Demostración Académica

### `US-14`: Simulación Interactiva de Escenarios de Decisión
- **Como** Estudiante / Ingeniero presentando el proyecto ante el tribunal docente,
- **Quiero** un Playground interactivo donde pueda seleccionar un agente, elegir una herramienta, enviar un payload simulado y observar en tiempo real la decisión, la regla aplicada y la traza generada,
- **Para** demostrar de forma contundente y verificable la robustez técnica del modelo frente a los 4 escenarios clave (Ventas normal, Cambio de precios prohibido, Reembolso sensible con HITL, y Prompt Injection bloqueada).

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Ejecución de demo en vivo en el Playground
  Dado que el evaluador selecciona el escenario "4. Prompt Injection Exfiltración"
  Cuando presiona "Simular Ejecución"
  Entonces la interfaz muestra visualmente el badge rojo "DENY", la severidad "CRITICAL", el registro de alerta levantado y el Execution Trace completo
  Demostrando que la frontera de seguridad externa funcionó de manera determinista.
```
