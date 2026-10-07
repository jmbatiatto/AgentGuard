Portada by Mateo

# **1\. AgentGuard – Control de Agentes de IA**

**Problema**  
La adopción de agentes autónomos de IA está llevando a los sistemas de inteligencia artificial "  
"a ejecutar acciones reales: consultar información, utilizar APIs, modificar registros, enviar "  
"comunicaciones y ejecutar procesos. Esto genera una necesidad de controlar qué puede hacer cada "  
"agente y registrar sus acciones.

**Solución propuesta**  
AgentGuard sería una plataforma de gestión, autorización y auditoría de agentes de IA. Cada agente "  
"tendría una identidad y un conjunto de permisos. Antes de ejecutar una acción, el sistema verificaría "  
"la política correspondiente y permitiría o bloquearía la operación.

**Ejemplo**  
Agente de ventas:  
✓ Consultar clientes  
✓ Consultar productos  
✓ Crear presupuestos  
✗ Modificar precios  
✗ Eliminar clientes  
✗ Realizar pagos

**Diferenciación**  
La propuesta sería una capa de control entre los agentes de IA y los recursos de una organización, "  
"combinando identidad, permisos, políticas, autorización, auditoría y trazabilidad.

**MVP**  
• Registro de organizaciones, usuarios y agentes.  
• Sistema de permisos y políticas.  
• API Gateway.  
• Simulación de agentes.  
• Registro y consulta de acciones.  
• Bloqueo de acciones no autorizadas.  
• Dashboard de auditoría.  
• Alertas ante comportamientos anómalos.

**Modelo de negocio**  
SaaS B2B. Plan gratuito limitado para desarrolladores y planes pagos según cantidad de agentes, "  
"acciones, usuarios, retención de logs e integraciones. Posible versión Enterprise.

**Potencial de startup**  
Muy alto. El cliente empresarial tiene un incentivo económico claro: controlar los riesgos asociados "  
"a agentes de IA con acceso a sistemas y datos.

**Sprint 0: Inicio del proyecto AgentGuard** 

Duración:

1 semana.

Objetivo del Sprint 0:

Preparar la base del proyecto antes de comenzar el desarrollo iterativo del API Gateway y sistema de control de identidades. Se busca definir el alcance, objetivos, requerimientos iniciales, arquitectura técnica y entorno de trabajo.

Contexto del proyecto:

AgentGuard es una aplicación de seguridad y control (SaaS B2B) diseñada para organizaciones que utilizan agentes de IA conectados a sistemas y datos. Permite gestionar identidades, aplicar políticas de control de acceso mediante un API Gateway, simular comportamientos de agentes y auditar acciones en tiempo real con alertas automáticas.

Objetivos del proyecto:

1. Control de Acceso: Gestionar identidades de organizaciones, usuarios y agentes mediante un API Gateway centralizado.  
2. Seguridad y Filtrado: Bloquear y auditar en tiempo real acciones no autorizadas o intentos de bypass.  
3. Monitoreo y Trazabilidad: Ofrecer un dashboard visual para la consulta de logs de acciones y alertas ante comportamientos anómalos.  
4. Entorno de Simulación: Proveer un espacio seguro para probar y verificar el comportamiento de los agentes antes de su despliegue productivo.

Roles del equipo:

| Rol | Responsabilidad | Especialista/s |
| :---- | :---- | :---- |
| Product Owner | Define el alcance y prioridades del producto. | Agustín Belardinelli |
| Scrum Master | Facilita las reuniones y seguimiento del sprint. | Juan Martín Battiato (cualquiera) |
| Desarrolladores  | Implementan la funcionalidad del sistema (API Gateway, backend y frontend). | Frontend: Juan Martín Batiatto y Mateo Ortega Backend: Agustín Belardinelli y Jonathan Araujo  |
| Diseñador UI/UX | Define la interfaz y experiencia de usuario del dashboard de auditoría. | Mateo Ortega |

Historias de usuario iniciales:

* Como administrador de una organización, quiero registrar una cuenta para dar de alta mi empresa en la plataforma.  
* Como desarrollador, quiero registrar agentes de IA para asociarlos a mi organización y asignarles credenciales.  
* Como administrador, quiero configurar políticas de acceso para definir qué recursos pueden consumir los agentes.  
* Como operador, quiero ver un dashboard con el registro (logs) de las acciones ejecutadas por los agentes.  
* Como sistema, quiero bloquear automáticamente solicitudes no autorizadas y generar alertas ante comportamientos anómalos.  
* Como administrador, quiero simular ejecuciones de agentes en un entorno de pruebas controlado.

Tareas del Sprint 0:

* Definir la arquitectura tecnológica (API Gateway, base de datos y tecnologías de backend/frontend).  
* Crear el repositorio central del proyecto en GitHub.  
* Configurar los entornos de desarrollo, bases de datos y herramientas de integración continua.  
* Diseñar los wireframes o mockups iniciales del dashboard de auditoría y gestión.  
* Crear el docum+000ento de requerimientos funcionales y no funcionales (basado en los alcances del MVP).  
* Establecer la Definición de Hecho (Definition of Done \- DoD).  
* Establecer la Definición de Listo (Definition of Ready \- DoR).

Sprint 0 en Trello:

El tablero está organizado en cuatro columnas principales:

1. Product Backlog:  
   * HU1 – Registro de organizaciones y usuarios.  
   * HU2 – Registro y gestión de agentes de IA.  
   * HU3 – Configuración de políticas de acceso.  
   * HU4 – Visualización del dashboard de auditoría (logs).  
   * HU5 – Bloqueo de acciones no autorizadas y alertas.  
   * HU6 – Entorno de simulación de agentes.  
2. Sprint Backlog – Sprint 0:  
   * Definir arquitectura del API Gateway y componentes.  
   * Definir roles de cada miembro del equipo.  
   * Crear wireframe de la interfaz del dashboard y panel de control.  
   * Definir Definition of Done (DoD).  
   * Definir Definition of Ready (DoR).  
3. En Proceso:  
   * Diseñar el wireframe de la vista principal del dashboard.  
   * Ajustes de la estructura técnica y flujos de red.  
4. Hecho:  
   * Crear repositorio en GitHub.

Entregables del Sprint 0:

* Documento de visión del producto y arquitectura técnica.  
* Backlog inicial con historias de usuario priorizadas.  
* Prototipo visual (boceto de login, gestión de agentes y dashboard de auditoría).  
* Repositorio de código inicial con estructura base.  
* Plan de sprints futuros (estimación del MVP y roadmap).

Planificación del Sprint 1:

En el Sprint 1 se recomienda implementar:

* Módulo de autenticación y registro de organizaciones/usuarios.  
* Estructura base del API Gateway para enrutar peticiones iniciales.  
* Primeras reglas del sistema de permisos y políticas.

