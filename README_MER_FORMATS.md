# 🛡️ AgentGuard - Modelo Entidad-Relación (MER v2.0)

Este repositorio contiene el **Modelo Entidad-Relación (MER) v2.0** de **AgentGuard: Runtime Authorization & Governance for AI Agents**, convertido a múltiples formatos vectoriales y editables compatibles con **Draw.io (diagrams.net)**, **VS Code**, **Mermaid** y **PlantUML**.

---

## 📁 Archivos Generados

| Archivo | Formato / Tipo | Cómo usarlo |
| :--- | :--- | :--- |
| [`AgentGuard_MER_v2.0.drawio`](./AgentGuard_MER_v2.0.drawio) | **Nativo Draw.io** | Abrir directamente en **VS Code** con la extensión de Draw.io o en [app.diagrams.net](https://app.diagrams.net). |
| [`AgentGuard_MER_v2.0.xml`](./AgentGuard_MER_v2.0.xml) | **XML Draw.io** | Archivo estándar para importar en [draw.io](https://app.diagrams.net) vía `File > Open From > Device`. |
| [`AgentGuard_MER_v2.0.mmd`](./AgentGuard_MER_v2.0.mmd) | **Mermaid ER** | Importable en Draw.io vía `Arrange > Insert > Advanced > Mermaid` o visualizable en GitHub / Markdown. |
| [`AgentGuard_MER_v2.0.puml`](./AgentGuard_MER_v2.0.puml) | **PlantUML ER** | Importable en Draw.io vía `Arrange > Insert > Advanced > PlantUML`. |
| [`AgentGuard_Schema.sql`](./AgentGuard_Schema.sql) | **SQL DDL (PostgreSQL)** | Importable en Draw.io vía `Arrange > Insert > Advanced > SQL` para auto-generar tablas y relaciones. |

---

## 🚀 Cómo abrir y editar el diagrama

### Opción 1: En VS Code (Recomendada si tienen la extensión)
1. Se ha instalado la extensión oficial **Draw.io Integration** (`hediet.vscode-drawio`).
2. Simplemente haz clic en el archivo [`AgentGuard_MER_v2.0.drawio`](./AgentGuard_MER_v2.0.drawio) dentro de VS Code.
3. Se abrirá el editor visual interactivo de Draw.io directamente dentro de tu ventana de código. Podrás mover cajas, editar atributos y guardar cambios sin salir de VS Code.

### Opción 2: En la web (Para tus compañeros en cualquier lugar)
Tus compañeros no necesitan instalar nada:
1. Abre [https://app.diagrams.net](https://app.diagrams.net).
2. Haz clic en **"Open Existing Diagram"** (o arrastra y suelta el archivo [`AgentGuard_MER_v2.0.drawio`](./AgentGuard_MER_v2.0.drawio) en el navegador).
3. ¡Listo! El diagrama cargará con todas las entidades, colores, atributos, notas y conectores listos para editar y exportar a PNG, SVG o PDF.

### Opción 3: Importación rápida desde el menú de Draw.io
Si prefieren pegar el código directamente:
- **Con Mermaid**: En Draw.io, ve a `+ (Insert) > Advanced > Mermaid` y pega el contenido de [`AgentGuard_MER_v2.0.mmd`](./AgentGuard_MER_v2.0.mmd).
- **Con SQL**: En Draw.io, ve a `+ (Insert) > Advanced > SQL` y pega el contenido de [`AgentGuard_Schema.sql`](./AgentGuard_Schema.sql).

---

## 🏛️ Estructura del Modelo MER v2.0

### Entidades Principales (12 Tablas)
1. **Organization** (Tenant multi-empresa): Aislamiento de datos.
2. **User**: Usuarios humanos (`ADMIN`, `OPERATOR`, `APPROVER`).
3. **Agent**: Identidad del agente de IA (`ACTIVE`, `SUSPENDED`, `REVOKED`).
4. **Tool**: Herramientas externas (protocolos `MCP`, `REST`).
5. **ToolAction**: Acciones atómicas de herramientas con nivel de riesgo (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
6. **AgentTool**: Tabla intermedia N:N que gestiona permisos y configuraciones específicas por agente.
7. **Policy**: Contenedor de reglas con prioridad y estado activo/inactivo.
8. **PolicyRule**: Reglas de decisión (`ALLOW`, `DENY`, `REQUIRE_APPROVAL`) con condiciones JSONB y prioridad.
9. **Execution**: Registro de solicitudes en tiempo real con contexto sanitizado.
10. **Approval**: Cola de aprobación humana (HITL - Human in the loop).
11. **Alert**: Incidentes de seguridad con ciclo de vida (`OPEN`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`).
12. **AuditEvent**: Bitácora inmutable de auditoría para cumplimiento y trazabilidad.
