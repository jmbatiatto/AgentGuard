# 🎙️ Mega-Guión Integral del Proyecto: AgentGuard
### *Runtime Authorization & Governance for AI Agents*

> **Objetivo:** Guión maestro completo, cinematográfico y técnicamente riguroso para video, presentación oral de defensa académica o pitch ante inversores/evaluadores.  
> **Estructura modular:** Diseñado con bloques de tiempo, locución (guión de voz), indicaciones visuales de cámara/pantalla y **prompts específicos para generar las ilustraciones con Gemini, Imagen 3, Midjourney o Runway**.  
> **Duración total estimada:** 4:30 a 5:00 minutos (o divisible en 6 clips temáticos).

---

## 📑 Índice de Bloques
1. [Bloque 1: El Punto de Inflexión (El Problema y la Evidencia de la Industria)](#bloque-1)
2. [Bloque 2: Estado del Mercado (Qué existe y por qué no es suficiente)](#bloque-2)
3. [Bloque 3: La Tesis de AgentGuard y Nuestro Factor Diferencial](#bloque-3)
4. [Bloque 4: Arquitectura Técnica (El Modelo PEP / PDP y el Estándar MCP)](#bloque-4)
5. [Bloque 5: La Secuencia Demostrable en Vivo (Los 4 Escenarios Críticos)](#bloque-5)
6. [Bloque 6: Trazabilidad Forense, Modelo de Negocio y Cierre](#bloque-6)

---

<a name="bloque-1"></a>
## 🔴 Bloque 1: El Punto de Inflexión (0:00 - 0:50)
### *De la IA generativa de texto a los agentes que tocan sistemas reales*

#### 🎬 Indicaciones Visuales:
* **0:00 - 0:15:** Plano macro de código terminal y dashboards empresariales (banca, CRM, bases de datos). Destellos de consultas SQL y pagos automáticos ejecutándose sin interacción humana.
* **0:15 - 0:35:** Aparecen titulares flotantes y datos estadísticos de alto impacto de la **Cloud Security Alliance (CSA)** y **OWASP GenAI 2026** sobre fondo oscuro con alertas tipográficas rojas y ámbar.
* **0:35 - 0:50:** Zoom dramático sobre una interfaz de LLM recibiendo una orden ambigua que desata una acción destructiva en producción.

#### 🎙️ Locución (Voz en off / Presentador, tono serio y urgente):
> "Durante los últimos dos años, el mundo se maravilló con la Inteligencia Artificial que redacta textos y genera código. Pero esa etapa terminó. Hoy entramos de lleno en la era de los **Agentes Autónomos**: sistemas de IA que no solo conversan, sino que **ejecutan acciones reales**. 
> 
> Un agente conectado a herramientas puede consultar bases de clientes, crear facturas, alterar listas de precios, reembolsar pagos y encadenar procesos en milisegundos. Y aquí radica el nuevo abismo de la ciberseguridad: **darle autonomía a un modelo de IA sin una frontera de control es darle las llaves maestras de la empresa**.
> 
> Los organismos internacionales ya están haciendo sonar las alarmas: en su informe de 2026, **OWASP** clasificó el *Tool Misuse*, el *Privilege Abuse* y la *Excessive Agency* entre las mayores amenazas corporativas. Aún más contundente: un estudio de la **Cloud Security Alliance** reveló que el **53% de las empresas ya reportó que sus agentes excedieron los permisos previstos**, y el **68% de los líderes de seguridad admite que hoy no puede distinguir con claridad una acción ejecutada por un humano de una ejecutada por un agente**. El problema no es teórico: está ocurriendo ahora mismo en producción".

#### 🎨 Prompt para ilustrar este bloque con Gemini / Imagen 3:
```text
Photorealistic 3D render of an autonomous glowing AI core attempting to access interconnected corporate digital vaults, servers, and financial databases. Cyber-defense alert screens displaying warning graphs, data breach alerts, dark blue and vibrant neon red hazard lighting, cinematic depth of field, 8k, Octane render style.
```

---

<a name="bloque-2"></a>
## 🏢 Bloque 2: Estado del Mercado (0:50 - 1:40)
### *Qué están haciendo los gigantes tecnológicos y cuál es el vacío existente*

#### 🎬 Indicaciones Visuales:
* **0:50 - 1:15:** Gráfico comparativo de ecosistemas tecnológicos. Aparecen logotipos y nombres de plataformas empresariales: *Microsoft Entra Agent ID*, *AWS Bedrock AgentCore Identity*, y startups especializadas como *Noma Security* y *Zenity*.
* **1:15 - 1:40:** Diagrama que separa el concepto de **IAM tradicional** (Identidad estática) frente a la **Autorización en tiempo de ejecución** (Runtime Authorization).

#### 🎙️ Locución:
> "¿Significa esto que la industria está ignorando el problema? Todo lo contrario: el mercado está validando esta necesidad a una velocidad histórica. Las mayores empresas del planeta han comenzado a mover sus fichas: Microsoft lanzó **Entra Agent ID** para dotar de identidad a los agentes; AWS incorporó **Bedrock AgentCore Identity** para gestionar credenciales; y startups de ciberseguridad como Noma Security y Zenity captaron más de 200 millones de dólares en rondas de inversión este mismo año.
> 
> Sin embargo, las soluciones actuales sufren de un sesgo estructural: se enfocan casi exclusivamente en **la identidad**. Resuelven la pregunta clásica de IAM: *«¿Quién es este agente y qué rol general posee?»*.
> 
> Pero en un entorno agentic, esa pregunta es peligrosamente insuficiente. Un agente de ventas legítimo, con credenciales válidas y acceso autorizado a una herramienta de pagos, puede sufrir una inyección de instrucciones (*Prompt Injection*), alucinar o recibir una tarea fuera de contexto. Saber *quién es* el agente no te salva del desastre si no puedes controlar **qué acción puntual está a punto de ejecutar, sobre qué recurso específico, bajo qué horario y bajo qué umbral de riesgo**.
> 
> Las empresas no necesitan otro catálogo de identidades estáticas: necesitan un **broker de autorización y gobernanza en tiempo de ejecución**".

#### 🎨 Prompt para ilustrar este bloque con Gemini / Imagen 3:
```text
Infographic illustration of modern corporate IAM vs Agentic Security. On one side, classic digital ID badges (representing Entra / AWS IAM). On the other side, dynamic glowing data packets moving between an AI brain and external APIs, with a smart transparent security checkpoint analyzing individual transactions in real-time. Dark slate aesthetic, elegant cyan and purple neon lines.
```

---

<a name="bloque-3"></a>
## 🛡️ Bloque 3: La Tesis de AgentGuard y Nuestro Factor Diferencial (1:40 - 2:30)
### *«IAM responde quién eres; AgentGuard decide qué puedes hacer ahora»*

#### 🎬 Indicaciones Visuales:
* **1:40 - 2:05:** Revelación del isotipo y escudo de **AgentGuard**. Una animación fluida muestra cómo AgentGuard se posiciona como una capa perimetral externa entre el modelo de lenguaje y el ecosistema de herramientas.
* **2:05 - 2:30:** Desglose visual de los 5 factores de evaluación simultánea y los 3 posibles veredictos: `ALLOW`, `DENY` y `REQUIRE_APPROVAL`.

#### 🎙️ Locución:
> "Para resolver esta brecha creamos **AgentGuard: Plataforma de autorización contextual y gobernanza en tiempo de ejecución para agentes de Inteligencia Artificial**.
> 
> Nuestra tesis central se resume en una sola frase:  
> **«IAM responde quién eres; AgentGuard decide qué puedes hacer ahora».**
> 
> ¿Qué hace a AgentGuard diferente de un API Gateway tradicional o de una base de datos de permisos? Cinco principios de diseño no negociables:
> 
> 1. **La frontera de seguridad está fuera del modelo (*Never trust the model as the enforcement point*):** El LLM puede proponer cualquier acción que desee, pero la decisión de si esa acción se ejecuta se toma en nuestro motor determinista, fuera del alcance de cualquier manipulación de texto o jailbreak.
> 2. **Autorización contextual en 5 dimensiones:** AgentGuard no evalúa si el agente tiene la herramienta; evalúa la tupla completa: **el Agente emisor, el Delegador humano en cuyo nombre actúa, la Acción atómica solicitada, el Recurso afectado y el Contexto operativo** (horario, monto, entorno, IP).
> 3. **Resultados inmutables con Human-in-the-loop:** Las políticas emiten `ALLOW`, `DENY` o, de manera nativa, `REQUIRE_APPROVAL`, suspendiendo temporalmente la llamada hasta que un operador humano la valide en el Dashboard.
> 4. **Trazabilidad forense inmutable (*Execution Traces*):** Cada intento genera una evidencia auditable con tiempos, datos sanitizados y la regla legal que justificó la decisión.
> 5. **Alineación con el estándar MCP (Model Context Protocol):** No inventamos un protocolo propietario cerrado. Nos integramos directamente con el estándar emergente de la industria impulsado por Anthropic y la comunidad de código abierto".

#### 🎨 Prompt para ilustrar este bloque con Gemini / Imagen 3:
```text
Futuristic cyber shield logo representing "AgentGuard" placed between a glowing humanoid AI hologram and cloud service nodes. Floating 3D holographic chips displaying the 5 contextual rules: Agent ID, Delegator, Action, Resource, Context. Sleek dark mode glassmorphism UI, emerald green glow on the approved side, neon red barrier on the unauthorized side.
```

---

<a name="bloque-4"></a>
## ⚙️ Bloque 4: Arquitectura Técnica (2:30 - 3:15)
### *Cómo funciona el motor PEP / PDP en el backend web*

#### 🎬 Indicaciones Visuales:
* **2:30 - 2:50:** Plano general del diagrama de arquitectura ([`agentguard_arquitectura_runtime.drawio`](file:///f:/General/ITU/OneDrive%20-%20Universidad%20Nacional%20de%20Cuyo/Desarrollo%20de%20Software/Quinto%20semestre/Desarrollo%20WEB/agentguard_arquitectura_runtime.drawio)). Se ilumina la ruta desde el cliente MCP, pasando por el Gateway (PEP), hacia el Policy Engine (PDP) y la base de datos multi-tenant.
* **2:50 - 3:15:** Primer plano de la base de datos PostgreSQL, destacando el aislamiento estricto por `organization_id`, los campos estructurados `JSONB` indexados con GIN, y la capa de caché ultrarrápida en Redis.

#### 🎙️ Locución:
> "Para implementar esta visión diseñamos una arquitectura web de grado empresarial inspirada en los estándares **XACML y el RFC 2904**:
> 
> En el perímetro opera el **Agent Runtime Gateway**, que actúa como nuestro **Policy Enforcement Point (PEP)**. Es un proxy inverso de alta velocidad capaz de hablar JSON-RPC sobre transporte MCP o HTTP REST. Cuando una llamada llega, el Gateway valida la autenticidad del token, extrae los parámetros de la solicitud y sanitiza la información sensible para cumplir con normativas de privacidad.
> 
> Inmediatamente, la petición se deriva al **Policy Decision Point (PDP)**, nuestro motor de decisión determinista. El PDP carga las políticas activas del tenant directamente desde **Redis** para mantener latencias de evaluación inferiores a los 5 milisegundos.
> 
> El motor evalúa los predicados lógicos almacenados en estructuras `JSONB` aplicando siempre la regla de **Fail-Closed**: ante cualquier empate o colisión de reglas, `DENY` tiene precedencia absoluta sobre `ALLOW`.
> 
> En la capa de persistencia, una base de datos **PostgreSQL Multi-Tenant** asegura el aislamiento riguroso entre empresas mediante discriminadores indexados, desacoplando la relación entre agentes y herramientas mediante la entidad asociativa `AgentTool`, y auditando tanto llamadas operativas en `Execution` como acciones administrativas en `AuditEvent`".

#### 🎨 Prompt para ilustrar este bloque con Gemini / Imagen 3:
```text
High-tech software architecture blueprint rendering. In the center, a glowing reverse proxy gateway routing glowing data streams. On the left, an autonomous AI client node; on the top, a deterministic policy evaluation engine with algorithmic code lines; on the right, PostgreSQL database cylinder and Redis cache node glowing with high-speed fiber optic cables. Clean, isometric tech diagram style.
```

---

<a name="bloque-5"></a>
## 🎬 Bloque 5: La Secuencia Demostrable en Vivo (3:15 - 4:15)
### *4 decisiones consecutivas sobre el mismo agente de ventas*

#### 🎬 Indicaciones Visuales:
* **3:15 - 3:30 (Escenario 1):** Animación de secuencia basada en [`secuencia_demo_4_escenarios.png`](file:///f:/General/ITU/OneDrive%20-%20Universidad%20Nacional%20de%20Cuyo/Desarrollo%20de%20Software/Quinto%20semestre/Desarrollo%20WEB/secuencia_demo_4_escenarios.png). La llamada `create_quote ($2,500)` se evalúa, destello verde **ALLOW**, se crea la cotización #QT-991 en el CRM.
* **3:30 - 3:45 (Escenario 2):** Intento de `update_price ($10)`. El Gateway frena en seco el paquete con un escudo rojo carmesí. Error 403 Forbidden. La base de datos protegida permanece intacta.
* **3:45 - 4:00 (Escenario 3):** Solicitud `refund ($4,500)`. Se congela en ámbar. Transición de cámara a la bandeja *Approvals Inbox* en el navegador del operador. Notificación WebSocket en vivo. El operador hace click en [Aprobar con motivo: "Cliente VIP"]. Despacho inmediato a Stripe.
* **4:00 - 4:15 (Escenario 4):** Ataque de *Prompt Injection*: `export_customers` a un servidor externo. Bloqueo inmediato, corte de conexión y alerta roja crítica parpadeando en el Dashboard.

#### 🎙️ Locución:
> "La solidez de AgentGuard no se demuestra con promesas teóricas: se demuestra en vivo mediante una secuencia crítica de 4 decisiones sobre una misma organización y un mismo agente de ventas:
> 
> * **Escenario 1 (Operación Legítima):** El agente solicita `create_quote` por 2.500 dólares. El PDP evalúa que la política autoriza cotizaciones bajo el umbral de 10.000 dólares. Resultado: **`ALLOW`**. La orden viaja al servidor MCP de ventas, genera el presupuesto exitosamente y se registra en la traza con código 200 OK.
> 
> * **Escenario 2 (Abuso de Privilegio):** Ese mismo agente intenta modificar el catálogo con `update_price` a 10 dólares. AgentGuard comprueba que el agente no tiene esa capacidad en su perfil. Resultado: **`DENY`**. La petición se neutraliza en el Gateway; la base de datos de precios jamás recibe la llamada y el agente recibe un error 403 Forbidden.
> 
> * **Escenario 3 (Supervisión Humana / Human-in-the-Loop):** El agente solicita un reembolso de 4.500 dólares. Nuestra regla financiera exige que toda devolución igual o mayor a 500 dólares requiera aprobación. Resultado: **`REQUIRE_APPROVAL`**. La llamada se suspende en el Gateway y viaja instantáneamente por WebSockets al panel del supervisor humano. El operador valida el caso en su pantalla, hace click en Aprobar con justificación, y recién allí AgentGuard reanuda la llamada hacia Stripe, completando el pago de forma segura.
> 
> * **Escenario 4 (Ataque de Prompt Injection):** Un atacante logra manipular al agente mediante un correo envenenado para forzar la exfiltración masiva con `export_customers` hacia un servidor externo. Como AgentGuard no confía en el modelo, evalúa el destino y la transgresión de propósito. Resultado: **`DENY + ALERTA CRÍTICA`**. La conexión se interrumpe y una alerta roja se enciende en tiempo real en la consola de seguridad para su remediación inmediata".

#### 🎨 Prompt para ilustrar este bloque con Gemini / Imagen 3:
```text
Four-panel cinematic split screen showing: Panel 1: Green glowing checkmark validating a safe quote transaction; Panel 2: Red digital energy wall blocking a price tampering attempt; Panel 3: Floating amber approval card on a web dashboard with a human hand clicking an "Approve" button; Panel 4: Flashing red warning siren icon and encrypted data packets being incinerated before reaching an external hacker domain. High contrast, sleek UI mockup.
```

---

<a name="bloque-6"></a>
## 🚀 Bloque 6: Trazabilidad Forense, Modelo de Negocio y Cierre (4:15 - 5:00)
### *El Execution Trace, retorno de inversión y conclusión final*

#### 🎬 Indicaciones Visuales:
* **4:15 - 4:35:** Pantalla completa del Dashboard de AgentGuard en la sección **Execution Traces**. Se muestran las 4 filas perfectamente correlacionadas con IDs únicos, sellos de tiempo, usuario delegador, política aplicada y latencias.
* **4:35 - 5:00:** Plano final del equipo de desarrollo, créditos institucionales (ITU — Universidad Nacional de Cuyo), logo oficial del proyecto y la frase final en tipografía heroica.

#### 🎙️ Locución:
> "Al terminar la secuencia, el Dashboard exhibe el verdadero poder de la plataforma: el **Execution Trace**. Una tabla forense donde cada decisión queda correlacionada de forma atómica: quién pidió la acción, en nombre de qué usuario, sobre qué recurso, bajo qué regla legal y con qué evidencia.
> 
> Esto transforma la ecuación económica para las empresas: el retorno de inversión de AgentGuard no es 'ahorrar dinero en logs', sino **permitir que las organizaciones pasen de agentes de IA meramente experimentales a agentes verdaderamente operativos en producción**, porque ahora existe una frontera de seguridad verificable y auditable ante cualquier marco regulatorio.
> 
> No estamos construyendo otro chatbot. No estamos construyendo otro IAM tradicional. Estamos construyendo el perímetro de gobernanza que la era agentic necesita.
> 
> **AgentGuard: Autonomía real para tus agentes de Inteligencia Artificial, sin darles carta blanca.**"

#### 🎨 Prompt para ilustrar este bloque con Gemini / Imagen 3:
```text
Futuristic mission-control command center dashboard displaying clean, dark-themed execution traces with audit logs, timestamps, user identities, and policy tags. Professional software branding screen with the text "AgentGuard: Autonomous Control for Agentic AI", elegant typography, cinematic lighting, corporate cybersecurity aesthetic.
```
