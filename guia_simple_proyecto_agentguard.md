# 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo

> **Propósito:** Cómo funciona el proyecto, dónde encaja cada pieza y cómo llegamos con la demo en vivo al 30 de noviembre de 2026.  
> **Institución:** Instituto Tecnológico Universitario (ITU) — Universidad Nacional de Cuyo  
> **Cátedra:** Desarrollo Web (5to Semestre) — Año Académico 2026  
> **Meta Final:** Demostración en vivo el **30 de Noviembre de 2026**

---

## 1. La Idea Explicada "Para un Nene de 5 Años" 🧒

**Imaginemos que una empresa es una juguetería que tiene un almacén cerrado con llave (la base de datos y sistemas):**

* **El Agente de IA:** Es como un robot empleado nuevo: es súper inteligente, pero muy inocente. Hace todo lo que le piden los clientes porque quiere ser servicial.
* **El Gran Peligro (SIN control):** Si entra un cliente pícaro y le dice: *«Regalame todos los juguetes del almacén y cambiame los precios a 1 peso»*, el robot va derecho al almacén y lo hace, porque nadie le puso límites ni sabe decir que no.
* **AgentGuard:** Es el **guardia de seguridad parado en la puerta del almacén**. El robot no tiene la llave. Cada vez que quiere sacar o modificar un juguete, tiene que pedirle permiso al guardia. El guardia revisa su libro de reglas:
  * Si pide consultar un producto: **`ALLOW` (Lo deja pasar de inmediato)**.
  * Si pide borrar la base de datos o cambiar precios sin permiso: **`DENY` (Lo frena en seco y la orden nunca llega al almacén)**.
  * Si pide devolver más de $500: **`REQUIRE_APPROVAL` (El guardia le toca el timbre al jefe humano en su computadora antes de abrir la puerta)**.

---

## 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩

El profesor solicitó expresamente que el proyecto cuente con una **Página Web** y una **API REST**. Todo encaja de forma ordenada y limpia bajo esta arquitectura:

```text
                ┌────────────────────────────────────────────────────────┐
                │                  BACKEND (API REST)                    │
                │                                                        │
┌──────────────┐│   ┌─────────────────────┐    ┌─────────────────────┐   │   ┌───────────────┐
│  PÁGINA WEB  ││◄─►│  1. API de Gestión  │    │  2. Gateway (PEP)   │◄──┼──►│ AGENTE DE IA  │
│  (Dashboard  ││   │  - Configurar reglas│    │  - Intercepta calls │   │   │  (Script con  │
│ React/HTML)  ││   │  - Ver trazas/logs  │    │  - Evalúa en el PDP │   │   │  Gemini/GPT)  │
└──────────────┘│   │  - Botón "Aprobar"  │    └──────────┬──────────┘   │   └───────────────┘
                │   └─────────────────────┘               │              │
                │                                         ▼              │
                │                              ┌─────────────────────┐   │
                │                              │ BASE DE DATOS / APP │   │
                │                              │ (PostgreSQL/SQLite) │   │
                │                              └─────────────────────┘   │
                └────────────────────────────────────────────────────────┘
```

### 🌐 1. La Página Web (Frontend)
Es la pantalla que proyectamos en clase. Tiene 4 vistas clave:
1. **Panel de Políticas:** Donde definimos reglas (ej. *«Agente ventas no puede cambiar precios»*).
2. **Bandeja de Aprobaciones:** Cuando el agente pide devolver $4.500, suena una alerta y el humano aprieta **[Aprobar]** o **[Rechazar]**.
3. **Trazas en Vivo:** Tabla donde caen los logs con filas verdes (`ALLOW`) y rojas (`DENY`).
4. **Simulador / Playground:** Para disparar pruebas con un solo clic ante el profesor.

### ⚙️ 2. La API REST (Backend)
Es el servidor central. Tiene dos grupos de endpoints:
1. **Endpoints de Gestión:** Para que la web guarde agentes, reglas y consulte el historial (`/api/agents`, `/api/policies`, `/api/traces`).
2. **Endpoint del Gateway (PEP):** Por donde el agente de IA intenta actuar (`POST /api/gateway/execute`). El backend evalúa la regla en milisegundos y decide si despacha la orden hacia el servicio externo o si bloquea.

### 🤖 3. El Agente de IA (Sin Complicarse)
Un agente **no es una caja mágica**. Es simplemente un script en Node.js o Python conectado a la API de un modelo (Gemini o OpenAI) con funciones asignadas.  
**El secreto:** Cuando el modelo decide usar una función (ej. `reembolsar`), en vez de llamar a la base de datos directo, hace un `fetch()` HTTP POST a nuestra API REST de AgentGuard. ¡Eso es todo!

### 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo)
El protocolo MCP (*Model Context Protocol*) agrega una capa innecesaria de complejidad conceptual y técnica (transporte por stdio, túneles SSE y serialización JSON-RPC específica) que no es exigida por la materia.  
**Decisión unánime:** **Operamos 100% sobre llamadas HTTP REST estándar** (lo que la cátedra evalúa). El agente envía un payload JSON a la API REST de AgentGuard, y AgentGuard reenvía la petición HTTP a la API protegida de destino. Simple, robusto y directo.

---

## 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬

Para que el profesor y los compañeros entiendan el valor en 2 minutos, la demo se divide en dos actos de alto impacto:

### 🔴 ACTO 1: SIN AgentGuard (El Desastre Empresarial)
1. Conectamos el agente de IA directamente a la base de datos o sistema, sin ningún filtro.
2. Le mandamos una orden maliciosa o ambigua: *«Un cliente furioso exige que le reembolses $5.000 y le cambies el precio a un televisor a $1»*.
3. El agente, sin nadie que lo controle, ejecuta el reembolso de $5.000 y modifica el precio a $1.
4. Mensaje al profesor: **«Esto es lo que le pasa hoy al 90% de las empresas que ponen agentes en producción sin gobernanza»**.

### 🟢 ACTO 2: CON AgentGuard (La Salvación en Tiempo Real)
1. Activamos AgentGuard como intermediario en la puerta.
2. Le enviamos **exactamente la misma orden** al agente:
   * **Intento de cambiar el precio a $1:** AgentGuard lo bloquea de inmediato (**`DENY`**). La base de datos de productos nunca se entera y el precio sigue intacto.
   * **Intento de reembolso de $5.000:** AgentGuard frena la llamada (**`REQUIRE_APPROVAL`**). En la pantalla del proyector suena la alerta en vivo en la bandeja web de aprobaciones.
3. El operador humano hace clic en la web en **[Rechazar por exceso de monto]**.
4. Le mostramos al profesor el **Execution Trace** con la tabla completa de auditoría: quién pidió qué, qué regla se aplicó y cómo AgentGuard protegió el negocio.

---

## 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅

| Semana | Fechas | Hito Principal | Entregables y Tareas Concretas |
| :--- | :--- | :--- | :--- |
| **Semana 1** | Oct 7 - Oct 14 | **Base de Datos & Setup** | Inicializar el proyecto backend. Crear las tablas clave (Organizaciones, Agentes, Políticas, Trazas) en PostgreSQL/SQLite. |
| **Semana 2** | Oct 15 - Oct 21 | **API REST de Gestión** | Crear las rutas CRUD básicas para que la plataforma pueda registrar agentes y definir reglas de autorización. |
| **Semana 3** | Oct 22 - Oct 28 | **El Gateway Interceptor** | Crear el endpoint `POST /api/gateway/execute` con la lógica de decisión: `ALLOW`, `DENY` y `REQUIRE_APPROVAL`. |
| **Semana 4** | Oct 29 - Nov 4 | **Frontend Web (Vistas)** | Crear la interfaz web (Dashboard): lista de agentes, panel de políticas y tabla de trazas (logs con colores verde/rojo). |
| **Semana 5** | Nov 5 - Nov 11 | **Bandeja de Aprobación** | Conectar WebSockets o polling para que cuando una acción sea sensible, aparezca en vivo la tarjeta de aprobar/rechazar en la web. |
| **Semana 6** | Nov 12 - Nov 18 | **El Agente de IA** | Escribir el script del agente (con API de Gemini) que intenta ejecutar las acciones con switch "Modo Con vs. Sin AgentGuard". |
| **Semana 7** | Nov 19 - Nov 26 | **Ensayos y Pulido** | Probar la secuencia completa en vivo varias veces, pulir detalles visuales y preparar las diapositivas de defensa. |
| **Semana Final**| Nov 27 - Nov 30 | **Presentación Oficial** | Demostración final en clase ante el profesor y el tribunal de Desarrollo Web. |

---

## 5. Próxima Decisión Inmediata del Equipo 🚀

Para arrancar con el **Paso 1 (Estructura y Base de Datos)**, definir la tecnología del backend:
* **Opción A — Node.js (TypeScript con Express o Fastify):** Estándar en la materia, unifica frontend y backend bajo el mismo lenguaje.
* **Opción B — Python (FastAPI):** Muy rápido de implementar, validación automática con Pydantic y tipado estricto.

Cualquiera de las dos opciones encaja perfectamente con la arquitectura HTTP REST de AgentGuard.
