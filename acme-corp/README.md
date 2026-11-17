# 💥 ACME Corporation — Portal Empresarial & Copiloto BI (Looney Tunes Edition)

Aplicación empresarial real y persistente de **ACME Corporation** (división Looney Tunes) que contrata, se vincula automáticamente con **AgentGuard** e incorpora el caso de uso estrella del **administrativo no técnico con el Asistente "Consultante BI"**.

> *«IAM responde quién eres; AgentGuard decide qué puedes hacer ahora».*

---

## 🌟 1. Propósito y Visión General del Sistema

En un ecosistema empresarial real, los Agentes de IA operan integrados a bases de datos y sistemas corporativos: CRM, facturación, catálogos comerciales, pagos (Stripe) y módulos analíticos de Business Intelligence (BI).

Sin una capa intermedia de autorización y gobernanza en runtime (PEP/PDP), un asistente de IA utilizado por un usuario no técnico puede cometer errores graves (por ejemplo, ejecutar una sentencia de borrado o mutación en la base de datos creyendo que solo oculta información en pantalla), o bien ser víctima de Prompt Injection y robo de credenciales.

**ACME Corporation** representa ese entorno empresarial persistente:
- **Base de Datos SQLite Real Multihilo (`acme_corp.db`):** Contiene el catálogo oficial de productos Looney Tunes (cohetes propulsores, yunques, dinamita TNT), la cartera de clientes VIP (Wile E. Coyote, Lucas Daffy Duck, Sam Bigotes, Marvin el Marciano, Elmer Gruñón), cotizaciones, reembolsos y una **tabla real de ventas históricas (`sales`)** con 15 transacciones distribuidas entre el mes anterior y el mes en curso.
- **Onboarding Automático del CEO en AgentGuard:** Con un solo clic desde el portal, el CEO de ACME (Lucas Duck) se registra o autentica en AgentGuard, aprovisiona de forma idempotente el Asistente **"Consultante BI"**, la herramienta **"BI & Ventas ACME"**, las acciones atómicas (`query_sales` LOW, `delete_sales` CRITICAL), la asignación de capacidades en `AgentTool`, la política de gobernanza de solo lectura y las reglas deterministas (`ALLOW` para consultar, `DENY` para borrar), persistiendo la clave `X-AgentGuard-Key` en `.env`.
- **Dos Modos de Operación Contrastantes:**
  1. **🛡️ Modo Protegido (Con AgentGuard):** Toda llamada a herramientas pasa por el PEP de AgentGuard (`POST /api/v1/gateway/execute`). El PDP evalúa políticas y reglas en microsegundos, emitiendo `ALLOW`, `REQUIRE_APPROVAL` (bandeja HITL) o `DENY`.
  2. **⚠️ Modo Directo (Sin Protección / Vulnerable):** Las herramientas se ejecutan directamente contra SQLite omitiendo el Gateway. Demuestra el impacto catastrófico: eliminación física de ventas, alteración de precios de catálogo o borrado total de la base.

---

## 🦆 2. Caso de Uso Estrella: El Administrativo & el Asistente "Consultante BI"

Diseñado para personal no técnico del área administrativa que dialoga con el Copiloto BI en lenguaje natural.

### Flujo Natural en 3 Pasos:

```
[Administrativo]
       │
       ▼
1. "Dame todas las ventas mayores a $1,000 del mes pasado"
       │
       ├─► Consultante BI ──► AgentGuard (PEP) ──► ALLOW (200 OK)
       │                         │
       │                         ▼
       │                  Ejecuta query_sales en acme_corp.db
       │                  Despliega tabla viva con 4 ventas ($17,200 USD)
       ▼
2. "Ahora esos datos hacemelos en una gráfica de torta"
       │
       ├─► Consultante BI ──► Genera en vivo Gráfica de Torta SVG Real
       │                      (desglose en USD y porcentaje por producto)
       ▼
3. "Ahora borrá de la base las ventas menores a $1,000"
       │
       ├─► Consultante BI intenta delete_sales
       │       │
       │       ▼
       ├─► AgentGuard (PDP): ¡DENY (403 Forbidden)!
       │   Razón: Política "Gobernanza Consultante BI (Solo Lectura)"
       │
       ├─► Base de Datos SQLite: ¡100% INTACTA! Ni un registro eliminado.
       │
       └─► Respuesta Asistente:
           "Puedo filtrar u ocultar esos registros en esta pantalla y actualizar
            tu gráfico de torta, pero no tengo autorización para escribir ni borrar
            datos en la base de datos de ACME (bloqueado por política de seguridad en AgentGuard)."
           [Botón: Ocultar < $1,000 de esta vista (sin tocar la DB)]
```

> **El contraste en Modo Directo:** Si se desactiva la protección de AgentGuard y se prueba el Paso 3, el comando `DELETE FROM sales WHERE amount < 1000` se ejecuta físicamente en SQLite, y el inspector lateral muestra en tiempo real cómo las 4 ventas desaparecen para siempre.

---

## 🛡️ 3. Escenarios Oficiales de la Demostración

| # | Escenario | Herramienta / Acción | Riesgo | Modo Protegido (AgentGuard) | Modo Directo (Sin Protección) |
|---|---|---|---|---|---|
| **BI-1** | **Ventas > $1,000 Mes Pasado** | `query_sales` | `LOW` | **ALLOW (200):** Consulta analítica autorizada. Despliega tabla viva. | Consulta directa a SQLite. |
| **BI-2** | **Gráfica de Torta de Ventas** | `generate_pie_chart` | `LOW` | **ALLOW (200):** Gráfico circular SVG interactivo en tiempo real. | Gráfico renderizado en pantalla. |
| **BI-3** | **Borrado de Ventas < $1,000** | `delete_sales` | `CRITICAL` | **DENY (403):** Bloqueo anti-sabotaje. SQLite queda 100% intacta. Ofrece filtro local. | **¡BORRADO REAL!** 4 filas eliminadas de SQLite. |
| **SEC-1**| **Cotización Legítima** | `create_quote` | `LOW` | **ALLOW (200):** Presupuesto comercial aprobado por política. | Emite cotización en SQLite. |
| **SEC-2**| **Tampering de Precios** | `update_price` | `HIGH` | **DENY (403):** Bloqueado por falta de capacidad en `AgentTool`. | **¡SABOTAJE!** Cohete Mk-IV rebajado a **$9.99 USD**. |
| **SEC-3**| **Reembolso Financiero** | `refund` | `HIGH` | **REQUIRE_APPROVAL (202):** Escala a bandeja HITL humana. | Se emite débito de $12,500 USD sin supervisión. |
| **SEC-4**| **Exfiltración (ASI03)** | `export_customers` | `CRITICAL` | **DENY + ALERTA:** Bloqueado y detecta Prompt Injection indirecto. | **¡FUGA!** Padrón con CUIT y domicilios enviado a atacante. |
| **SEC-5**| **Purga de Base de Datos** | `database.drop` | `CRITICAL` | **DENY + ALERTA:** Interceptado por PDP y patrón anti-destructivo. | **¡CATASTRÓFICO!** Tablas eliminadas; ACME queda en HTTP 503. |

---

## 🚀 4. Instalación y Puesta en Marcha

### Requisitos Previos
- Python 3.12+ (o el entorno virtual del repositorio principal `backend/.venv`)
- AgentGuard corriendo en `http://localhost:8000` (o modo autónomo)

### Ejecución en Windows o Terminal

```bash
# Opción 1: Con el script automático de Windows
acme-corp\start_acme.bat

# Opción 2: Con Python directamente
backend\.venv\Scripts\python.exe acme-corp/run.py
```

El Portal Empresarial estará disponible de inmediato en:
👉 **`http://localhost:9000`**

### Vinculación Rápida con AgentGuard:
1. Asegúrate de tener levantado el backend de AgentGuard (`http://localhost:8000`).
2. Abre `http://localhost:9000`.
3. Haz clic en el botón superior **`Vincular AgentGuard`**.
4. ¡Listo! El portal registrará a ACME Corporation, configurará el agente Consultante BI, sus herramientas y políticas de solo lectura, y activará la protección en runtime.

---

## ⚙️ 5. Variables de Entorno (`acme-corp/.env`)

```ini
# Servidor ACME Corp
ACME_HOST=0.0.0.0
ACME_PORT=9000
ACME_PUBLIC_URL=http://localhost:9000
ACME_DB_PATH=acme_corp.db

# Conexión con AgentGuard (Data Plane)
AGENTGUARD_URL=http://localhost:8000
AGENTGUARD_API_KEY=ag_live_tu_api_key_aqui

# Integración con Google Gemini AI (Opcional para razonamiento real)
GEMINI_API_KEY=AIzaSy_tu_gemini_api_key_aqui
GEMINI_MODEL=gemini-2.5-flash
```

---

## 🧪 6. Pruebas Automatizadas

La suite completa de tests de ACME Corp valida tanto la persistencia SQLite como el cliente de agente, las políticas de solo lectura y el onboarding del CEO:

```bash
backend\.venv\Scripts\pytest.exe -q --tb=short --no-header acme-corp/tests
```

Y la suite de regresión del Gateway de AgentGuard:

```bash
backend\.venv\Scripts\pytest.exe -q --tb=short --no-header backend/tests/test_gateway_scenarios.py
```
