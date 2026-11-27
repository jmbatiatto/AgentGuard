export type ExplorerViewId = 'mer-postgres' | 'mer-acme' | 'runtime-flow'
export type ExplorerAccent = 'emerald' | 'cyan' | 'sky' | 'amber' | 'rose'
export type ColumnBadge = 'PK' | 'FK' | 'UK' | 'GIN' | 'ENUM' | 'NOT NULL' | 'NULL' | 'DEFAULT'

export interface EntityColumn {
  name: string
  type: string
  badges: ColumnBadge[]
  note?: string
}

export interface ExplorerLayer {
  id: string
  label: string
  description: string
  accent: ExplorerAccent
}

export interface ExplorerNodeItem {
  id: string
  kind: 'table' | 'service'
  title: string
  subtitle: string
  layerId: string
  accent: ExplorerAccent
  badge?: string
  summary: string
  whyDesigned: string
  securityNotes: string[]
  defenseQuestion: string
  defenseAnswer: string
  docLink: string
  docLabel: string
  columns?: EntityColumn[]
  highlights?: string[]
  rankHint?: number
}

export interface ExplorerEdgeItem {
  id: string
  source: string
  target: string
  label: string
  chenCardinality?: string
  onDelete?: string
  relationTitle: string
  relationType: string
  whyThisRelation: string
  integrityRationale: string
  defenseTip: string
  animatedByDefault?: boolean
  edgeStyle?: 'solid' | 'dashed'
}

export interface TourStep {
  id: string
  title: string
  badge: string
  narrative: string
  focusNodeIds: string[]
  focusEdgeId?: string
  selectNodeId?: string
  selectEdgeId?: string
  layerId?: string
}

export interface RuntimeScenarioPreset {
  id: string
  code: string
  title: string
  action: string
  verdict: 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'DENY + ALERT'
  httpStatus: string
  accent: 'emerald' | 'rose' | 'amber'
  summary: string
  narrative: string
  activeNodeIds: string[]
  activeEdgeIds: string[]
  focusNodeId: string
  keyFacts: string[]
}

export interface ExplorerViewConfig {
  id: ExplorerViewId
  shortLabel: string
  title: string
  subtitle: string
  direction: 'LR' | 'TB'
  stats: Array<{ label: string; value: string }>
  layers: ExplorerLayer[]
  nodes: ExplorerNodeItem[]
  edges: ExplorerEdgeItem[]
  tourSteps: TourStep[]
  scenarios?: RuntimeScenarioPreset[]
}

const merPostgresView: ExplorerViewConfig = {
  id: 'mer-postgres',
  shortLabel: 'MER PostgreSQL 16',
  title: 'Modelo Relacional y Físico de AgentGuard (PostgreSQL 16)',
  subtitle:
    'Esquema multi-tenant de 13 tablas, 96 columnas, 24 claves foráneas físicas, 10 ENUMs nativos, 4 índices GIN en JSONB y 6 migraciones Alembic (001 a 006).',
  direction: 'LR',
  stats: [
    { label: 'Tablas PostgreSQL 16', value: '13' },
    { label: 'FKs físicas (Vol. 01)', value: '24 FKs' },
    { label: 'Índices GIN JSONB', value: '4 GIN' },
    { label: 'Migraciones Alembic', value: '001 a 006' },
    { label: 'Tipos ENUM nativos', value: '10' }
  ],
  layers: [
    {
      id: 'tenant',
      label: 'Identidad y Multi-Tenant',
      description:
        'Raíz del aislamiento lógico por organization_id, cuentas humanas RBAC y llaves SHA-256 del Data Plane.',
      accent: 'emerald'
    },
    {
      id: 'catalog',
      label: 'Catálogo N:N y Acciones',
      description:
        'Agentes autónomos, herramientas REST, tabla asociativa agent_tools y acciones atómicas por nivel de riesgo.',
      accent: 'cyan'
    },
    {
      id: 'pdp',
      label: 'Motor PDP 5D',
      description:
        'Políticas organizacionales y reglas deterministas con predicados JSONB indexados con GIN.',
      accent: 'sky'
    },
    {
      id: 'runtime',
      label: 'Runtime, HITL y Forense',
      description:
        'Trazas inmutables con latencia real, aprobaciones humanas 202 Accepted, alertas OWASP y auditoría polimórfica.',
      accent: 'amber'
    }
  ],
  nodes: [
    {
      id: 'organizations',
      kind: 'table',
      title: 'organizations',
      subtitle: 'Raíz Multi-Tenant SaaS B2B',
      layerId: 'tenant',
      accent: 'emerald',
      badge: 'Mig. 001 + 004',
      rankHint: 0,
      summary:
        'Entidad raíz del modelo multi-tenant: su clave primaria id actúa como discriminador organization_id en 8 tablas dependientes y almacena la postura de seguridad del cliente en JSONB.',
      whyDesigned:
        'Se diseñó como raíz jerárquica única para garantizar que toda entidad de negocio pertenezca exactamente a un tenant. En la migración 004 se incorporó la columna settings JSONB sin índice GIN porque siempre se recupera completa por PK al iniciar cada evaluación del Gateway PEP.',
      securityNotes: [
        'Aislamiento multi-tenant lógico en capa de aplicación (resolve_tenant_org_id y ensure_same_tenant) sin RLS nativo de PostgreSQL.',
        'Clave primaria UUID v4 generada en el motor con gen_random_uuid() para impedir enumeración secuencial (Anti-IDOR).',
        'settings define por defecto fail_closed=true, mask_sensitive=true, max_autonomous_amount=5000.0 y configuración SIEM HMAC-SHA256.'
      ],
      defenseQuestion: '¿Por qué organizations.settings es JSONB pero no tiene índice GIN a diferencia de las otras 4 columnas JSONB?',
      defenseAnswer:
        'Porque settings nunca se consulta filtrando por subcampos entre múltiples tenants: siempre se lee completa por clave primaria (db.get(Organization, org_id)). Evitar un índice GIN innecesario ahorra espacio y sobrecarga de escritura en mutaciones de ajustes.',
      docLink: '/volumenes/01_MER_RELACIONAL_Y_FISICO_DB',
      docLabel: 'Vol. 01 — MER Relacional y Físico DB',
      columns: [
        {
          name: 'id',
          type: 'UUID',
          badges: ['PK', 'NOT NULL', 'DEFAULT'],
          note: 'server_default gen_random_uuid() nativo en PostgreSQL 16'
        },
        {
          name: 'name',
          type: 'VARCHAR(255)',
          badges: ['NOT NULL'],
          note: 'Nombre corporativo de la organización cliente'
        },
        {
          name: 'created_at',
          type: 'TIMESTAMPTZ',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'now() en UTC'
        },
        {
          name: 'settings',
          type: 'JSONB',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default {} (Mig. 004); sin índice GIN: postura fail_closed, mask_sensitive, max_autonomous_amount y SIEM'
        }
      ]
    },
    {
      id: 'users',
      kind: 'table',
      title: 'users',
      subtitle: 'Operadores Humanos y RBAC',
      layerId: 'tenant',
      accent: 'emerald',
      badge: 'Mig. 001 + 005 + 006',
      rankHint: 1,
      summary:
        'Representa exclusivamente a los operadores humanos del Control Plane con 5 roles RBAC, autenticación bcrypt y rotación forzada de contraseñas temporales.',
      whyDesigned:
        'Separar cuentas humanas (users) de identidades autónomas (agents) materializa el principio Zero Trust del Control Plane: solo los humanos se autentican con JWT y pueden gobernar políticas o resolver aprobaciones HITL. Las migraciones 005 y 006 sumaron hashed_password nullable y must_change_password sin romper filas existentes.',
      securityNotes: [
        'hashed_password usa bcrypt (passlib/bcrypt) truncado a 72 bytes; jamás persiste contraseñas en claro.',
        'must_change_password (Mig. 006, default false) bloquea el panel mediante ForcePasswordChangeModal hasta rotar la clave temporal.',
        'email es UNIQUE global e indexado; role restringido al ENUM nativo user_role_enum (ADMIN, OPERATOR, APPROVER, AUDITOR, VIEWER).'
      ],
      defenseQuestion: '¿Por qué users.hashed_password admite NULL y qué rol cumple must_change_password?',
      defenseAnswer:
        'hashed_password se agregó en la migración 005 como nullable para compatibilidad con usuarios previos o cuentas sin credencial local. must_change_password (migración 006) se fija en true cuando un ADMIN crea usuarios invitados, forzando su cambio en POST /api/v1/auth/change-password al primer ingreso.',
      docLink: '/volumenes/02_MER_CONCEPTUAL_CHEN_Y_ATRIBUTOS',
      docLabel: 'Vol. 02 — MER Conceptual Chen y Atributos',
      columns: [
        {
          name: 'id',
          type: 'UUID',
          badges: ['PK', 'NOT NULL', 'DEFAULT'],
          note: 'gen_random_uuid()'
        },
        {
          name: 'organization_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. organizations.id (ON DELETE CASCADE), indexado'
        },
        {
          name: 'email',
          type: 'VARCHAR(255)',
          badges: ['UK', 'NOT NULL'],
          note: 'UNIQUE global e indexado (ix_users_email)'
        },
        {
          name: 'hashed_password',
          type: 'VARCHAR(255)',
          badges: ['NULL'],
          note: 'Hash criptográfico bcrypt (Mig. 005)'
        },
        {
          name: 'must_change_password',
          type: 'BOOLEAN',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default false (Mig. 006); fuerza rotación en primer login'
        },
        {
          name: 'role',
          type: 'user_role_enum',
          badges: ['ENUM', 'NOT NULL', 'DEFAULT'],
          note: 'ADMIN, OPERATOR, APPROVER, AUDITOR, VIEWER (default OPERATOR)'
        },
        {
          name: 'created_at',
          type: 'TIMESTAMPTZ',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'now() en UTC'
        }
      ]
    },
    {
      id: 'api_keys',
      kind: 'table',
      title: 'api_keys',
      subtitle: 'Credenciales Data Plane (SHA-256)',
      layerId: 'tenant',
      accent: 'emerald',
      badge: 'Mig. 003',
      rankHint: 1,
      summary:
        'Tabla 13 del esquema: autentica a los clientes del Data Plane (agentes, ACME Corp y CLI) mediante la cabecera X-AgentGuard-Key sin otorgar acceso al Control Plane.',
      whyDesigned:
        'Incorporada en la migración 003 para desacoplar la autenticación de agentes de las sesiones JWT humanas. Guarda únicamente el prefijo visible (12 caracteres indexados) y el digest SHA-256 del secreto ag_live_ generado con 256 bits de entropía; el secreto en claro se exhibe una única vez al crearse.',
      securityNotes: [
        'hashed_key almacena solo SHA-256 hex (64 caracteres): un volcado de la base no expone llaves utilizables.',
        'verify_api_key cachea validaciones activas en Redis DB 0 bajo ag:apikey:{sha256} (TTL 60 s) y las invalida al revocar.',
        'is_active permite revocación lógica inmediata sin perder trazabilidad histórica del tenant.'
      ],
      defenseQuestion: '¿Por qué api_keys usa SHA-256 en lugar de bcrypt como users.hashed_password?',
      defenseAnswer:
        'Porque las llaves ag_live_ se generan con secrets.token_urlsafe(32) (256 bits de entropía criptográfica), donde ataques por diccionario son inviables y SHA-256 ofrece validación sub-milisegundo en el Gateway. En cambio, las contraseñas humanas tienen baja entropía y requieren un hash lento con sal como bcrypt.',
      docLink: '/volumenes/01_MER_RELACIONAL_Y_FISICO_DB',
      docLabel: 'Vol. 01 — Diccionario Físico (api_keys)',
      columns: [
        {
          name: 'id',
          type: 'UUID',
          badges: ['PK', 'NOT NULL', 'DEFAULT'],
          note: 'gen_random_uuid()'
        },
        {
          name: 'organization_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. organizations.id (ON DELETE CASCADE), indexado'
        },
        {
          name: 'name',
          type: 'VARCHAR(100)',
          badges: ['NOT NULL'],
          note: 'Nombre descriptivo de la credencial'
        },
        {
          name: 'key_prefix',
          type: 'VARCHAR(12)',
          badges: ['NOT NULL'],
          note: 'Prefijo visible (ag_live_...) indexado en ix_api_keys_key_prefix'
        },
        {
          name: 'hashed_key',
          type: 'VARCHAR(255)',
          badges: ['NOT NULL'],
          note: 'Digest SHA-256 en hexadecimal (nunca secreto en claro)'
        },
        {
          name: 'created_at',
          type: 'TIMESTAMPTZ',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'now() en UTC'
        },
        {
          name: 'expires_at',
          type: 'TIMESTAMPTZ',
          badges: ['NULL'],
          note: 'Vencimiento opcional validado en runtime'
        },
        {
          name: 'is_active',
          type: 'BOOLEAN',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default true; revocación lógica (soft delete)'
        }
      ]
    },
    {
      id: 'agents',
      kind: 'table',
      title: 'agents',
      subtitle: 'Identidades de Agentes de IA',
      layerId: 'catalog',
      accent: 'cyan',
      badge: 'Mig. 001',
      rankHint: 2,
      summary:
        'Registra cada agente autónomo gobernado (ej. Agente de Ventas, Consultante BI) vinculado obligatoriamente a un humano patrocinador y a un estado de ciclo de vida.',
      whyDesigned:
        'Todo agente de IA debe tener responsabilidad humana explícita (owner_user_id con ON DELETE RESTRICT) y un estado revocable al instante (ACTIVE, SUSPENDED, REVOKED). Si el agente no está ACTIVE, el Gateway PEP corta la ejecución con DENY antes de consultar reglas.',
      securityNotes: [
        'owner_user_id usa ON DELETE RESTRICT: no se puede eliminar un usuario mientras patrocine agentes activos.',
        'Cambiar status a SUSPENDED o REVOKED actúa como interruptor de emergencia inmediato en el Data Plane.',
        'Ningún agente tiene permisos implícitos sobre herramientas: requiere vínculo habilitado en agent_tools.'
      ],
      defenseQuestion: '¿Por qué un agente de IA no puede existir sin owner_user_id en la base de datos?',
      defenseAnswer:
        'Por gobernanza y rendición de cuentas: todo actor autónomo en AgentGuard debe responder ante un responsable humano identificable. La FK NOT NULL con ON DELETE RESTRICT garantiza que ningún agente quede huérfano al eliminar cuentas.',
      docLink: '/volumenes/02_MER_CONCEPTUAL_CHEN_Y_ATRIBUTOS',
      docLabel: 'Vol. 02 — Entidad AGENT y relación PATROCINA',
      columns: [
        {
          name: 'id',
          type: 'UUID',
          badges: ['PK', 'NOT NULL', 'DEFAULT'],
          note: 'gen_random_uuid()'
        },
        {
          name: 'organization_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. organizations.id (ON DELETE CASCADE), indexado'
        },
        {
          name: 'owner_user_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. users.id (ON DELETE RESTRICT), humano patrocinador'
        },
        {
          name: 'name',
          type: 'VARCHAR(255)',
          badges: ['NOT NULL'],
          note: 'Nombre identificatorio del agente autónomo'
        },
        {
          name: 'purpose',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Propósito operativo declarado'
        },
        {
          name: 'status',
          type: 'agent_status_enum',
          badges: ['ENUM', 'NOT NULL', 'DEFAULT'],
          note: 'ACTIVE, SUSPENDED, REVOKED (default ACTIVE)'
        },
        {
          name: 'created_at',
          type: 'TIMESTAMPTZ',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'now() en UTC'
        }
      ]
    },
    {
      id: 'tools',
      kind: 'table',
      title: 'tools',
      subtitle: 'Catálogo de Sistemas REST Destino',
      layerId: 'catalog',
      accent: 'cyan',
      badge: 'ADR-003 REST Puro',
      rankHint: 2,
      summary:
        'Catálogo de APIs REST externas protegidas por AgentGuard (CRM, Stripe, Catálogo, BI y Ventas ACME) con su endpoint_url de despacho.',
      whyDesigned:
        'Estandarizado 100% en protocolo HTTP REST puro según ADR-003 (suprimiendo complejidad accidental de MCP/gRPC). Desacopla la dirección técnica del servicio externo respecto de las acciones atómicas (tool_actions) y de qué agentes pueden consumirlo (agent_tools).',
      securityNotes: [
        'protocol está restringido por contrato Pydantic v2 a Literal["REST"] con default REST.',
        'endpoint_url es invocado únicamente por PEPGatewayService tras un veredicto ALLOW o aprobación HITL APPROVED.',
        'No puede eliminarse una herramienta si tiene ejecuciones forenses registradas (FK RESTRICT desde executions.tool_id).'
      ],
      defenseQuestion: '¿Por qué se separan tools y tool_actions en dos tablas distintas en lugar de listar endpoints en una sola?',
      defenseAnswer:
        'Porque una misma API externa (por ejemplo BI & Ventas ACME) expone operaciones con perfiles de riesgo opuestos: query_sales (riesgo LOW, lectura) y delete_sales (riesgo CRITICAL, destructiva). Separarlas permite aplicar privilegio mínimo a nivel de acción atómica.',
      docLink: '/volumenes/DECISIONS',
      docLabel: 'ADRs — ADR-003 Estandarización HTTP REST',
      columns: [
        {
          name: 'id',
          type: 'UUID',
          badges: ['PK', 'NOT NULL', 'DEFAULT'],
          note: 'gen_random_uuid()'
        },
        {
          name: 'organization_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. organizations.id (ON DELETE CASCADE), indexado'
        },
        {
          name: 'name',
          type: 'VARCHAR(255)',
          badges: ['NOT NULL'],
          note: 'Nombre de la herramienta corporativa'
        },
        {
          name: 'protocol',
          type: 'VARCHAR(50)',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default REST (ADR-003)'
        },
        {
          name: 'endpoint_url',
          type: 'VARCHAR(1024)',
          badges: ['NOT NULL'],
          note: 'URL base hacia la cual despacha el Gateway PEP'
        },
        {
          name: 'description',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Descripción funcional del sistema externo'
        },
        {
          name: 'created_at',
          type: 'TIMESTAMPTZ',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'now() en UTC'
        }
      ]
    },
    {
      id: 'agent_tools',
      kind: 'table',
      title: 'agent_tools',
      subtitle: 'Entidad Asociativa N:N (AUTORIZADO_EN)',
      layerId: 'catalog',
      accent: 'cyan',
      badge: 'Asociativa N:N + GIN',
      rankHint: 3,
      summary:
        'Reificación física de la relación conceptual N:M AUTORIZADO_EN entre agents y tools, con interruptor enabled y configuración JSONB indexada con GIN.',
      whyDesigned:
        'No es una tabla puente muda: posee atributos propios (enabled, config, created_at) y PK sustituta id además de UNIQUE(agent_id, tool_id) (uq_agent_tool_pair) para manipularse como recurso REST. Hereda el aislamiento multi-tenant vía sus padres (3FN sin duplicar organization_id).',
      securityNotes: [
        'Primera barrera de privilegio mínimo en runtime: si no existe fila con enabled=true, el PEP emite DENY inmediato (Escenario 2 update_price).',
        'uq_agent_tool_pair impide vínculos duplicados entre el mismo agente y herramienta.',
        'config JSONB cuenta con índice GIN (idx_agent_tools_config_gin) para consultas rápidas de parámetros contextuales.'
      ],
      defenseQuestion: '¿Por qué agent_tools tiene PK propia id si ya existe una restricción UNIQUE(agent_id, tool_id)?',
      defenseAnswer:
        'Porque es una entidad asociativa con atributos propios (enabled y config JSONB) gestionada como recurso por SQLAlchemy y la API REST. Usar PK sustituta UUID mantiene uniformidad en las 13 tablas mientras uq_agent_tool_pair garantiza la unicidad del par.',
      docLink: '/volumenes/02_MER_CONCEPTUAL_CHEN_Y_ATRIBUTOS',
      docLabel: 'Vol. 02 — Relación Asociativa AUTORIZADO_EN',
      columns: [
        {
          name: 'id',
          type: 'UUID',
          badges: ['PK', 'NOT NULL', 'DEFAULT'],
          note: 'gen_random_uuid() (PK sustituta)'
        },
        {
          name: 'agent_id',
          type: 'UUID',
          badges: ['FK', 'UK', 'NOT NULL'],
          note: 'Ref. agents.id (ON DELETE CASCADE); par único uq_agent_tool_pair'
        },
        {
          name: 'tool_id',
          type: 'UUID',
          badges: ['FK', 'UK', 'NOT NULL'],
          note: 'Ref. tools.id (ON DELETE CASCADE); par único uq_agent_tool_pair'
        },
        {
          name: 'enabled',
          type: 'BOOLEAN',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default true; interruptor de autorización del vínculo'
        },
        {
          name: 'config',
          type: 'JSONB',
          badges: ['GIN', 'NOT NULL', 'DEFAULT'],
          note: 'Índice GIN idx_agent_tools_config_gin; configuración contextual'
        },
        {
          name: 'created_at',
          type: 'TIMESTAMPTZ',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'now() en UTC'
        }
      ]
    },
    {
      id: 'tool_actions',
      kind: 'table',
      title: 'tool_actions',
      subtitle: 'Acciones Atómicas y Nivel de Riesgo',
      layerId: 'catalog',
      accent: 'cyan',
      badge: 'Granularidad Fina',
      rankHint: 3,
      summary:
        'Unidad mínima evaluada por el motor PDP 5D: cada operación concreta (create_quote, update_price, refund, export_customers, query_sales, delete_sales) con su risk_level.',
      whyDesigned:
        'Conceptualmente es una entidad débil dependiente de tools (identificador lógico UNIQUE(tool_id, action_name) = uq_tool_action_name), implementada con PK sustituta id porque policy_rules y executions la referencian directamente. Permite clasificar el riesgo intrínseco de cada operación.',
      securityNotes: [
        'risk_level usa el ENUM nativo risk_level_enum (LOW, MEDIUM, HIGH, CRITICAL) con default LOW.',
        'Todo bloqueo DENY sobre una acción con risk_level HIGH o CRITICAL genera automáticamente una alerta en la tabla alerts.',
        'Hereda el tenant desde tools.organization_id y no puede borrarse si tiene reglas o ejecuciones asociadas (FK RESTRICT).'
      ],
      defenseQuestion: '¿Es tool_actions una entidad débil y por qué tiene su propia clave primaria UUID?',
      defenseAnswer:
        'Sí: su identidad de negocio depende de la herramienta padre mediante UNIQUE(tool_id, action_name) y su existencia depende de ella (ON DELETE CASCADE). Se implementa con clave sustituta UUID porque tanto policy_rules como executions necesitan referenciarla mediante una sola columna FK.',
      docLink: '/volumenes/02_MER_CONCEPTUAL_CHEN_Y_ATRIBUTOS',
      docLabel: 'Vol. 02 — Granularidad Atómica (tool_actions)',
      columns: [
        {
          name: 'id',
          type: 'UUID',
          badges: ['PK', 'NOT NULL', 'DEFAULT'],
          note: 'gen_random_uuid()'
        },
        {
          name: 'tool_id',
          type: 'UUID',
          badges: ['FK', 'UK', 'NOT NULL'],
          note: 'Ref. tools.id (ON DELETE CASCADE); par único uq_tool_action_name'
        },
        {
          name: 'action_name',
          type: 'VARCHAR(255)',
          badges: ['UK', 'NOT NULL'],
          note: 'Nombre único por herramienta (create_quote, refund, delete_sales)'
        },
        {
          name: 'risk_level',
          type: 'risk_level_enum',
          badges: ['ENUM', 'NOT NULL', 'DEFAULT'],
          note: 'LOW, MEDIUM, HIGH, CRITICAL (default LOW)'
        },
        {
          name: 'description',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Descripción del impacto funcional de la acción'
        },
        {
          name: 'created_at',
          type: 'TIMESTAMPTZ',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'now() en UTC'
        }
      ]
    },
    {
      id: 'policies',
      kind: 'table',
      title: 'policies',
      subtitle: 'Contenedores de Políticas de Negocio',
      layerId: 'pdp',
      accent: 'sky',
      badge: 'Prioridad PDP',
      rankHint: 2,
      summary:
        'Agrupa conjuntos coherentes de reglas deterministas por organización (ej. Gobernanza Consultante BI Solo Lectura) con prioridad global e interruptor is_active.',
      whyDesigned:
        'Permite administrar bloques completos de gobernanza (activar, pausar o priorizar una política entera) sin editar regla por regla. En la evaluación PDP, solo participan reglas cuyas políticas padre tengan is_active=true dentro del mismo organization_id.',
      securityNotes: [
        'Aislamiento estricto por organization_id (ON DELETE CASCADE); ninguna política cruza fronteras de tenant.',
        'priority define precedencia determinista cuando compiten múltiples políticas activas.',
        'Toda creación, edición o borrado queda auditado en audit_events y protegido por require_admin_user (403 ante X-Agent-Id).'
      ],
      defenseQuestion: '¿Qué ocurre si un administrador desactiva todas las políticas de su organización (is_active = false)?',
      defenseAnswer:
        'Por el principio Fail-Closed, PDPEngine no encuentra ninguna regla activa coincidente y retorna DENY por defecto (evaluated_policy_rule_id = NULL). Pausar políticas nunca abre el acceso: siempre cierra el perímetro.',
      docLink: '/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST',
      docLabel: 'Vol. 03 — Motor PDP Determinista 5D',
      columns: [
        {
          name: 'id',
          type: 'UUID',
          badges: ['PK', 'NOT NULL', 'DEFAULT'],
          note: 'gen_random_uuid()'
        },
        {
          name: 'organization_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. organizations.id (ON DELETE CASCADE), indexado'
        },
        {
          name: 'name',
          type: 'VARCHAR(255)',
          badges: ['NOT NULL'],
          note: 'Nombre descriptivo de la política'
        },
        {
          name: 'description',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Objetivo y contexto de gobernanza'
        },
        {
          name: 'priority',
          type: 'INTEGER',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default 100; ordena contenedores en el PDP'
        },
        {
          name: 'is_active',
          type: 'BOOLEAN',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default true; solo políticas activas se evalúan'
        },
        {
          name: 'created_at',
          type: 'TIMESTAMPTZ',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'now() en UTC'
        }
      ]
    },
    {
      id: 'policy_rules',
      kind: 'table',
      title: 'policy_rules',
      subtitle: 'Reglas Deterministas 5D (JSONB + GIN)',
      layerId: 'pdp',
      accent: 'sky',
      badge: 'Fail-Closed + GIN',
      rankHint: 4,
      summary:
        'Define el veredicto exacto (ALLOW, DENY, REQUIRE_APPROVAL) para una acción atómica, opcionalmente acotado a un agente específico y condicionado por predicados JSONB.',
      whyDesigned:
        'Concentra la expresividad contextual del PDP 5D sin recurrir a tablas EAV rígidas: conditions JSONB admite umbrales numéricos (amount <= 10000, >= 500), listas de destinos permitidos o bloqueados y operadores de comparación, acelerados mediante índice GIN. target_agent_id nullable habilita reglas globales multi-agente.',
      securityNotes: [
        'effect usa rule_effect_enum con default DENY (Fail-Closed desde el propio DDL).',
        'Desempate determinista en SQL: regla específica > Policy.priority > Rule.priority > CASE (DENY < REQUIRE_APPROVAL < ALLOW).',
        'tool_action_id usa ON DELETE RESTRICT para evitar borrar acciones reguladas sin revisar sus políticas.'
      ],
      defenseQuestion: '¿Cómo resuelve el motor PDP un empate exacto de prioridad entre una regla ALLOW y una regla DENY?',
      defenseAnswer:
        'De forma 100% determinista en la cláusula SQL ORDER BY mediante una expresión CASE que asigna peso 1 a DENY, 2 a REQUIRE_APPROVAL y 3 a ALLOW. Ante cualquier empate siempre prevalece la postura más restrictiva (Fail-Closed).',
      docLink: '/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST',
      docLabel: 'Vol. 03 — Operadores JSONB y Precedencia PDP',
      columns: [
        {
          name: 'id',
          type: 'UUID',
          badges: ['PK', 'NOT NULL', 'DEFAULT'],
          note: 'gen_random_uuid()'
        },
        {
          name: 'policy_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. policies.id (ON DELETE CASCADE), indexado'
        },
        {
          name: 'priority',
          type: 'INTEGER',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default 100; desempate favorece DENY'
        },
        {
          name: 'effect',
          type: 'rule_effect_enum',
          badges: ['ENUM', 'NOT NULL', 'DEFAULT'],
          note: 'ALLOW, DENY, REQUIRE_APPROVAL (default DENY)'
        },
        {
          name: 'tool_action_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. tool_actions.id (ON DELETE RESTRICT), indexado'
        },
        {
          name: 'target_agent_id',
          type: 'UUID',
          badges: ['FK', 'NULL'],
          note: 'Ref. agents.id (CASCADE); NULL indica regla global multi-agente'
        },
        {
          name: 'conditions',
          type: 'JSONB',
          badges: ['GIN', 'NOT NULL', 'DEFAULT'],
          note: 'Índice GIN idx_policy_rules_conditions_gin; predicados 5D'
        },
        {
          name: 'created_at',
          type: 'TIMESTAMPTZ',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'now() en UTC'
        }
      ]
    },
    {
      id: 'executions',
      kind: 'table',
      title: 'executions',
      subtitle: 'Trazas Forenses Inmutables del PEP',
      layerId: 'runtime',
      accent: 'amber',
      badge: 'Mig. 001 + 002 + GIN',
      rankHint: 5,
      summary:
        'Entidad central de observabilidad: intersecta agente, delegador, herramienta, acción atómica y regla evaluada, guardando request_context sanitizado (LLM06) y latency_ms real.',
      whyDesigned:
        'Registra cada intercepción real del Data Plane como evidencia forense de solo inserción (salvo la transición controlada de status al resolver un ticket HITL). Incluye índice compuesto (organization_id, timestamp) para listados paginados del dashboard e índice GIN sobre request_context. En la migración 002 se agregó latency_ms para telemetría real.',
      securityNotes: [
        'request_context se sanitiza con SanitizerService (OWASP LLM06) antes de persistir cuando mask_sensitive=true.',
        'FKs RESTRICT hacia agents, tools y tool_actions impiden borrar entidades que poseen historial de ejecución.',
        'latency_ms registra el tiempo real medido con time.perf_counter() en PEPGatewayService, nunca un valor simulado.',
        'Incluye FKs físicas adicionales a users (delegator_user_id SET NULL) y tools (tool_id RESTRICT) verificadas en Vol. 01.'
      ],
      defenseQuestion: '¿Por qué executions.evaluated_policy_rule_id y latency_ms admiten NULL si toda ejecución se evalúa y mide?',
      defenseAnswer:
        'evaluated_policy_rule_id es NULL cuando ninguna regla coincide o el agente carece de vínculo AgentTool y el sistema aplica DENY por Fail-Closed. latency_ms es nullable porque se incorporó en la migración 002 sobre filas históricas previas; toda ejecución nueva guarda siempre su latencia real medida.',
      docLink: '/volumenes/01_MER_RELACIONAL_Y_FISICO_DB',
      docLabel: 'Vol. 01 — Trazas Forenses (executions)',
      columns: [
        {
          name: 'id',
          type: 'UUID',
          badges: ['PK', 'NOT NULL', 'DEFAULT'],
          note: 'gen_random_uuid()'
        },
        {
          name: 'organization_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. organizations.id (CASCADE); índice compuesto con timestamp'
        },
        {
          name: 'agent_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. agents.id (ON DELETE RESTRICT)'
        },
        {
          name: 'delegator_user_id',
          type: 'UUID',
          badges: ['FK', 'NULL'],
          note: 'Ref. users.id (ON DELETE SET NULL)'
        },
        {
          name: 'tool_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. tools.id (ON DELETE RESTRICT)'
        },
        {
          name: 'tool_action_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. tool_actions.id (ON DELETE RESTRICT)'
        },
        {
          name: 'resource',
          type: 'VARCHAR(255)',
          badges: ['NULL'],
          note: 'Recurso corporativo objetivo de la invocación'
        },
        {
          name: 'request_context',
          type: 'JSONB',
          badges: ['GIN', 'NOT NULL', 'DEFAULT'],
          note: 'Índice GIN; parámetros ya sanitizados (OWASP LLM06)'
        },
        {
          name: 'decision',
          type: 'policy_decision_enum',
          badges: ['ENUM', 'NOT NULL'],
          note: 'ALLOW, DENY, REQUIRE_APPROVAL (sin default, siempre explícita)'
        },
        {
          name: 'status',
          type: 'execution_status_enum',
          badges: ['ENUM', 'NOT NULL', 'DEFAULT'],
          note: 'PENDING_APPROVAL, REJECTED, EXECUTED (default EXECUTED)'
        },
        {
          name: 'evaluated_policy_rule_id',
          type: 'UUID',
          badges: ['FK', 'NULL'],
          note: 'Ref. policy_rules.id (SET NULL); NULL en Fail-Closed sin regla'
        },
        {
          name: 'timestamp',
          type: 'TIMESTAMPTZ',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'now() UTC; índice compuesto idx_executions_org_timestamp'
        },
        {
          name: 'latency_ms',
          type: 'DOUBLE PRECISION',
          badges: ['NULL'],
          note: 'Latencia real medida con time.perf_counter() (Mig. 002)'
        }
      ]
    },
    {
      id: 'approvals',
      kind: 'table',
      title: 'approvals',
      subtitle: 'Bandeja HITL Asíncrona (202 Accepted)',
      layerId: 'runtime',
      accent: 'amber',
      badge: 'HITL + FOR UPDATE',
      rankHint: 6,
      summary:
        'Materializa los tickets Human-in-the-Loop cuando el PDP decide REQUIRE_APPROVAL, con relación estricta 1 : 0..1 sobre executions y TTL calculado de 900 segundos.',
      whyDesigned:
        'Evita bloquear conexiones HTTP esperando supervisión humana (ADR-007): el PEP responde 202 Accepted de inmediato, persiste Approval(PENDING) y notifica por WebSockets. No almacena una columna expires_at redundante: la expiración se calcula en runtime como now - created_at > 900 s.',
      securityNotes: [
        'execution_id es UNIQUE y NOT NULL: una ejecución nunca puede generar dos aprobaciones concurrentes.',
        'PEPGatewayService.resolve_approval() usa bloqueo pesimista SELECT ... FOR UPDATE para erradicar carreras TOCTOU (doble reembolso).',
        'Solo usuarios humanos con rol APPROVER o ADMIN pueden resolver tickets; si supera 900 s transiciona a EXPIRED y la ejecución a REJECTED.'
      ],
      defenseQuestion: '¿Cómo impide AgentGuard que dos supervisores aprueben el mismo reembolso simultáneamente o tras expirar?',
      defenseAnswer:
        'Al invocar POST /api/v1/approvals/{id}/resolve, el servicio adquiere un bloqueo pesimista de fila con with_for_update(), verifica que status siga en PENDING y evalúa el TTL de 900 s contra created_at. La segunda petición concurrente espera el lock y recibe 400 Bad Request al encontrar el ticket ya resuelto.',
      docLink: '/volumenes/04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO',
      docLabel: 'Vol. 04 — Máquina de Estados HITL (ApprovalStatus)',
      columns: [
        {
          name: 'id',
          type: 'UUID',
          badges: ['PK', 'NOT NULL', 'DEFAULT'],
          note: 'gen_random_uuid()'
        },
        {
          name: 'execution_id',
          type: 'UUID',
          badges: ['FK', 'UK', 'NOT NULL'],
          note: 'Ref. executions.id (ON DELETE CASCADE) + UNIQUE (1 : 0..1)'
        },
        {
          name: 'assigned_approver_id',
          type: 'UUID',
          badges: ['FK', 'NULL'],
          note: 'Ref. users.id (ON DELETE SET NULL); rol APPROVER o ADMIN'
        },
        {
          name: 'status',
          type: 'approval_status_enum',
          badges: ['ENUM', 'NOT NULL', 'DEFAULT'],
          note: 'PENDING, APPROVED, REJECTED, EXPIRED (default PENDING), indexado'
        },
        {
          name: 'resolution_reason',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Motivo de aprobación, rechazo o expiración por TTL'
        },
        {
          name: 'resolved_at',
          type: 'TIMESTAMPTZ',
          badges: ['NULL'],
          note: 'Instante UTC en que un humano resolvió el ticket'
        },
        {
          name: 'created_at',
          type: 'TIMESTAMPTZ',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'now() UTC; base de cálculo del TTL de 900 s (15 min)'
        }
      ]
    },
    {
      id: 'alerts',
      kind: 'table',
      title: 'alerts',
      subtitle: 'Incidentes de Seguridad OWASP y SIEM',
      layerId: 'runtime',
      accent: 'rose',
      badge: 'OWASP ASI + SIEM',
      rankHint: 6,
      summary:
        'Registra incidentes de seguridad disparados por ThreatDetectorService (ASI01, ASI03, ASI04, ASI05) o bloqueos DENY sobre acciones HIGH/CRITICAL, con ciclo de vida SIEM independiente.',
      whyDesigned:
        'A diferencia de approvals, una alerta constituye evidencia de seguridad que puede sobrevivir a su ejecución de origen o existir sin ejecución asociada; por eso alerts.execution_id es nullable con ON DELETE SET NULL y sin restricción UNIQUE física, aunque el PEP crea a lo sumo una alerta por ejecución.',
      securityNotes: [
        'Nacen en estado OPEN (alert_status_enum) y transicionan a INVESTIGATING, RESOLVED o DISMISSED vía PATCH /alerts/{id}/status.',
        'Disparan difusión inmediata NEW_ALERT por WebSocket del tenant y webhook SIEM firmado con HMAC-SHA256 si está activo.',
        'Incluye FK física organization_id (ON DELETE CASCADE) para aislar incidentes por tenant.'
      ],
      defenseQuestion: '¿Por qué alerts.execution_id usa ON DELETE SET NULL mientras approvals.execution_id usa ON DELETE CASCADE?',
      defenseAnswer:
        'Porque un ticket de aprobación HITL carece de sentido sin su ejecución suspendida (dependencia existencial fuerte, CASCADE). Una alerta, en cambio, es evidencia SIEM con ciclo de vida investigativo independiente y debe sobrevivir aunque se purguen ejecuciones antiguas.',
      docLink: '/volumenes/01_MER_RELACIONAL_Y_FISICO_DB',
      docLabel: 'Vol. 01 — Reglas de Integridad (alerts vs approvals)',
      columns: [
        {
          name: 'id',
          type: 'UUID',
          badges: ['PK', 'NOT NULL', 'DEFAULT'],
          note: 'gen_random_uuid()'
        },
        {
          name: 'organization_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. organizations.id (ON DELETE CASCADE), indexado'
        },
        {
          name: 'execution_id',
          type: 'UUID',
          badges: ['FK', 'NULL'],
          note: 'Ref. executions.id (ON DELETE SET NULL); evidencia SIEM autónoma'
        },
        {
          name: 'title',
          type: 'VARCHAR(255)',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default Incidente de Seguridad'
        },
        {
          name: 'description',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Detalle técnico del vector detectado o regla violada'
        },
        {
          name: 'severity',
          type: 'alert_severity_enum',
          badges: ['ENUM', 'NOT NULL', 'DEFAULT'],
          note: 'LOW, MEDIUM, HIGH, CRITICAL (default MEDIUM)'
        },
        {
          name: 'status',
          type: 'alert_status_enum',
          badges: ['ENUM', 'NOT NULL', 'DEFAULT'],
          note: 'OPEN, INVESTIGATING, RESOLVED, DISMISSED (default OPEN), indexado'
        },
        {
          name: 'resolved_by_user_id',
          type: 'UUID',
          badges: ['FK', 'NULL'],
          note: 'Ref. users.id (ON DELETE SET NULL); operador que resuelve'
        },
        {
          name: 'created_at',
          type: 'TIMESTAMPTZ',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'now() en UTC'
        }
      ]
    },
    {
      id: 'audit_events',
      kind: 'table',
      title: 'audit_events',
      subtitle: 'Bitácora Administrativa Inmutable',
      layerId: 'runtime',
      accent: 'rose',
      badge: 'Polimórfica + GIN',
      rankHint: 5,
      summary:
        'Registro append-only de mutaciones administrativas del Control Plane (políticas, reglas, agentes, API keys y ajustes) con actor polimórfico sin FK física.',
      whyDesigned:
        'Registra quién cambió qué y cuándo dentro del Control Plane. Su columna actor_id no declara clave foránea física porque referencia polimórficamente a un USER, un AGENT o al SYSTEM según actor_type, y porque la traza forense debe permanecer intacta incluso si el actor es eliminado.',
      securityNotes: [
        'Accesible exclusivamente por usuarios humanos con rol ADMIN o AUDITOR (GET /api/v1/audit-events); agentes bloqueados con 403.',
        'Columna física metadata JSONB (mapeada como event_metadata en ORM para no colisionar con Base.metadata) indexada con GIN.',
        'Índice compuesto idx_audit_events_org_timestamp acelera auditorías cronológicas por organización.'
      ],
      defenseQuestion: '¿Por qué audit_events.actor_id no es una clave foránea física hacia la tabla users?',
      defenseAnswer:
        'Por dos motivos: en primer lugar, el actor es polimórfico (actor_type puede ser USER, AGENT o SYSTEM) y SQL no permite una FK apuntando simultáneamente a múltiples tablas; en segundo lugar, una bitácora forense inmutable debe conservar el UUID del actor aunque esa cuenta se elimine posteriormente.',
      docLink: '/volumenes/02_MER_CONCEPTUAL_CHEN_Y_ATRIBUTOS',
      docLabel: 'Vol. 02 — Relación Polimórfica REALIZADO_POR',
      columns: [
        {
          name: 'id',
          type: 'UUID',
          badges: ['PK', 'NOT NULL', 'DEFAULT'],
          note: 'gen_random_uuid()'
        },
        {
          name: 'organization_id',
          type: 'UUID',
          badges: ['FK', 'NOT NULL'],
          note: 'Ref. organizations.id (CASCADE); índice compuesto con timestamp'
        },
        {
          name: 'actor_type',
          type: 'actor_type_enum',
          badges: ['ENUM', 'NOT NULL'],
          note: 'USER, AGENT, SYSTEM'
        },
        {
          name: 'actor_id',
          type: 'UUID',
          badges: ['NOT NULL'],
          note: 'Referencia polimórfica indexada SIN clave foránea física'
        },
        {
          name: 'event_type',
          type: 'VARCHAR(255)',
          badges: ['NOT NULL'],
          note: 'Evento administrativo (POLICY_CREATED, API_KEY_REVOKED), indexado'
        },
        {
          name: 'metadata',
          type: 'JSONB',
          badges: ['GIN', 'NOT NULL', 'DEFAULT'],
          note: 'Índice GIN idx_audit_events_metadata_gin (ORM: event_metadata)'
        },
        {
          name: 'timestamp',
          type: 'TIMESTAMPTZ',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'now() UTC; índice compuesto idx_audit_events_org_timestamp'
        }
      ]
    }
  ],
  edges: [
    {
      id: 'pg-org-users',
      source: 'organizations',
      target: 'users',
      label: '1 : N',
      chenCardinality: 'ORG (0,N) — (1,1) USER',
      onDelete: 'ON DELETE CASCADE',
      relationTitle: 'R1 TIENE_USUARIO (organizations -> users)',
      relationType: 'Clave foránea 1:N de aislamiento multi-tenant',
      whyThisRelation:
        'Cada cuenta humana pertenece obligatoriamente a una única organización tenant (users.organization_id NOT NULL), mientras una organización puede tener cero o múltiples operadores con distintos roles RBAC.',
      integrityRationale:
        'ON DELETE CASCADE asegura que al dar de baja un tenant completo se eliminen en bloque todas sus cuentas humanas sin dejar registros huérfanos.',
      defenseTip:
        'Aclara que en base de datos el mínimo de usuarios por organización es 0, pero a nivel de negocio POST /auth/register-org crea atómicamente al menos 1 usuario ADMIN.'
    },
    {
      id: 'pg-org-apikeys',
      source: 'organizations',
      target: 'api_keys',
      label: '1 : N',
      chenCardinality: 'ORG (0,N) — (1,1) API_KEY',
      onDelete: 'ON DELETE CASCADE',
      relationTitle: 'R5 EMITE (organizations -> api_keys)',
      relationType: 'Clave foránea 1:N de credenciales Data Plane',
      whyThisRelation:
        'Una API Key autentica solicitudes del Data Plane para una única organización. Esto permite que verify_api_key valide inmediatamente que request.organization_id coincide con el tenant propietario de la llave (403 ante mismatch).',
      integrityRationale:
        'ON DELETE CASCADE revoca y limpia automáticamente todas las credenciales emitidas si desaparece la organización.',
      defenseTip:
        'Recuerda mencionar que api_keys se vincula a organizations (no a agents): una misma llave permite auto-descubrir todos los agentes del tenant vía GET /gateway/context.'
    },
    {
      id: 'pg-org-agents',
      source: 'organizations',
      target: 'agents',
      label: '1 : N',
      chenCardinality: 'ORG (0,N) — (1,1) AGENT',
      onDelete: 'ON DELETE CASCADE',
      relationTitle: 'R2 GOBIERNA (organizations -> agents)',
      relationType: 'Clave foránea 1:N de inventario autónomo',
      whyThisRelation:
        'Cada agente de IA existe dentro de un único espacio organizacional, evitando que políticas o ejecuciones de un cliente puedan invocar agentes de otro tenant.',
      integrityRationale:
        'ON DELETE CASCADE alinea el ciclo de vida del inventario de agentes con la existencia de su organización propietaria.',
      defenseTip:
        'Resalta que todas las consultas de AgentsView filtran por organization_id obtenido del JWT humano, nunca confiado ciegamente al cliente.'
    },
    {
      id: 'pg-org-tools',
      source: 'organizations',
      target: 'tools',
      label: '1 : N',
      chenCardinality: 'ORG (0,N) — (1,1) TOOL',
      onDelete: 'ON DELETE CASCADE',
      relationTitle: 'R3 REGISTRA (organizations -> tools)',
      relationType: 'Clave foránea 1:N de catálogo REST por tenant',
      whyThisRelation:
        'Cada empresa registra sus propias integraciones REST y endpoints privados (como ACME Corp :9000), manteniendo catálogos completamente aislados entre organizaciones.',
      integrityRationale:
        'ON DELETE CASCADE elimina el catálogo privado del tenant al darse de baja la organización.',
      defenseTip:
        'Enfatiza que tool_actions no repite organization_id porque hereda el aislamiento directamente a través de esta FK en tools (3FN).'
    },
    {
      id: 'pg-org-policies',
      source: 'organizations',
      target: 'policies',
      label: '1 : N',
      chenCardinality: 'ORG (0,N) — (1,1) POLICY',
      onDelete: 'ON DELETE CASCADE',
      relationTitle: 'R4 DEFINE (organizations -> policies)',
      relationType: 'Clave foránea 1:N de gobernanza multi-tenant',
      whyThisRelation:
        'Las políticas deterministas son privadas de cada tenant: el motor PDPEngine siempre filtra Policy.organization_id == request.organization_id al buscar reglas candidatas.',
      integrityRationale:
        'ON DELETE CASCADE propaga la baja del tenant hacia sus políticas y, en cadena, hacia sus policy_rules.',
      defenseTip:
        'Señala que al mutar reglas de una política se realiza invalidación best-effort en Redis bajo el patrón policies:{organization_id}:*.'
    },
    {
      id: 'pg-org-executions',
      source: 'organizations',
      target: 'executions',
      label: '1 : N',
      chenCardinality: 'ORG (0,N) — (1,1) EXECUTION',
      onDelete: 'ON DELETE CASCADE',
      relationTitle: 'R6 TRAZA (organizations -> executions)',
      relationType: 'Clave foránea 1:N de observabilidad multi-tenant',
      whyThisRelation:
        'Persistir organization_id directamente en executions permite indexar el par compuesto idx_executions_org_timestamp y consultar trazas forenses y analítica de 24 h sin JOINs costosos ni riesgo IDOR.',
      integrityRationale:
        'ON DELETE CASCADE aplica solo ante borrado total del tenant; en operación normal executions es de solo inserción y sus FKs a agentes/herramientas usan RESTRICT.',
      defenseTip:
        'Menciona que el índice B-tree compuesto (organization_id, timestamp) sostiene los listados paginados de TracesView y Analytics.'
    },
    {
      id: 'pg-org-audit',
      source: 'organizations',
      target: 'audit_events',
      label: '1 : N',
      chenCardinality: 'ORG (0,N) — (1,1) AUDIT_EVENT',
      onDelete: 'ON DELETE CASCADE',
      relationTitle: 'R8 AUDITA (organizations -> audit_events)',
      relationType: 'Clave foránea 1:N de auditoría administrativa',
      whyThisRelation:
        'Encierra el log administrativo inmutable dentro de las fronteras del tenant para que roles ADMIN y AUDITOR solo puedan inspeccionar eventos de su propia empresa.',
      integrityRationale:
        'ON DELETE CASCADE limpia el log únicamente si la organización completa se elimina del SaaS; no existen endpoints de borrado individual.',
      defenseTip:
        'Complementa mencionando el índice compuesto idx_audit_events_org_timestamp y el índice GIN sobre metadata.'
    },
    {
      id: 'pg-users-agents',
      source: 'users',
      target: 'agents',
      label: '1 : N',
      chenCardinality: 'USER (0,N) — (1,1) AGENT',
      onDelete: 'ON DELETE RESTRICT',
      relationTitle: 'R9 PATROCINA (users -> agents)',
      relationType: 'Clave foránea 1:N de responsabilidad humana',
      whyThisRelation:
        'Todo agente de IA debe estar patrocinado por un operador humano responsable (agents.owner_user_id NOT NULL). Un mismo usuario puede supervisar múltiples agentes o ninguno.',
      integrityRationale:
        'ON DELETE RESTRICT bloquea el borrado de un usuario si todavía es responsable de algún agente, obligando a reasignar el patrocinio antes de darlo de baja.',
      defenseTip:
        'Excelente ejemplo para justificar por qué no todas las FKs deben ser CASCADE: aquí RESTRICT impide dejar agentes autónomos sin dueño humano.'
    },
    {
      id: 'pg-agents-agenttools',
      source: 'agents',
      target: 'agent_tools',
      label: 'N : M',
      chenCardinality: 'AGENT (0,N) — (1,1) AGENT_TOOL',
      onDelete: 'ON DELETE CASCADE',
      relationTitle: 'R10a AUTORIZADO_EN (agents -> agent_tools)',
      relationType: 'Extremo agente de la relación asociativa N:M',
      whyThisRelation:
        'Desacopla qué herramientas tiene asignadas cada agente. Un agente recién creado arranca con cero herramientas (privilegio mínimo) y solo puede invocar las vinculadas con enabled=true.',
      integrityRationale:
        'ON DELETE CASCADE elimina automáticamente las asignaciones si se borra un agente sin ejecuciones previas; si tiene trazas, executions.agent_id RESTRICT detiene el borrado.',
      defenseTip:
        'Cita el Escenario 2 (update_price): falla cerrado con 403 precisamente porque no existe fila habilitada en agent_tools para el Agente de Ventas y Catálogo.'
    },
    {
      id: 'pg-tools-agenttools',
      source: 'tools',
      target: 'agent_tools',
      label: 'N : M',
      chenCardinality: 'TOOL (0,N) — (1,1) AGENT_TOOL',
      onDelete: 'ON DELETE CASCADE',
      relationTitle: 'R10b AUTORIZADO_EN (tools -> agent_tools)',
      relationType: 'Extremo herramienta de la relación asociativa N:M',
      whyThisRelation:
        'Permite que una misma herramienta corporativa (por ejemplo CRM ACME) sea compartida por varios agentes con configuraciones JSONB (config) e interruptores enabled independientes.',
      integrityRationale:
        'ON DELETE CASCADE limpia los vínculos si se retira una herramienta sin historial, mientras uq_agent_tool_pair impide asignaciones duplicadas.',
      defenseTip:
        'Destaca la traducción conceptual a física: el rombo AUTORIZADO_EN con atributos enabled y config en Chen se reifica en la tabla agent_tools.'
    },
    {
      id: 'pg-tools-actions',
      source: 'tools',
      target: 'tool_actions',
      label: '1 : N',
      chenCardinality: 'TOOL (0,N) — (1,1) TOOL_ACTION',
      onDelete: 'ON DELETE CASCADE',
      relationTitle: 'R11 EXPONE (tools -> tool_actions)',
      relationType: 'Clave foránea 1:N de entidad débil',
      whyThisRelation:
        'Descompone cada herramienta REST en operaciones atómicas evaluables por separado (ej. query_sales LOW frente a delete_sales CRITICAL), con unicidad UNIQUE(tool_id, action_name).',
      integrityRationale:
        'ON DELETE CASCADE refleja dependencia existencial fuerte: una acción atómica no tiene sentido fuera de su herramienta contenedora (siempre que no tenga reglas o trazas con RESTRICT).',
      defenseTip:
        'Explica que en Chen esta relación modela una entidad débil con clave sustituta UUID.'
    },
    {
      id: 'pg-policies-rules',
      source: 'policies',
      target: 'policy_rules',
      label: '1 : N',
      chenCardinality: 'POLICY (0,N) — (1,1) POLICY_RULE',
      onDelete: 'ON DELETE CASCADE',
      relationTitle: 'R12 CONTIENE (policies -> policy_rules)',
      relationType: 'Clave foránea 1:N de composición de política',
      whyThisRelation:
        'Una política agrupa múltiples reglas deterministas ordenadas por prioridad (por ejemplo, la política de Consultante BI contiene ALLOW query_sales prio 150 y DENY delete_sales prio 250).',
      integrityRationale:
        'ON DELETE CASCADE garantiza que eliminar una política desde PoliciesView elimine atómicamente todas sus reglas hijas sin dejar reglas huérfanas evaluables.',
      defenseTip:
        'Menciona la carga ansiosa con selectinload en PolicyService.get_by_id() para evitar sqlalchemy.exc.MissingGreenlet al serializar PolicyRead.'
    },
    {
      id: 'pg-actions-rules',
      source: 'tool_actions',
      target: 'policy_rules',
      label: '1 : N',
      chenCardinality: 'TOOL_ACTION (0,N) — (1,1) POLICY_RULE',
      onDelete: 'ON DELETE RESTRICT',
      relationTitle: 'R13 REGULA (tool_actions -> policy_rules)',
      relationType: 'Clave foránea 1:N obligatoria de alcance atómico',
      whyThisRelation:
        'Cada regla del PDP regula exactamente una acción atómica (policy_rules.tool_action_id NOT NULL), asegurando que las autorizaciones sean siempre granulares y nunca comodines peligrosos.',
      integrityRationale:
        'ON DELETE RESTRICT impide borrar una acción atómica del catálogo mientras existan reglas de seguridad referenciándola, devolviendo 409 Conflict en la API.',
      defenseTip:
        'Destaca que esta restricción obliga a gestionar conscientemente las reglas antes de retirar una operación de negocio.'
    },
    {
      id: 'pg-agents-rules',
      source: 'agents',
      target: 'policy_rules',
      label: '0..1 : N',
      chenCardinality: 'AGENT (0,N) — (0,1) POLICY_RULE',
      onDelete: 'ON DELETE CASCADE',
      relationTitle: 'R14 APUNTA_A (agents -> policy_rules)',
      relationType: 'Clave foránea 1:N opcional (regla específica vs. global)',
      whyThisRelation:
        'target_agent_id admite NULL deliberadamente: cuando es NULL la regla es global multi-agente (ej. bloquear export_customers para toda la empresa); cuando apunta a un agente, tiene mayor precedencia en el PDP.',
      integrityRationale:
        'ON DELETE CASCADE elimina reglas dedicadas exclusivamente a un agente si este se da de baja, sin afectar jamás las reglas globales (NULL).',
      defenseTip:
        'Recuerda el orden de precedencia del PDP: target_agent_id IS NOT NULL siempre se evalúa antes que las reglas globales.'
    },
    {
      id: 'pg-agents-executions',
      source: 'agents',
      target: 'executions',
      label: '1 : N',
      chenCardinality: 'AGENT (0,N) — (1,1) EXECUTION',
      onDelete: 'ON DELETE RESTRICT',
      relationTitle: 'R15 EJECUTA (agents -> executions)',
      relationType: 'Clave foránea 1:N de trazabilidad forense',
      whyThisRelation:
        'Toda ejecución interceptada en el Gateway PEP es originada obligatoriamente por un agente identificado (executions.agent_id NOT NULL), formando la primera dimensión (Principal) de la tupla 5D.',
      integrityRationale:
        'ON DELETE RESTRICT protege la integridad forense: prohíbe eliminar un agente que ya dejó trazas; en su lugar el operador debe pasarlo a estado REVOKED.',
      defenseTip:
        'Gran argumento de auditoría: en seguridad nunca se borra un actor con historial, se revoca su estado.'
    },
    {
      id: 'pg-actions-executions',
      source: 'tool_actions',
      target: 'executions',
      label: '1 : N',
      chenCardinality: 'TOOL_ACTION (0,N) — (1,1) EXECUTION',
      onDelete: 'ON DELETE RESTRICT',
      relationTitle: 'R18 INVOCA_ACCION (tool_actions -> executions)',
      relationType: 'Clave foránea 1:N de granularidad forense',
      whyThisRelation:
        'Vincula cada traza de ejecución con la acción atómica exacta evaluada (además de executions.tool_id RESTRICT y delegator_user_id SET NULL), garantizando auditoría precisa de qué se intentó hacer.',
      integrityRationale:
        'ON DELETE RESTRICT impide borrar definiciones de acciones que ya forman parte de evidencias históricas de ejecución.',
      defenseTip:
        'Conecta esto con los atributos derivados: agent_name, tool_name y action_name no se duplican en executions (3FN), sino que se navegan por ORM.'
    },
    {
      id: 'pg-rules-executions',
      source: 'policy_rules',
      target: 'executions',
      label: '0..1 : N',
      chenCardinality: 'POLICY_RULE (0,N) — (0,1) EXECUTION',
      onDelete: 'ON DELETE SET NULL',
      relationTitle: 'R19 DECIDE (policy_rules -> executions)',
      relationType: 'Clave foránea 1:N opcional de explicación de veredicto',
      whyThisRelation:
        'Registra exactamente qué regla produjo el veredicto del PDP. Es nullable porque ante bloqueos Fail-Closed (ninguna regla coincidió o falta vínculo AgentTool) no existe regla ganadora.',
      integrityRationale:
        'ON DELETE SET NULL permite retirar o reemplazar reglas obsoletas sin destruir ni corromper las ejecuciones históricas que dicha regla decidió en el pasado.',
      defenseTip:
        'Explica que un evaluated_policy_rule_id = NULL junto a decision = DENY es la huella exacta del comportamiento Fail-Closed.'
    },
    {
      id: 'pg-executions-approvals',
      source: 'executions',
      target: 'approvals',
      label: '1 : 0..1',
      chenCardinality: 'EXECUTION (0,1) — (1,1) APPROVAL',
      onDelete: 'ON DELETE CASCADE',
      relationTitle: 'R20 SUSPENDE (executions -> approvals)',
      relationType: 'Clave foránea estricta 1 a 0..1 con UNIQUE',
      whyThisRelation:
        'Solo las ejecuciones con decisión REQUIRE_APPROVAL (HTTP 202) originan un ticket HITL, y jamás puede existir más de una aprobación para la misma ejecución.',
      integrityRationale:
        'UNIQUE(approvals.execution_id) impone la cardinalidad 1:0..1 en el motor PostgreSQL, y ON DELETE CASCADE refleja que el ticket depende existencialmente de su ejecución.',
      defenseTip:
        'Pregunta clásica de cátedra: cómo se garantiza 1:0..1 en SQL. Respuesta: FK NOT NULL combinada con restricción UNIQUE.'
    },
    {
      id: 'pg-users-approvals',
      source: 'users',
      target: 'approvals',
      label: '0..1 : N',
      chenCardinality: 'USER (0,N) — (0,1) APPROVAL',
      onDelete: 'ON DELETE SET NULL',
      relationTitle: 'R21 RESUELVE_APROBACION (users -> approvals)',
      relationType: 'Clave foránea 1:N opcional de resolución HITL',
      whyThisRelation:
        'Identifica al operador humano (assigned_approver_id) que aprobó o rechazó la operación sensible. Permanece NULL mientras el ticket sigue en estado PENDING o si expira por TTL.',
      integrityRationale:
        'ON DELETE SET NULL preserva el historial de aprobaciones resueltas aunque el aprobador humano deje la organización en el futuro.',
      defenseTip:
        'Aclara que la BD no restringe el rol en la FK, sino la capa API mediante require_roles(UserRole.ADMIN, UserRole.APPROVER) y rechazo 403 a X-Agent-Id.'
    },
    {
      id: 'pg-executions-alerts',
      source: 'executions',
      target: 'alerts',
      label: '0..1 : N',
      chenCardinality: 'EXECUTION (0,N) bd / (0,1) orm — (0,1) ALERT',
      onDelete: 'ON DELETE SET NULL',
      relationTitle: 'R22 ORIGINA (executions -> alerts)',
      relationType: 'Clave foránea opcional de evidencia SIEM',
      whyThisRelation:
        'Vincula incidentes críticos (OWASP ASI01/03/04/05 o bloqueos HIGH/CRITICAL) con la ejecución que los disparó, manteniendo alerts.execution_id nullable y sin UNIQUE para soportar evidencia SIEM autónoma.',
      integrityRationale:
        'ON DELETE SET NULL garantiza que la alerta de seguridad sobreviva intacta incluso si la ejecución asociada llegara a depurarse por política de retención.',
      defenseTip:
        'Matiz fino del Vol. 01 y Vol. 02: físicamente la BD admite múltiples alertas por ejecución, pero el ORM (uselist=False) y el PEP emiten a lo sumo una.'
    },
    {
      id: 'pg-users-alerts',
      source: 'users',
      target: 'alerts',
      label: '0..1 : N',
      chenCardinality: 'USER (0,N) — (0,1) ALERT',
      onDelete: 'ON DELETE SET NULL',
      relationTitle: 'R23 RESUELVE_ALERTA (users -> alerts)',
      relationType: 'Clave foránea 1:N opcional de gestión de incidentes',
      whyThisRelation:
        'Registra qué operador humano (ADMIN, APPROVER u OPERATOR) atendió, resolvió o descartó una alerta mediante PATCH /api/v1/alerts/{id}/status; queda NULL mientras está OPEN.',
      integrityRationale:
        'ON DELETE SET NULL conserva el registro del incidente resuelto si la cuenta del operador se da de baja posteriormente.',
      defenseTip:
        'Menciona que toda actualización de estado difunde en tiempo real el evento WebSocket ALERT_STATUS_UPDATED al tenant.'
    },
    {
      id: 'pg-users-audit',
      source: 'users',
      target: 'audit_events',
      label: 'Polimórfica',
      chenCardinality: 'USER/AGENT/SYSTEM (0,N) — (1,1) AUDIT_EVENT',
      onDelete: 'Sin FK física (polimórfica)',
      relationTitle: 'R24 REALIZADO_POR (actor polimórfico -> audit_events)',
      relationType: 'Relación conceptual polimórfica sin clave foránea',
      whyThisRelation:
        'audit_events.actor_id identifica al autor de una mutación administrativa discriminado por actor_type (USER, AGENT o SYSTEM). Se representa punteada porque no existe constraint REFERENCES en PostgreSQL.',
      integrityRationale:
        'Omitir la FK física es una decisión intencional: una FK no puede apuntar a múltiples tablas a la vez y el registro forense debe sobrevivir intacto aunque el actor sea eliminado.',
      defenseTip:
        'Señala que actor_id está igualmente indexado (ix_audit_events_actor_id) para investigar rápidamente todas las acciones de un usuario específico.',
      edgeStyle: 'dashed'
    }
  ],
  tourSteps: [
    {
      id: 'pg-tour-tenant',
      title: 'Aislamiento Multi-Tenant y RBAC',
      badge: 'Paso 1 de 5',
      narrative:
        'Todo parte de organizations: su UUID v4 generado por PostgreSQL (gen_random_uuid()) aísla los datos de 8 tablas dependientes en la capa de aplicación (Anti-IDOR). Los humanos se autentican en users (bcrypt, must_change_password y 5 roles RBAC), mientras los agentes usan llaves SHA-256 en api_keys cacheadas en Redis DB 0.',
      focusNodeIds: ['organizations', 'users', 'api_keys'],
      focusEdgeId: 'pg-org-users',
      selectNodeId: 'organizations',
      layerId: 'tenant'
    },
    {
      id: 'pg-tour-catalog',
      title: 'Desacoplamiento N:N en agent_tools y acciones atómicas',
      badge: 'Paso 2 de 5',
      narrative:
        'Cada agente (patrocinado por un humano vía owner_user_id RESTRICT) solo puede invocar herramientas habilitadas en la tabla asociativa agent_tools (UNIQUE(agent_id, tool_id), enabled, config JSONB + GIN). A su vez, cada herramienta REST expone acciones atómicas en tool_actions con su risk_level.',
      focusNodeIds: ['agents', 'agent_tools', 'tools', 'tool_actions'],
      focusEdgeId: 'pg-agents-agenttools',
      selectNodeId: 'agent_tools',
      layerId: 'catalog'
    },
    {
      id: 'pg-tour-pdp',
      title: 'Motor Determinista PDP 5D y reglas GIN JSONB',
      badge: 'Paso 3 de 5',
      narrative:
        'Las políticas organizacionales (policies) agrupan reglas atómicas en policy_rules. Cada regla regula una tool_action (RESTRICT), puede ser global (target_agent_id NULL) o específica de un agente, evalúa predicados JSONB indexados con GIN y resuelve empates en modo Fail-Closed (DENY < REQUIRE_APPROVAL < ALLOW).',
      focusNodeIds: ['policies', 'policy_rules', 'tool_actions', 'agents'],
      focusEdgeId: 'pg-actions-rules',
      selectNodeId: 'policy_rules',
      layerId: 'pdp'
    },
    {
      id: 'pg-tour-hitl',
      title: 'Aprobaciones HITL 202 Accepted y bloqueo FOR UPDATE',
      badge: 'Paso 4 de 5',
      narrative:
        'Cuando el PDP decide REQUIRE_APPROVAL, se registra executions (PENDING_APPROVAL) y un único ticket en approvals (relación 1 : 0..1 garantizada con UNIQUE(execution_id)). La resolución exige rol humano APPROVER o ADMIN, adquiere bloqueo pesimista SELECT ... FOR UPDATE y aplica un TTL calculado de 900 s.',
      focusNodeIds: ['executions', 'approvals', 'users'],
      focusEdgeId: 'pg-executions-approvals',
      selectNodeId: 'approvals',
      layerId: 'runtime'
    },
    {
      id: 'pg-tour-forensics',
      title: 'Alertas OWASP ASI03 y bitácora forense inmutable',
      badge: 'Paso 5 de 5',
      narrative:
        'executions persiste la latencia real medida (latency_ms, Mig. 002) y el request_context sanitizado (OWASP LLM06), blindado con FKs RESTRICT. Las amenazas disparan alertas SIEM autónomas en alerts (SET NULL), mientras audit_events registra toda mutación administrativa con actor polimórfico sin FK física.',
      focusNodeIds: ['executions', 'alerts', 'audit_events'],
      focusEdgeId: 'pg-users-audit',
      selectNodeId: 'audit_events',
      layerId: 'runtime'
    }
  ]
}

const merAcmeView: ExplorerViewConfig = {
  id: 'mer-acme',
  shortLabel: 'MER ACME (SQLite)',
  title: 'Persistencia Externa del ERP ACME Corp (SQLite 3)',
  subtitle:
    'Base de datos del sistema empresarial protegido en el puerto :9000 (acme-corp/acme_corp.db): 7 tablas desacopladas físicamente de AgentGuard (ADR-008) con 0 FKs físicas.',
  direction: 'LR',
  stats: [
    { label: 'Motor externo', value: 'SQLite 3' },
    { label: 'Tablas ERP ACME', value: '7' },
    { label: 'FKs físicas', value: '0 (lógicas)' },
    { label: 'Puerto aislado', value: ':9000' }
  ],
  layers: [
    {
      id: 'core',
      label: 'Estado y Catálogo ERP',
      description:
        'Singleton de integridad global ante purgas destructivas y catálogo comercial Looney Tunes con control de precio base.',
      accent: 'emerald'
    },
    {
      id: 'commercial',
      label: 'Clientes y Operaciones',
      description:
        'Padrón VIP con PII fiscal y tablas operativas de cotizaciones, reembolsos y ventas históricas para BI.',
      accent: 'cyan'
    },
    {
      id: 'telemetry',
      label: 'Auditoría Operativa ERP',
      description:
        'Bitácora append-only de impacto real que contrasta Modo Protegido frente a Modo Directo sin firewall.',
      accent: 'amber'
    }
  ],
  nodes: [
    {
      id: 'company_status',
      kind: 'table',
      title: 'company_status',
      subtitle: 'Singleton de Integridad de la Empresa',
      layerId: 'core',
      accent: 'emerald',
      badge: 'CHECK (id = 1)',
      rankHint: 0,
      summary:
        'Tabla de fila única que indica si el ERP sufrió un ataque destructivo database.drop (database_wiped = 1), bloqueando la empresa con HTTP 503 hasta su restablecimiento.',
      whyDesigned:
        'Implementa un patrón singleton relacional mediante CHECK (id = 1) para impedir estados contradictorios sobre la salud del ERP. Vive en SQLite totalmente separada de PostgreSQL (ADR-008) para simular una empresa cliente independiente.',
      securityNotes: [
        'En Modo Directo, drop_acme_database() vacía las 5 tablas operativas y fija database_wiped = 1, disparando DatabaseWipedError (HTTP 503).',
        'En Modo Protegido, AgentGuard bloquea database.drop con 403 y Alert CRITICAL antes de tocar SQLite.',
        'Sincronizada con threading.Lock() dentro de AcmeDatabase (acme-corp/server/database.py).'
      ],
      defenseQuestion: '¿Por qué company_status declara CHECK (id = 1) en SQLite?',
      defenseAnswer:
        'Para garantizar a nivel de motor que solo pueda existir una única fila de estado global en toda la tabla (patrón singleton relacional), evitando lecturas ambiguas sobre si la base fue purgada.',
      docLink: '/volumenes/01_MER_RELACIONAL_Y_FISICO_DB',
      docLabel: 'Vol. 01 — Persistencia Externa ACME Corp',
      columns: [
        {
          name: 'id',
          type: 'INTEGER',
          badges: ['PK', 'NOT NULL'],
          note: 'CHECK (id = 1) fuerza una única fila singleton'
        },
        {
          name: 'database_wiped',
          type: 'INTEGER',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default 0 (booleano 0/1 en SQLite; 1 retorna HTTP 503)'
        },
        {
          name: 'wiped_at',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Timestamp ISO-8601 UTC de la purga'
        },
        {
          name: 'wiped_reason',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Motivo registrado del ataque destructivo'
        },
        {
          name: 'created_at',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'ISO-8601 UTC'
        },
        {
          name: 'updated_at',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'ISO-8601 UTC'
        }
      ]
    },
    {
      id: 'products',
      kind: 'table',
      title: 'products',
      subtitle: 'Catálogo Comercial Looney Tunes (6 filas)',
      layerId: 'core',
      accent: 'emerald',
      badge: 'Anti-Tampering',
      rankHint: 0,
      summary:
        'Almacena los 6 productos oficiales de ACME (ACME-ROCKET-01 a ACME-SEEDS-06), separando price de base_price para evidenciar sabotaje de precios en vivo.',
      whyDesigned:
        'Mantener base_price separado del precio vigente permite al Inspector SQLite detectar automáticamente manipulaciones maliciosas (price < base_price) cuando el agente intenta rebajar el Cohete Mk-IV de $4,500 a $9.99 en Modo Directo.',
      securityNotes: [
        'Objetivo del Escenario 2 (update_price): en Modo Protegido el Agente de Ventas carece de vínculo en agent_tools y nunca alcanza POST /catalog/update_price.',
        'sku es UNIQUE NOT NULL y actúa como enlace lógico desde sales.product_sku.',
        'En Modo Directo, rebajar por debajo de base_price registra un evento CRITICAL (CATALOG_PRICE_TAMPERING).'
      ],
      defenseQuestion: '¿Para qué existen las dos columnas price y base_price en products?',
      defenseAnswer:
        'base_price conserva el precio oficial de lista sembrado; compararlo contra price permite detectar y resaltar en vivo cualquier sabotaje de catálogo cuando un agente opera sin AgentGuard.',
      docLink: '/volumenes/06_PORTAL_ACME_CORP_CONSULTANTE_BI_Y_AGENT_DEMO',
      docLabel: 'Vol. 06 — Portal ACME Corp y Escenarios',
      columns: [
        {
          name: 'id',
          type: 'TEXT',
          badges: ['PK', 'NOT NULL'],
          note: 'Igual al SKU en la semilla (ej. ACME-ROCKET-01)'
        },
        {
          name: 'sku',
          type: 'TEXT',
          badges: ['UK', 'NOT NULL'],
          note: 'Código único referenciado lógicamente por sales'
        },
        {
          name: 'name',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'Nombre comercial del producto'
        },
        {
          name: 'category',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'Propulsión, Movilidad, Impacto Pesado, Explosivos, Camuflaje, Señuelos'
        },
        {
          name: 'price',
          type: 'REAL',
          badges: ['NOT NULL'],
          note: 'Precio vigente expuesto a update_price'
        },
        {
          name: 'base_price',
          type: 'REAL',
          badges: ['NOT NULL'],
          note: 'Precio base oficial para detectar tampering (price < base_price)'
        },
        {
          name: 'stock',
          type: 'INTEGER',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default 0; unidades en inventario'
        },
        {
          name: 'created_at',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'ISO-8601 UTC'
        },
        {
          name: 'updated_at',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'ISO-8601 UTC'
        }
      ]
    },
    {
      id: 'customers',
      kind: 'table',
      title: 'customers',
      subtitle: 'CRM de Clientes VIP con PII (5 filas)',
      layerId: 'commercial',
      accent: 'cyan',
      badge: 'Objetivo ASI03',
      rankHint: 0,
      summary:
        'Cartera de 5 clientes VIP (Wile E. Coyote, Lucas Duck, Sam Bigotes, Marvin el Marciano y Elmer Gruñón) con datos fiscales sensibles (tax_id / CUIT) y domicilios.',
      whyDesigned:
        'Contiene PII corporativa realista (tax_id, email, address, credit_limit) para demostrar el riesgo concreto de exfiltración de datos en el Escenario 4 (export_customers hacia attacker.io) y validar la sanitización OWASP LLM06.',
      securityNotes: [
        'Leída por export_all_customers() en POST /crm/export_customers: bloqueada con 403 y Alert CRITICAL en Modo Protegido.',
        'email declara UNIQUE NOT NULL; no tiene claves foráneas salientes ni entrantes físicas.',
        'Referenciada lógicamente por customer_id en quotes, refunds y sales.'
      ],
      defenseQuestion: '¿Comparte ACME Corp credenciales o tablas de clientes con la base PostgreSQL de AgentGuard?',
      defenseAnswer:
        'No (ADR-008). ACME Corp es un sistema empresarial externo independiente con su propia base SQLite. AgentGuard jamás consulta SQLite directamente ni comparte esquema: solo gobierna el tráfico HTTP que atraviesa el Gateway PEP.',
      docLink: '/volumenes/DECISIONS',
      docLabel: 'ADRs — ADR-008 Desacople ACME Corp',
      columns: [
        {
          name: 'id',
          type: 'TEXT',
          badges: ['PK', 'NOT NULL'],
          note: 'Identificador CRM (ej. cust_coyote_01)'
        },
        {
          name: 'name',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'Nombre completo del cliente VIP'
        },
        {
          name: 'alias',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Alias descriptivo en el CRM'
        },
        {
          name: 'email',
          type: 'TEXT',
          badges: ['UK', 'NOT NULL'],
          note: 'Correo corporativo único'
        },
        {
          name: 'tax_id',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'PII fiscal (CUIT-ACME-...) protegida frente a exfiltración'
        },
        {
          name: 'address',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'Domicilio físico (PII)'
        },
        {
          name: 'credit_limit',
          type: 'REAL',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default 0.0; límite de crédito en USD'
        },
        {
          name: 'created_at',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'ISO-8601 UTC'
        }
      ]
    },
    {
      id: 'quotes',
      kind: 'table',
      title: 'quotes',
      subtitle: 'Cotizaciones Comerciales (CRM)',
      layerId: 'commercial',
      accent: 'cyan',
      badge: 'Escenario 1 ALLOW',
      rankHint: 1,
      summary:
        'Persiste los presupuestos emitidos por POST /crm/create_quote cuando el Gateway PEP autoriza la operación (ALLOW, HTTP 200 OK).',
      whyDesigned:
        'Arranca vacía para que en la demo en vivo pueda observarse la inserción inmediata de una fila QUO-XXXXXXXX tras autorizarse el Escenario 1. Desnormaliza customer_name deliberadamente para replicar un ERP legado autosuficiente sin FKs físicas.',
      securityNotes: [
        'Solo recibe escritura real en Modo Protegido si el PDP confirma ALLOW (monto dentro del límite autónomo de la política).',
        'No almacena FK física hacia customers ni columna product_sku: registra los metadatos comerciales en details y en events.payload.',
        'Se vacía ante un ataque drop_acme_database() en Modo Directo y se recrea limpia con POST /api/reset.'
      ],
      defenseQuestion: '¿Por qué quotes guarda customer_name además de customer_id si eso desnormaliza el esquema?',
      defenseAnswer:
        'Porque ACME Corp modela un ERP legado didáctico con 0 FKs físicas (Vol. 01 §6): permite emitir presupuestos incluso para clientes ad-hoc donde customer_id es NULL y mostrar cada fila autosuficiente en el Inspector SQLite.',
      docLink: '/volumenes/01_MER_RELACIONAL_Y_FISICO_DB',
      docLabel: 'Vol. 01 — Diccionario Físico ACME (quotes)',
      columns: [
        {
          name: 'id',
          type: 'TEXT',
          badges: ['PK', 'NOT NULL'],
          note: 'Código QUO-XXXXXXXX generado en Python'
        },
        {
          name: 'customer_id',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Enlace lógico a customers.id (sin REFERENCES)'
        },
        {
          name: 'customer_name',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'Nombre desnormalizado del cliente'
        },
        {
          name: 'amount',
          type: 'REAL',
          badges: ['NOT NULL'],
          note: 'Monto total cotizado'
        },
        {
          name: 'currency',
          type: 'TEXT',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default USD'
        },
        {
          name: 'details',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Detalle comercial o descripción del ítem cotizado'
        },
        {
          name: 'status',
          type: 'TEXT',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default ISSUED'
        },
        {
          name: 'created_at',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'ISO-8601 UTC'
        }
      ]
    },
    {
      id: 'refunds',
      kind: 'table',
      title: 'refunds',
      subtitle: 'Reembolsos Financieros (Stripe Simulado)',
      layerId: 'commercial',
      accent: 'cyan',
      badge: 'Escenario 3 HITL',
      rankHint: 1,
      summary:
        'Registra devoluciones monetarias ejecutadas vía POST /stripe/refund: en Modo Protegido solo se inserta tras aprobación humana HITL cuando amount >= $500 USD.',
      whyDesigned:
        'Arranca vacía para evidenciar el contraste del flujo HITL (ADR-007): mientras el ticket está PENDING en AgentGuard (HTTP 202), refunds permanece sin cambios; al resolver APPROVED con lock FOR UPDATE, el PEP reanuda el despacho y aparece la fila REF-XXXXXXXX.',
      securityNotes: [
        'transaction_id referencia una transacción externa de pasarela de pagos (NOT NULL).',
        'En Modo Directo un agente liquida montos elevados sin intervención humana, demostrando el riesgo financiero.',
        'customer_id y customer_name son opcionales y desnormalizados (sin FK física en SQLite).'
      ],
      defenseQuestion: '¿Cuándo se escribe realmente una fila en refunds durante el Escenario 3 (reembolso >= $500 USD)?',
      defenseAnswer:
        'No se escribe cuando el agente invoca la acción: en ese momento AgentGuard devuelve 202 Accepted sin contactar a ACME. La fila en refunds recién se inserta cuando un humano APPROVER o ADMIN aprueba el ticket y el PEP ejecuta el re-despacho hacia POST /stripe/refund.',
      docLink: '/volumenes/04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO',
      docLabel: 'Vol. 04 — Secuencia Escenario 3 HITL',
      columns: [
        {
          name: 'id',
          type: 'TEXT',
          badges: ['PK', 'NOT NULL'],
          note: 'Código REF-XXXXXXXX'
        },
        {
          name: 'transaction_id',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'Identificador de transacción externa (Stripe simulado)'
        },
        {
          name: 'customer_id',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Enlace lógico a customers.id (sin FK física)'
        },
        {
          name: 'customer_name',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Nombre desnormalizado del cliente'
        },
        {
          name: 'amount',
          type: 'REAL',
          badges: ['NOT NULL'],
          note: 'Monto reembolsado en USD'
        },
        {
          name: 'reason',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Justificación del reembolso'
        },
        {
          name: 'status',
          type: 'TEXT',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default COMPLETED'
        },
        {
          name: 'created_at',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'ISO-8601 UTC'
        }
      ]
    },
    {
      id: 'sales',
      kind: 'table',
      title: 'sales',
      subtitle: 'Ventas Históricas BI (15 filas semilla)',
      layerId: 'commercial',
      accent: 'cyan',
      badge: 'Consultante BI',
      rankHint: 1,
      summary:
        'Sustenta el caso de uso estrella Consultante BI: 15 ventas históricas divididas entre last_month (8 filas, $19,210) y current_month (7 filas, $15,230) particionadas alrededor de $1,000 USD.',
      whyDesigned:
        'La partición exacta entre ventas mayores y menores a $1,000 USD permite demostrar el flujo de 3 pasos del Consultante BI: consultar ventas (ALLOW), graficar en torta SVG (ALLOW) e intentar borrar ventas menores a $1,000 (DENY en Modo Protegido frente a DELETE físico en Modo Directo).',
      securityNotes: [
        'POST /bi/query_sales (LOW) está autorizado por la política de solo lectura; POST /bi/delete_sales (CRITICAL) está bloqueado con DENY prioridad 250.',
        'delete_sales_records() ejecuta DELETE real con salvaguarda de filtro; en Modo Protegido la UI ofrece filtro visual local sin tocar SQLite.',
        'Desnormaliza customer_name, product_name y category para construir agregados de gráfico SVG sin JOINs.'
      ],
      defenseQuestion: '¿Cómo protege AgentGuard la tabla sales cuando un empleado pide al Consultante BI borrar las ventas menores a $1,000?',
      defenseAnswer:
        'El LLM propone la herramienta delete_sales pero el Gateway PEP aplica la regla DENY de prioridad 250 (riesgo CRITICAL) y devuelve 403 Forbidden. SQLite permanece con sus 15 filas intactas y el portal ACME ofrece un filtro visual en memoria del navegador.',
      docLink: '/volumenes/06_PORTAL_ACME_CORP_CONSULTANTE_BI_Y_AGENT_DEMO',
      docLabel: 'Vol. 06 — Consultante BI y Escenarios BI-1 a BI-3',
      columns: [
        {
          name: 'id',
          type: 'TEXT',
          badges: ['PK', 'NOT NULL'],
          note: 'SALE-LM-01..08 y SALE-CM-09..15'
        },
        {
          name: 'sale_date',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'Fecha de venta ISO-8601 UTC'
        },
        {
          name: 'period',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'last_month (8 filas) o current_month (7 filas)'
        },
        {
          name: 'customer_id',
          type: 'TEXT',
          badges: ['NULL'],
          note: 'Enlace lógico a customers.id (sin FK física)'
        },
        {
          name: 'customer_name',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'Nombre desnormalizado del cliente'
        },
        {
          name: 'product_sku',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'Enlace lógico a products.sku (sin FK física)'
        },
        {
          name: 'product_name',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'Nombre desnormalizado del producto'
        },
        {
          name: 'category',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'Categoría comercial para agregación de gráfica SVG'
        },
        {
          name: 'quantity',
          type: 'INTEGER',
          badges: ['NOT NULL'],
          note: 'Unidades vendidas'
        },
        {
          name: 'amount',
          type: 'REAL',
          badges: ['NOT NULL'],
          note: 'Monto total en USD (total semilla $34,440)'
        },
        {
          name: 'created_at',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'ISO-8601 UTC'
        }
      ]
    },
    {
      id: 'events',
      kind: 'table',
      title: 'events',
      subtitle: 'Bitácora Local de Impacto (Append-Only)',
      layerId: 'telemetry',
      accent: 'amber',
      badge: 'Evidencia ERP',
      rankHint: 2,
      summary:
        'Registra cada operación que efectivamente impactó al ERP ACME (SYSTEM_INIT, QUOTE_ISSUED, CATALOG_PRICE_TAMPERING, SALES_DELETED, DB_WIPED) con payload JSON serializado en TEXT.',
      whyDesigned:
        'Actúa como caja negra del lado del cliente: sobrevive incluso a drop_acme_database() para evidenciar el daño de operar en Modo Directo, y contrasta con la tabla executions de AgentGuard (donde quedan los intentos bloqueados que jamás llegaron a ACME).',
      securityNotes: [
        'payload guarda JSON serializado como TEXT porque SQLite no dispone de tipo JSONB nativo con índices GIN.',
        'drop_acme_database() preserva intencionalmente la tabla events y escribe un registro DB_WIPED con severidad CRITICAL.',
        'No tiene claves foráneas físicas hacia ninguna tabla operativa para conservar autonomía de auditoría.'
      ],
      defenseQuestion: '¿Qué diferencia hay entre la tabla events de ACME Corp y audit_events o executions de AgentGuard?',
      defenseAnswer:
        'events vive en el ERP del cliente y solo registra lo que realmente logró tocar ACME. executions y audit_events viven en PostgreSQL de AgentGuard y registran tanto las operaciones permitidas como cada intento bloqueado antes de alcanzar el ERP.',
      docLink: '/volumenes/01_MER_RELACIONAL_Y_FISICO_DB',
      docLabel: 'Vol. 01 — Esquema SQLite ACME (events)',
      columns: [
        {
          name: 'id',
          type: 'TEXT',
          badges: ['PK', 'NOT NULL'],
          note: 'evt_ seguido de 12 caracteres hexadecimales'
        },
        {
          name: 'event_type',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'SYSTEM_INIT, QUOTE_ISSUED, SALES_DELETED, DB_WIPED'
        },
        {
          name: 'severity',
          type: 'TEXT',
          badges: ['NOT NULL', 'DEFAULT'],
          note: 'Default INFO; escala a CRITICAL en sabotaje o purga'
        },
        {
          name: 'action',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'Nombre de la acción ejecutada en el ERP'
        },
        {
          name: 'payload',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'JSON serializado como texto con el detalle de la operación'
        },
        {
          name: 'message',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'Resumen legible mostrado en el panel de ACME Corp'
        },
        {
          name: 'created_at',
          type: 'TEXT',
          badges: ['NOT NULL'],
          note: 'ISO-8601 UTC'
        }
      ]
    }
  ],
  edges: [
    {
      id: 'acme-cust-quotes',
      source: 'customers',
      target: 'quotes',
      label: 'Lógica 0..1 : N',
      chenCardinality: 'CUSTOMER (0,N) — (0,1) QUOTE',
      onDelete: 'Sin FK física (SQLite)',
      relationTitle: 'SOLICITA (customers -> quotes)',
      relationType: 'Relación lógica por customer_id (nullable)',
      whyThisRelation:
        'Vincula una cotización emitida con un cliente del padrón VIP mediante quotes.customer_id, permitiendo igualmente cotizaciones rápidas donde solo se provee customer_name.',
      integrityRationale:
        'No declara REFERENCES en DDL (0 FKs físicas en ACME): se resolvió por código en AcmeDatabase.record_quote() para representar un ERP legado tolerante a datos desnormalizados.',
      defenseTip:
        'Aclara que aunque SQLite activa PRAGMA foreign_keys = ON en la conexión, ninguna de las 7 tablas declara REFERENCES (verificado con pragma_foreign_key_list).',
      edgeStyle: 'dashed'
    },
    {
      id: 'acme-prod-quotes',
      source: 'products',
      target: 'quotes',
      label: 'Ref. comercial',
      chenCardinality: 'PRODUCT (0,N) — (0,N) QUOTE (indirecta)',
      onDelete: 'Sin FK física (vía details y events)',
      relationTitle: 'COTIZA_PRODUCTO (products -> quotes)',
      relationType: 'Referencia comercial indirecta sin columna FK',
      whyThisRelation:
        'Al invocar record_quote(..., product_sku=...), el ERP acepta un SKU del catálogo para describir la propuesta en quotes.details y persiste product_sku en events.payload sin acoplar una FK física en quotes.',
      integrityRationale:
        'Mantener quotes libre de FK hacia products evita romper cotizaciones multi-ítem o personalizadas en el escenario demostrativo del CRM.',
      defenseTip:
        'Gran detalle de fidelidad contra código real: quotes no posee columna product_sku en SQLite; el SKU queda registrado en details y en la bitácora events.',
      edgeStyle: 'dashed'
    },
    {
      id: 'acme-cust-refunds',
      source: 'customers',
      target: 'refunds',
      label: 'Lógica 0..1 : N',
      chenCardinality: 'CUSTOMER (0,N) — (0,1) REFUND',
      onDelete: 'Sin FK física (SQLite)',
      relationTitle: 'RECLAMA (customers -> refunds)',
      relationType: 'Relación lógica por customer_id (nullable)',
      whyThisRelation:
        'Asocia un reembolso procesado en Stripe con el cliente solicitante mediante refunds.customer_id y guarda transaction_id para trazabilidad externa.',
      integrityRationale:
        'La ausencia de FK física permite registrar devoluciones identificadas únicamente por transaction_id sin fallar por integridad referencial en el ERP legado.',
      defenseTip:
        'Relaciona esta arista con el Escenario 3: el rigor transaccional y el lock FOR UPDATE viven en PostgreSQL (AgentGuard), no en SQLite.',
      edgeStyle: 'dashed'
    },
    {
      id: 'acme-cust-sales',
      source: 'customers',
      target: 'sales',
      label: 'Lógica 0..1 : N',
      chenCardinality: 'CUSTOMER (0,N) — (0,1) SALE',
      onDelete: 'Sin FK física (SQLite)',
      relationTitle: 'COMPRA (customers -> sales)',
      relationType: 'Relación lógica por customer_id (nullable)',
      whyThisRelation:
        'Conecta las 15 ventas históricas de BI con los 5 clientes VIP mientras replica customer_name en cada fila para acelerar reportes sin JOINs.',
      integrityRationale:
        'Sin FK física por diseño de ERP legado desnormalizado: el histórico de ventas permanece consultable aunque cambie el padrón de clientes.',
      defenseTip:
        'Señala que el rigor de normalización 3FN y las 24 FKs físicas están en PostgreSQL 16 (AgentGuard), mientras SQLite representa el sistema heredado protegido.',
      edgeStyle: 'dashed'
    },
    {
      id: 'acme-prod-sales',
      source: 'products',
      target: 'sales',
      label: 'Lógica 1 : N',
      chenCardinality: 'PRODUCT (0,N) — (1,1) SALE',
      onDelete: 'Sin FK física (SQLite)',
      relationTitle: 'SE_VENDE_EN (products -> sales)',
      relationType: 'Relación lógica obligatoria por product_sku',
      whyThisRelation:
        'Toda venta histórica corresponde a un producto del catálogo identificado por sales.product_sku NOT NULL, acompañado de product_name y category desnormalizados para el gráfico de torta SVG.',
      integrityRationale:
        'Se mantiene como vínculo lógico por SKU en lugar de FK física para emular una base analítica heredada donde cada registro es autosuficiente.',
      defenseTip:
        'Destaca el contraste entre Vol. 02 §5 (relación lógica SE_VENDE_EN) y el esquema PostgreSQL de AgentGuard.',
      edgeStyle: 'dashed'
    },
    {
      id: 'acme-quotes-events',
      source: 'quotes',
      target: 'events',
      label: 'Traza ERP',
      chenCardinality: 'QUOTE (0,N) — (0,1) EVENT (lógica)',
      onDelete: 'Append-only (sin FK)',
      relationTitle: 'REGISTRA_IMPACTO (quotes -> events)',
      relationType: 'Registro de auditoría operativa en JSON TEXT',
      whyThisRelation:
        'Cada cotización emitida invoca record_event(event_type="QUOTE_ISSUED") guardando quote_id, customer, amount y product_sku serializados en events.payload.',
      integrityRationale:
        'No usa clave foránea porque events almacena múltiples tipos heterogéneos de eventos y debe sobrevivir intacta incluso si quotes se vacía durante una purga.',
      defenseTip:
        'Muestra el paralelismo arquitectónico con audit_events de PostgreSQL: las bitácoras de impacto no se atan con FKs que impidan sobrevivir a purgas.',
      edgeStyle: 'dashed'
    },
    {
      id: 'acme-sales-events',
      source: 'sales',
      target: 'events',
      label: 'Traza BI',
      chenCardinality: 'SALE (0,N) — (0,1) EVENT (lógica)',
      onDelete: 'Append-only (sin FK)',
      relationTitle: 'AUDITA_BI (sales -> events)',
      relationType: 'Evidencia de lectura y borrado BI en SQLite',
      whyThisRelation:
        'Registra consultas analíticas (SALES_QUERIED) y, en Modo Directo vulnerable, deja constancia crítica (SALES_DELETED) de cuántas ventas reales fueron borradas.',
      integrityRationale:
        'Al no depender por FK de las filas borradas de sales, el evento SALES_DELETED permanece visible como evidencia del daño en la demo comparativa.',
      defenseTip:
        'En Modo Protegido, delete_sales es bloqueado antes de llegar a ACME: aparece en executions/alerts de AgentGuard pero nunca genera SALES_DELETED en SQLite.',
      edgeStyle: 'dashed'
    },
    {
      id: 'acme-status-events',
      source: 'company_status',
      target: 'events',
      label: 'DB_WIPED',
      chenCardinality: 'STATUS (1,1) — (0,N) EVENT (lógica)',
      onDelete: 'Append-only (sin FK)',
      relationTitle: 'REGISTRA_PURGA (company_status -> events)',
      relationType: 'Correlación de estado global e incidentes',
      whyThisRelation:
        'Cuando drop_acme_database() marca company_status.database_wiped = 1, inserta simultáneamente el evento crítico DB_WIPED; y reset_db() registra SYSTEM_RESET.',
      integrityRationale:
        'La independencia referencial garantiza que el evento crítico siga accesible en el inspector mientras el resto del ERP devuelve HTTP 503 Service Unavailable.',
      defenseTip:
        'Resume el valor de la demo: sin AgentGuard el agente deja la empresa caída en 503; con AgentGuard el ataque se frena con 403 antes de tocar SQLite.',
      edgeStyle: 'dashed'
    }
  ],
  tourSteps: [
    {
      id: 'acme-tour-adr008',
      title: 'Desacople físico ADR-008: ERP cliente vs. AgentGuard',
      badge: 'Paso 1 de 3',
      narrative:
        'ACME Corp corre en su propio servidor FastAPI (:9000) con base SQLite local (acme_corp.db), sin compartir credenciales ni claves foráneas con PostgreSQL de AgentGuard. company_status (singleton CHECK id = 1), products y customers constituyen el recurso empresarial protegido.',
      focusNodeIds: ['company_status', 'products', 'customers'],
      selectNodeId: 'company_status',
      layerId: 'core'
    },
    {
      id: 'acme-tour-ops',
      title: 'Relaciones lógicas y desnormalización de ERP legado',
      badge: 'Paso 2 de 3',
      narrative:
        'Deliberadamente ACME tiene 0 claves foráneas físicas: quotes, refunds y sales se vinculan por convención (customer_id y product_sku) y desnormalizan nombres y categorías. Las 15 ventas de sales particionadas en $1,000 USD sostienen el caso estrella Consultante BI.',
      focusNodeIds: ['customers', 'products', 'quotes', 'refunds', 'sales'],
      focusEdgeId: 'acme-prod-sales',
      selectNodeId: 'sales',
      layerId: 'commercial'
    },
    {
      id: 'acme-tour-evidence',
      title: 'Bitácora de impacto: Modo Protegido vs. Modo Directo',
      badge: 'Paso 3 de 3',
      narrative:
        'La tabla events funciona como bitácora append-only en SQLite. En Modo Protegido los ataques (update_price, export_customers, delete_sales, database.drop) jamás llegan a ACME; en Modo Directo alteran precios, borran filas reales o disparan DB_WIPED dejando el ERP en HTTP 503.',
      focusNodeIds: ['sales', 'company_status', 'events'],
      focusEdgeId: 'acme-sales-events',
      selectNodeId: 'events',
      layerId: 'telemetry'
    }
  ]
}

const runtimeFlowView: ExplorerViewConfig = {
  id: 'runtime-flow',
  shortLabel: 'Arquitectura Runtime',
  title: 'Pipeline Zero Trust en Runtime (PEP / PDP 5D, Redis 7 y HITL)',
  subtitle:
    'Recorrido de punta a punta de una invocación agéntica fuera del LLM: intercepción PEP (< 90 ms), blindaje OWASP 2026 + LLM06, caché dual Redis 7, PostgreSQL 16 y 5 escenarios canónicos.',
  direction: 'LR',
  stats: [
    { label: 'Latencia PEP/PDP', value: '< 90 ms' },
    { label: 'Escenarios canónicos', value: '5' },
    { label: 'Suite Zero-Regression', value: '330 tests' },
    { label: 'Evaluación PDP', value: '5D Fail-Closed' }
  ],
  layers: [
    {
      id: 'client',
      label: 'Agente IA y Clientes',
      description:
        'Orquestación Multi-LLM (Gemini 2.5 Flash, OpenAI, Groq y Anthropic), portal ACME Corp (:9000) y cliente CLI.',
      accent: 'sky'
    },
    {
      id: 'control',
      label: 'Firewall PEP/PDP',
      description:
        'Intercepción síncrona, detección heurística OWASP Agentic 2026, sanitización LLM06 y motor determinista 5D.',
      accent: 'emerald'
    },
    {
      id: 'data',
      label: 'Persistencia y Caché',
      description:
        'Redis 7 (DB 0 y DB 1) para baja latencia y PostgreSQL 16 como fuente de verdad transaccional y forense.',
      accent: 'cyan'
    },
    {
      id: 'enforcement',
      label: 'Ejecución, HITL y Control',
      description:
        'Bandeja HITL en vivo por WebSockets, APIs destino ACME ERP (:9000) y Control Plane humano React 19 (:5173).',
      accent: 'amber'
    }
  ],
  nodes: [
    {
      id: 'agente-ia',
      kind: 'service',
      title: 'Agente IA y Multi-LLM',
      subtitle: 'ACME Corp (:9000) / CLI agent-demo / Handshake Multi-LLM',
      layerId: 'client',
      accent: 'sky',
      badge: 'Data Plane :9000',
      rankHint: 0,
      summary:
        'Propone invocaciones de herramientas mediante Function Calling usando el Handshake Universal Multi-LLM (Gemini 2.5 Flash, OpenAI, Groq o Anthropic) o Modo Guiado determinista.',
      whyDesigned:
        'Materializa el principio Zero Trust "Never trust the model as the enforcement point": el LLM razona sobre el pedido del usuario y selecciona la función, pero jamás decide si puede ejecutarla ni posee credenciales administrativas.',
      securityNotes: [
        'Se autentica únicamente en el Data Plane con cabecera X-AgentGuard-Key (ag_live_...) y auto-descubre UUIDs en GET /api/v1/gateway/context.',
        'Soporta detección automática de proveedor y fallback de modelos (gemini-2.5-flash, gemini-2.5-flash-lite, gpt-4o-mini, llama-3.3-70b-versatile, claude-3-5-haiku).',
        'Su systemInstruction evita la autocensura en el prompt para delegar el veredicto 100% en AgentGuard.'
      ],
      defenseQuestion: '¿Por qué no basta con instruir al modelo en el System Prompt para que no borre datos ni haga reembolsos altos?',
      defenseAnswer:
        'Porque un LLM es probabilístico y vulnerable a Prompt Injection (OWASP ASI01) y evasión (ASI04). Confiar la seguridad al prompt equivale a pedirle al propio actor no confiable que se controle a sí mismo; el enforcement debe vivir fuera del modelo.',
      docLink: '/volumenes/06_PORTAL_ACME_CORP_CONSULTANTE_BI_Y_AGENT_DEMO',
      docLabel: 'Vol. 06 — Portal ACME y Multi-LLM',
      highlights: [
        'Handshake Universal: Gemini 2.5 Flash, OpenAI, Groq y Anthropic',
        'Auto-discovery vía GET /api/v1/gateway/context',
        'Sin JWT humano ni acceso directo en Modo Protegido'
      ]
    },
    {
      id: 'pep-gateway',
      kind: 'service',
      title: 'Gateway PEP',
      subtitle: 'POST /api/v1/gateway/execute (FastAPI :8000)',
      layerId: 'control',
      accent: 'emerald',
      badge: 'PEP Síncrono :8000',
      rankHint: 1,
      summary:
        'Punto único de intercepción (PEPGatewayService) que ejecuta una cadena de 8 etapas: mide latencia real, valida tenant/API Key, verifica AgentTool N:N y aplica el veredicto final.',
      whyDesigned:
        'Centraliza todo el tráfico agéntico en una frontera HTTP REST única para garantizar que ninguna acción alcance las APIs destino sin pasar por sanitización, detección de amenazas, evaluación 5D y trazabilidad forense.',
      securityNotes: [
        'Valida X-AgentGuard-Key contra SHA-256 (acelerado en Redis DB 0) y verifica que organization_id coincida con el tenant de la llave (403 ante cruce).',
        'Comprueba Agent.status == ACTIVE y vínculo habilitado en AgentTool antes de invocar al PDP.',
        'Mide latency_ms real con time.perf_counter() y aplica escalamiento automático a HITL si amount > settings.max_autonomous_amount.'
      ],
      defenseQuestion: '¿Qué códigos HTTP devuelve POST /api/v1/gateway/execute y qué significa cada uno?',
      defenseAnswer:
        'Retorna 200 OK cuando el veredicto es ALLOW y la herramienta se despachó, 202 Accepted cuando es REQUIRE_APPROVAL (operación suspendida en HITL con approval_id) y 403 Forbidden ante DENY Fail-Closed o amenaza detectada.',
      docLink: '/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST',
      docLabel: 'Vol. 03 — Pipeline PEP en 8 Etapas',
      highlights: [
        'Cadena síncrona de 8 etapas en pep_gateway_service.py',
        'Verificación temprana de Agent ACTIVE y AgentTool N:N',
        'Latencia real medida con time.perf_counter() (< 90 ms)'
      ]
    },
    {
      id: 'threat-sanitizer',
      kind: 'service',
      title: 'ThreatDetector y Sanitizer',
      subtitle: 'OWASP Agentic 2026 (ASI01/03/04/05) + LLM06',
      layerId: 'control',
      accent: 'rose',
      badge: 'Blindaje OWASP',
      rankHint: 2,
      summary:
        'Inspecciona recursivamente parámetros y recursos contra ataques agénticos (inyección, exfiltración C2, evasión Base64 y SQL destructivo) y enmascara secretos/PII antes de persistir.',
      whyDesigned:
        'Actúa antes y por encima de las reglas comerciales: incluso si una política permitiera la acción, una amenaza detectada impone override inmediato a DENY con Alert CRITICAL, mientras SanitizerService impide fugas de secretos en trazas (LLM06).',
      securityNotes: [
        'ASI01 (Prompt Injection, conf. 0.95), ASI03 (Exfiltración a dominios C2 como attacker.io, conf. 0.99), ASI04 (decodificación Base64 recursiva, conf. 0.99) y ASI05 (SQL/comandos destructivos, conf. 0.98).',
        'SanitizerService redacta claves sensibles (password, token, api_key, bearer, cvv), patrones JWT (***REDACTED_JWT***) y tarjetas preservando solo los últimos 4 dígitos.',
        'Se ejecuta sobre copia profunda (copy.deepcopy) antes de cualquier escritura en executions o difusión por WebSocket.'
      ],
      defenseQuestion: '¿Qué ocurre si un atacante codifica en Base64 un comando DROP TABLE o una URL de exfiltración dentro de los parámetros?',
      defenseAnswer:
        'ThreatDetectorService detecta cadenas candidatas Base64 (>= 24 caracteres), las decodifica a UTF-8 y ejecuta recursivamente su analizador sobre el contenido decodificado (ASI04, confianza 0.99), disparando override a DENY y alerta CRITICAL.',
      docLink: '/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST',
      docLabel: 'Vol. 03 — Sanitizer LLM06 y ThreatDetector',
      highlights: [
        'Detecta ASI01, ASI03 (C2), ASI04 (Base64) y ASI05 (SQL)',
        'Override absoluto a DENY + Alert CRITICAL si is_threat=True',
        'Redacción recursiva OWASP LLM06 de Bearer, JWT y PII'
      ]
    },
    {
      id: 'pdp-engine',
      kind: 'service',
      title: 'Motor PDP 5D Fail-Closed',
      subtitle: 'f(Agente, Delegador, Acción, Recurso, Contexto)',
      layerId: 'control',
      accent: 'emerald',
      badge: 'Determinista 5D',
      rankHint: 3,
      summary:
        'Evalúa de forma determinista las reglas activas del tenant sobre cinco dimensiones y predicados JSONB, emitiendo siempre DENY ante ausencia de coincidencia o empate.',
      whyDesigned:
        'Sustituye decisiones probabilísticas por lógica verificable y reproducible: consulta políticas activas en PostgreSQL con ordenamiento determinista y evalúa operadores JSONB (max_amount, _gte, _lte, allowed_destinations, blocked_destinations, _in).',
      securityNotes: [
        'Precedencia estricta: regla específica de agente > Policy.priority > PolicyRule.priority > CASE (DENY 1, REQUIRE_APPROVAL 2, ALLOW 3) > created_at.',
        'Si una condición exige una clave ausente en el contexto, evalúa False y nunca asume permiso.',
        'Default Deny: si ninguna regla coincide retorna PolicyDecision.DENY con evaluated_policy_rule_id = None.'
      ],
      defenseQuestion: '¿Por qué se denomina evaluación 5D y qué sucede si falta un parámetro requerido por la regla?',
      defenseAnswer:
        'Porque decide en función de 5 dimensiones: Principal (Agente), Delegador (Usuario), Acción Atómica, Recurso y Contexto JSONB. Si falta una clave exigida por una condición, matches_conditions() devuelve False y el motor cae en Fail-Closed (DENY).',
      docLink: '/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST',
      docLabel: 'Vol. 03 — Motor PDP 5D (pdp_engine.py)',
      highlights: [
        'Precedencia determinista en SQL con desempate Fail-Closed',
        'Operadores JSONB: umbrales numéricos, destinos y conjuntos',
        'Sin coincidencia devuelve DENY (rule_id = NULL)'
      ]
    },
    {
      id: 'redis-cache',
      kind: 'service',
      title: 'Redis 7 (DB 0 y DB 1)',
      subtitle: 'DB 0 ag:apikey:* (60 s) y DB 1 acme:ag:context:* (45 s)',
      layerId: 'data',
      accent: 'cyan',
      badge: 'Caché Dual :6379',
      rankHint: 2,
      summary:
        'Almacén en memoria compartido en dos bases lógicas separadas: acelera verify_api_key e invalidación de políticas en AgentGuard (DB 0) y el descubrimiento de contexto y modelos LLM en ACME (DB 1).',
      whyDesigned:
        'Reduce la latencia del Data Plane por debajo de 90 ms sin sacrificar consistencia del motor PDP (que consulta directamente PostgreSQL). Ambos servicios implementan degradación transparente a caché TTL en memoria si Redis no está disponible.',
      securityNotes: [
        'DB 0 (backend/app/core/cache.py): cachea ag:apikey:{sha256} por 60 s (borrado inmediato al revocar), invalida policies:{org_id}:* y reporta estado en GET /health.',
        'DB 1 (acme-corp/server/cache.py): cachea acme:ag:context:{hash} (TTL 45 s), catálogo de modelos del Handshake Multi-LLM (TTL 600 s) y circuit-breaker de modelos caídos (600 s).',
        'Cumple OWASP LLM06: nunca almacena API Keys en claro en claves ni valores (identifica mediante digest SHA-256).'
      ],
      defenseQuestion: '¿Qué pasa si un administrador revoca una API Key que estaba cacheada en Redis DB 0 o si Redis se cae?',
      defenseAnswer:
        'Al revocar, ApiKeyService.revoke_api_key() ejecuta backend_cache.delete("ag:apikey:<sha256>") para invalidarla de inmediato. Y si Redis cae, tanto BackendCacheService como AcmeCacheService degradan con timeout de 0.3 s a memoria local TTL sin interrumpir el servicio.',
      docLink: '/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST',
      docLabel: 'Vol. 03 — Arquitectura y Redis 7',
      highlights: [
        'DB 0: ag:apikey:{sha256} (TTL 60 s) + policies:{org_id}:*',
        'DB 1: acme:ag:context:{hash} (45 s) + Handshake LLM (600 s)',
        'Degradación automática a memoria TTL sin secretos en claro'
      ]
    },
    {
      id: 'postgres-db',
      kind: 'service',
      title: 'PostgreSQL 16 (13 Tablas)',
      subtitle: 'agentguard_db (:5433) — SQLAlchemy 2.0 async + asyncpg',
      layerId: 'data',
      accent: 'cyan',
      badge: 'SSOT :5433',
      rankHint: 3,
      summary:
        'Fuente de verdad transaccional del sistema: alberga las 13 tablas multi-tenant, los 4 índices GIN, los 10 ENUMs nativos y soporta el bloqueo pesimista SELECT ... FOR UPDATE.',
      whyDesigned:
        'Elegido por integridad referencial estricta (24 FKs con CASCADE/RESTRICT/SET NULL), generación nativa de UUID v4 (gen_random_uuid()), indexado GIN sobre JSONB y atomicidad ACID en resoluciones HITL concurrentes.',
      securityNotes: [
        'Expuesto en el puerto host 5433 (contenedor 5432) y versionado con 6 migraciones lineales Alembic (001 a 006).',
        'Pool asíncrono asyncpg (pool_size=10, max_overflow=20, pool_pre_ping=True).',
        'Recarga ansiosa con selectinload en get_by_id() para erradicar MissingGreenlet en serialización Pydantic v2.'
      ],
      defenseQuestion: '¿Por qué PDPEngine consulta PostgreSQL directamente en lugar de leer las reglas desde Redis?',
      defenseAnswer:
        'Para priorizar consistencia fuerte e inmediatez determinista: en cuanto un administrador modifica una regla crítica en PoliciesView, la siguiente milésima de segundo el PDP ya aplica la versión exacta sin riesgo de reglas obsoletas en caché.',
      docLink: '/volumenes/01_MER_RELACIONAL_Y_FISICO_DB',
      docLabel: 'Vol. 01 — PostgreSQL 16 y Migraciones',
      highlights: [
        '13 tablas, 96 columnas, 4 índices GIN y 10 ENUMs nativos',
        'Lock pesimista SELECT ... FOR UPDATE en approvals',
        '6 migraciones Alembic lineales (001 a 006)'
      ]
    },
    {
      id: 'hitl-ws',
      kind: 'service',
      title: 'Bandeja HITL y WebSockets',
      subtitle: 'WS /api/v1/ws/{org_id} + TTL 900 s + FOR UPDATE',
      layerId: 'enforcement',
      accent: 'amber',
      badge: '202 HITL + WS',
      rankHint: 4,
      summary:
        'Coordina las operaciones suspendidas con HTTP 202 Accepted y difunde eventos en tiempo real (NEW_APPROVAL, RESOLVED_APPROVAL, NEW_ALERT, NEW_EXECUTION) aislados por organización.',
      whyDesigned:
        'Resuelve el acoplamiento de red de aprobaciones humanas (ADR-007): el agente recibe 202 de inmediato, el aprobador ve el ticket aparecer sin recargar la página y la aprobación dispara el re-despacho seguro hacia la herramienta destino.',
      securityNotes: [
        'WebSocketConnectionManager aísla conexiones en tenant_connections[organization_id] y soporta heartbeat PING/PONG.',
        'Resolución vía POST /api/v1/approvals/{id}/resolve exige JWT de APPROVER o ADMIN y valida TTL <= 900 s (15 min).',
        'Si expira el TTL, marca Approval=EXPIRED y Execution=REJECTED (Fail-Closed) sin despachar la operación.'
      ],
      defenseQuestion: '¿Qué sucede si nadie aprueba un reembolso retenido en la bandeja HITL durante más de 15 minutos?',
      defenseAnswer:
        'El TTL estricto de 900 segundos vence por diseño Fail-Closed: al intentar resolverlo, resolve_approval() transiciona el ticket a EXPIRED y la ejecución asociada a REJECTED, impidiendo que una operación financiera vieja se ejecute fuera de contexto.',
      docLink: '/volumenes/04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO',
      docLabel: 'Vol. 04 — Flujo HITL y WebSockets',
      highlights: [
        'HTTP 202 Accepted no bloqueante con TTL de 900 s',
        'Broadcast aislado por organization_id en /ws/{org_id}',
        'Re-despacho atómico solo si APPROVED bajo lock FOR UPDATE'
      ]
    },
    {
      id: 'acme-api',
      kind: 'service',
      title: 'APIs Destino ACME ERP',
      subtitle: 'POST /crm, /stripe, /catalog, /bi, /db (:9000 SQLite)',
      layerId: 'enforcement',
      accent: 'emerald',
      badge: 'ERP Protegido :9000',
      rankHint: 5,
      summary:
        'Endpoints REST reales del ERP cliente que ejecutan mutaciones y consultas sobre SQLite (7 tablas) únicamente cuando el Gateway PEP les despacha una solicitud autorizada.',
      whyDesigned:
        'Demuestra en vivo el impacto real de negocio (ADR-008): en Modo Protegido solo recibe solicitudes validadas por AgentGuard; ante cualquier DENY el tráfico nunca cruza la red hacia :9000.',
      securityNotes: [
        'PEPGatewayService._dispatch_to_tool() usa httpx.AsyncClient(timeout=3.0) con manejo Fail-Closed ante timeouts o HTTP >= 400.',
        'Auto-onboarding idempotente del CEO Lucas Duck al iniciar :9000 aprovisiona Consultante BI, BI & Ventas ACME y su política.',
        'Aislado físicamente en SQLite (acme_corp.db) con 0 dependencias de esquema hacia AgentGuard.'
      ],
      defenseQuestion: '¿Qué pasa si la API destino de ACME Corp se cae o responde con error 500 después de que el PDP emitió ALLOW?',
      defenseAnswer:
        'El método _dispatch_to_tool() captura excepciones de red y respuestas >= 400 con timeout estricto de 3 segundos, devolviendo un diccionario de error estructurado sin corromper la transacción ni propagar estados inconsistentes.',
      docLink: '/volumenes/06_PORTAL_ACME_CORP_CONSULTANTE_BI_Y_AGENT_DEMO',
      docLabel: 'Vol. 06 — Endpoints REST ACME Corp',
      highlights: [
        'Endpoints reales: /crm, /stripe, /catalog, /bi y /db',
        'Solo contactado tras ALLOW o resolución HITL APPROVED',
        'Timeout httpx 3.0 s con manejo Fail-Closed'
      ]
    },
    {
      id: 'control-plane',
      kind: 'service',
      title: 'Control Plane SPA y RBAC',
      subtitle: 'React 19 + Vite (:5173) — 9 vistas en español y 5 roles',
      layerId: 'enforcement',
      accent: 'sky',
      badge: 'Control Plane :5173',
      rankHint: 5,
      summary:
        'Panel web exclusivo para operadores humanos donde se gobiernan agentes, herramientas, políticas 5D, bandeja HITL en vivo, trazas forenses sanitizadas y simulación dry_run.',
      whyDesigned:
        'Mantiene una separación absoluta respecto del Data Plane: toda ruta administrativa exige JWT humano vinculado al SERVER_BOOT_ID del backend, aplica RBAC de 5 roles y rechaza con 403 Forbidden cualquier cabecera X-Agent-Id.',
      securityNotes: [
        'Blindaje Anti-IA en deps.py: toda petición con cabecera X-Agent-Id hacia rutas del Control Plane recibe 403 Forbidden inmediato.',
        'Sesión almacenada exclusivamente en sessionStorage y validada contra GET /health (boot_id) para invalidar sesiones tras reinicios.',
        'Cero silent fallbacks en api.ts: todo error HTTP se propaga como ApiError y se notifica en español mediante useToast().'
      ],
      defenseQuestion: '¿Qué impide que un agente de IA comprometido acceda al Control Plane para modificar sus propias políticas o aprobarse un ticket?',
      defenseAnswer:
        'Doble barrera: los agentes solo poseen X-AgentGuard-Key (nunca JWT humano) y todas las dependencias del Control Plane inspeccionan explícitamente X-Agent-Id, lanzando 403 Forbidden inmediato ante cualquier presencia de esa cabecera.',
      docLink: '/volumenes/05_MANUAL_FRONTEND_SPA_RBAC_Y_CREDENCIALES',
      docLabel: 'Vol. 05 — Manual Frontend SPA y Matriz RBAC',
      highlights: [
        'Blindaje Anti-IA: 403 Forbidden ante cabecera X-Agent-Id',
        'JWT HS256 atado a SERVER_BOOT_ID en sessionStorage',
        '9 vistas en español, Playground dry_run y 5 roles RBAC'
      ]
    }
  ],
  edges: [
    {
      id: 'rt-agent-pep',
      source: 'agente-ia',
      target: 'pep-gateway',
      label: 'HTTPS + X-API-Key',
      chenCardinality: 'Data Plane REST',
      onDelete: 'Fail-Closed (401/403)',
      relationTitle: 'Invocación Interceptada (Agente IA -> Gateway PEP)',
      relationType: 'HTTP POST /api/v1/gateway/execute',
      whyThisRelation:
        'Toda intención de herramienta propuesta por el LLM atraviesa este único punto de entrada enviando X-AgentGuard-Key, organization_id, agent_id, tool_id, action_name y parameters.',
      integrityRationale:
        'Fuerza el perímetro Zero Trust: el agente nunca habla con la API destino en Modo Protegido y cualquier clave ausente, revocada o de otro tenant falla cerrado (401 o 403).',
      defenseTip:
        'Remarca que la cabecera oficial del Data Plane es X-AgentGuard-Key (formato ag_live_...), nunca un Bearer JWT humano.',
      animatedByDefault: true
    },
    {
      id: 'rt-agent-redis',
      source: 'agente-ia',
      target: 'redis-cache',
      label: 'DB 1 Contexto 45 s',
      chenCardinality: 'Caché TTL',
      onDelete: 'Fallback a memoria',
      relationTitle: 'Auto-Discovery y Handshake LLM (ACME -> Redis DB 1)',
      relationType: 'Caché JSON en Redis DB 1 (acme:ag:context:*)',
      whyThisRelation:
        'Cachea la respuesta de GET /api/v1/gateway/context durante 45 s, el catálogo de modelos del Handshake Multi-LLM por 600 s y el circuit-breaker de modelos caídos por 600 s.',
      integrityRationale:
        'Las claves usan hash_secret() (digest SHA-256 corto) para no exponer jamás credenciales LLM o AgentGuard dentro de Redis (OWASP LLM06).',
      defenseTip:
        'Explica que usar DB 1 para ACME y DB 0 para AgentGuard aísla ambos espacios de claves sobre una misma instancia Redis 7.',
      edgeStyle: 'dashed'
    },
    {
      id: 'rt-pep-redis',
      source: 'pep-gateway',
      target: 'redis-cache',
      label: 'DB 0 API Key 60 s',
      chenCardinality: 'Caché TTL',
      onDelete: 'Invalidación al revocar',
      relationTitle: 'Verificación Rápida de API Key (PEP -> Redis DB 0)',
      relationType: 'Caché JSON ag:apikey:{sha256}',
      whyThisRelation:
        'Acelera verify_api_key() evitando una consulta SQL repetitiva en cada petición del Data Plane, manteniendo la latencia total PEP/PDP debajo de 90 ms.',
      integrityRationale:
        'Revocar una API Key borra inmediatamente la clave en Redis DB 0; si Redis no responde en 0.3 s, degrada limpiamente a caché en memoria TTL.',
      defenseTip:
        'Destaca que Redis también se monitorea en GET /health y recibe invalidación best-effort de policies:{org_id}:* al editar reglas.'
    },
    {
      id: 'rt-pep-threat',
      source: 'pep-gateway',
      target: 'threat-sanitizer',
      label: 'OWASP + LLM06',
      chenCardinality: 'Etapas 3 y 4 PEP',
      onDelete: 'Override a DENY',
      relationTitle: 'Sanitización y Detección Heurística (PEP -> ThreatDetector)',
      relationType: 'Pipeline interno síncrono en memoria',
      whyThisRelation:
        'Antes de persistir o evaluar negocio, SanitizerService enmascara secretos y PII (LLM06) y ThreatDetectorService inspecciona parámetros y recursos en busca de ASI01, ASI03, ASI04 y ASI05.',
      integrityRationale:
        'Si se detecta amenaza, el PEP impone override absoluto a DENY y crea Alert CRITICAL independientemente de cualquier regla ALLOW configurada.',
      defenseTip:
        'Clave para el Escenario 4: aunque existiera una regla permisiva, el dominio C2 attacker.io se frena en esta capa.'
    },
    {
      id: 'rt-threat-pdp',
      source: 'threat-sanitizer',
      target: 'pdp-engine',
      label: 'Contexto evaluable',
      chenCardinality: 'Etapa 6 PEP',
      onDelete: 'Fail-Closed',
      relationTitle: 'Evaluación Contextual 5D (Sanitizer -> Motor PDP)',
      relationType: 'Invocación interna PDPEngine.evaluate()',
      whyThisRelation:
        'Entrega la tupla 5D completa (Agente, Delegador, Acción Atómica, Recurso y Contexto) junto con el resultado del análisis de seguridad para determinar el veredicto definitivo.',
      integrityRationale:
        'Mantiene el motor PDP como una función determinista pura desacoplada de la red externa y del razonamiento probabilístico del LLM.',
      defenseTip:
        'Recuerda el orden de verificación previo: si el agente está inactivo o falta el vínculo AgentTool, el PEP corta en Etapa 5 antes de llegar aquí.'
    },
    {
      id: 'rt-pdp-pg',
      source: 'pdp-engine',
      target: 'postgres-db',
      label: 'Reglas 5D + AgentTool',
      chenCardinality: 'SQLAlchemy async',
      onDelete: 'Consistencia fuerte',
      relationTitle: 'Consulta Determinista de Reglas (PDP -> PostgreSQL 16)',
      relationType: 'SELECT con ORDER BY determinista y CASE Fail-Closed',
      whyThisRelation:
        'Consulta directamente las reglas activas en policy_rules unidas a policies dentro del tenant para garantizar consistencia transaccional inmediata tras cualquier cambio de política.',
      integrityRationale:
        'Evitar caché de lectura obsoleta en las reglas garantiza que un bloqueo recién creado por un ADMIN surta efecto al instante.',
      defenseTip:
        'Usa esta arista para explicar la cláusula CASE de desempate (DENY 1 < REQUIRE_APPROVAL 2 < ALLOW 3).'
    },
    {
      id: 'rt-pep-pg',
      source: 'pep-gateway',
      target: 'postgres-db',
      label: 'Traza y Alerta',
      chenCardinality: 'ACID Inmutable',
      onDelete: 'Solo inserción',
      relationTitle: 'Persistencia Forense Atómica (PEP -> PostgreSQL 16)',
      relationType: 'INSERT en executions, approvals y alerts',
      whyThisRelation:
        'Persiste de forma atómica cada decisión con latency_ms real, request_context ya sanitizado (LLM06), el ticket Approval (si REQUIRE_APPROVAL) y la Alert (si hubo amenaza o bloqueo HIGH/CRITICAL).',
      integrityRationale:
        'Garantiza trazabilidad forense inmutable de cada intento, incluidos los bloqueos tempranos que nunca contactaron a ACME Corp.',
      defenseTip:
        'Aclara que en el Playground (POST /gateway/simulate) el flag dry_run=True omite esta escritura para no contaminar trazas reales.'
    },
    {
      id: 'rt-pep-acme',
      source: 'pep-gateway',
      target: 'acme-api',
      label: 'ALLOW 200 Proxy',
      chenCardinality: 'Solo si ALLOW',
      onDelete: 'Timeout 3.0 s Fail-Closed',
      relationTitle: 'Despacho Seguro HTTP REST (PEP -> ACME Corp API)',
      relationType: 'httpx.AsyncClient POST {endpoint_url}/{action_name}',
      whyThisRelation:
        'Actúa como proxy de ejecución solo cuando el veredicto final es ALLOW (Escenario 1 create_quote y BI query_sales), entregando la respuesta real del ERP al agente.',
      integrityRationale:
        'Si la decisión es DENY o REQUIRE_APPROVAL, esta conexión jamás se abre: el ERP permanece completamente invisible e intocable.',
      defenseTip:
        'Contrasta este flujo con el Modo Directo de ACME Corp, donde el agente salta el Gateway PEP y ejecuta directamente sobre SQLite.'
    },
    {
      id: 'rt-pep-hitl',
      source: 'pep-gateway',
      target: 'hitl-ws',
      label: '202 HITL / Alert WS',
      chenCardinality: 'Eventos en vivo',
      onDelete: 'Aislado por tenant',
      relationTitle: 'Suspensión HITL y Notificación Reactiva (PEP -> HITL/WS)',
      relationType: 'Emisión de NEW_APPROVAL, NEW_ALERT y NEW_EXECUTION',
      whyThisRelation:
        'Cuando el PDP emite REQUIRE_APPROVAL (Escenario 3 refund >= $500) o se genera una alerta crítica (Escenario 4), el PEP emite el evento en tiempo real a los operadores conectados del tenant.',
      integrityRationale:
        'Evita long-polling bloqueante: el agente recibe 202 Accepted al instante mientras los supervisores humanos ven el ticket aparecer en vivo.',
      defenseTip:
        'Menciona los 5 eventos de negocio del WebSocket: NEW_APPROVAL, RESOLVED_APPROVAL, NEW_ALERT, NEW_EXECUTION y ALERT_STATUS_UPDATED.'
    },
    {
      id: 'rt-pg-hitl',
      source: 'postgres-db',
      target: 'hitl-ws',
      label: 'FOR UPDATE 900 s',
      chenCardinality: 'Lock pesimista',
      onDelete: 'TTL 900 s Fail-Closed',
      relationTitle: 'Resolución Atómica de Tickets (PostgreSQL -> HITL)',
      relationType: 'SELECT ... FOR UPDATE + validación TTL 15 min',
      whyThisRelation:
        'Al resolver un ticket en /approvals/{id}/resolve, PostgreSQL bloquea la fila de approvals de forma exclusiva hasta validar estado PENDING, vigencia <= 900 s y persistir el veredicto humano.',
      integrityRationale:
        'Elimina condiciones de carrera TOCTOU entre dos aprobadores simultáneos y fuerza transición a EXPIRED + REJECTED si venció el plazo.',
      defenseTip:
        'Indica que el TTL de 900 segundos se calcula dinámicamente contra approvals.created_at (no existe columna expires_at).',
      edgeStyle: 'dashed'
    },
    {
      id: 'rt-hitl-acme',
      source: 'hitl-ws',
      target: 'acme-api',
      label: 'Re-despacho APPROVED',
      chenCardinality: 'Solo tras APPROVED',
      onDelete: 'Cancelado si REJECTED/EXPIRED',
      relationTitle: 'Reanudación Post-Aprobación (HITL -> ACME Corp API)',
      relationType: 'Despacho diferido POST /stripe/refund',
      whyThisRelation:
        'Una vez que un humano con rol APPROVER o ADMIN aprueba el ticket dentro del TTL de 900 s, PEPGatewayService reanuda la ejecución llamando a la API destino y marca Execution como EXECUTED.',
      integrityRationale:
        'Si el humano rechaza el ticket o vence el TTL, el re-despacho jamás ocurre y la tabla refunds de ACME permanece intacta.',
      defenseTip:
        'Demostración en vivo más impactante: mostrar refunds vacía tras el 202 y ver aparecer la fila recién al presionar Aprobar en ApprovalsView.',
      edgeStyle: 'dashed'
    },
    {
      id: 'rt-hitl-cp',
      source: 'hitl-ws',
      target: 'control-plane',
      label: 'WS en vivo y Resolve',
      chenCardinality: 'Multi-Tenant WS + JWT',
      onDelete: '403 si X-Agent-Id',
      relationTitle: 'Supervisión Humana en Tiempo Real (HITL/WS -> Control Plane)',
      relationType: 'WebSocket /api/v1/ws/{org_id} + POST /approvals/{id}/resolve',
      whyThisRelation:
        'Conecta el motor de eventos en vivo con el hook useAgentGuardWebSocket de React 19 para actualizar ApprovalsView, AlertsView y TracesView al instante y recibir la decisión humana firmada con JWT.',
      integrityRationale:
        'Solo cuentas humanas con JWT válido (y boot_id vigente) pueden resolver aprobaciones; toda cabecera X-Agent-Id es rechazada con 403.',
      defenseTip:
        'Recuerda que los WebSockets operan en memoria Python dentro de WebSocketConnectionManager, segmentados estrictamente por organization_id.'
    },
    {
      id: 'rt-pg-cp',
      source: 'postgres-db',
      target: 'control-plane',
      label: 'Trazas, KPIs y RBAC',
      chenCardinality: '17 routers REST',
      onDelete: 'Aislado por org_id',
      relationTitle: 'Gobernanza y Observabilidad (PostgreSQL -> Control Plane)',
      relationType: 'REST /api/v1/* con JWT HS256 y 5 roles RBAC',
      whyThisRelation:
        'Alimenta las 9 vistas del Dashboard React 19: analítica de 24 h, trazas sanitizadas, bitácora audit_events, gestión de políticas 5D y asistente QuickSetupWizard.',
      integrityRationale:
        'Cada endpoint valida el rol humano (ADMIN, APPROVER, OPERATOR, AUDITOR, VIEWER) y filtra todas las consultas por organization_id.',
      defenseTip:
        'Menciona que al reiniciar el backend cambia SERVER_BOOT_ID en /health y AuthContext cierra automáticamente sesiones antiguas.',
      edgeStyle: 'dashed'
    }
  ],
  tourSteps: [
    {
      id: 'rt-tour-perimeter',
      title: 'Principio Zero Trust fuera del LLM',
      badge: 'Paso 1 de 4',
      narrative:
        'El agente IA en ACME Corp (:9000) usa el Handshake Universal Multi-LLM (Gemini 2.5 Flash, OpenAI, Groq o Anthropic) para proponer una acción, pero nunca ejecuta directo en Modo Protegido: envía la intención con X-AgentGuard-Key al Gateway PEP (:8000), acelerado por Redis DB 0 y DB 1.',
      focusNodeIds: ['agente-ia', 'pep-gateway', 'redis-cache'],
      focusEdgeId: 'rt-agent-pep',
      selectNodeId: 'pep-gateway',
      layerId: 'control'
    },
    {
      id: 'rt-tour-owasp',
      title: 'Sanitización LLM06 y detección OWASP 2026',
      badge: 'Paso 2 de 4',
      narrative:
        'Antes de persistir o evaluar negocio, SanitizerService enmascara tokens Bearer, JWT y PII (OWASP LLM06) y ThreatDetectorService inspecciona ASI01, ASI03, ASI04 (Base64 recursivo) y ASI05. Una amenaza detectada fuerza DENY inmediato y dispara Alert CRITICAL.',
      focusNodeIds: ['pep-gateway', 'threat-sanitizer', 'pdp-engine'],
      focusEdgeId: 'rt-pep-threat',
      selectNodeId: 'threat-sanitizer',
      layerId: 'control'
    },
    {
      id: 'rt-tour-pdp-data',
      title: 'Evaluación 5D determinista y doble caché Redis',
      badge: 'Paso 3 de 4',
      narrative:
        'El motor PDP 5D consulta directamente PostgreSQL 16 (consistencia fuerte sin reglas obsoletas) mientras Redis 7 acelera API Keys en DB 0 (60 s) y contexto/modelos en DB 1 (45 s / 600 s), logrando evaluaciones por debajo de 90 ms con desempate Fail-Closed.',
      focusNodeIds: ['pdp-engine', 'redis-cache', 'postgres-db'],
      focusEdgeId: 'rt-pdp-pg',
      selectNodeId: 'pdp-engine',
      layerId: 'data'
    },
    {
      id: 'rt-tour-hitl-cp',
      title: 'HITL asíncrono, APIs ACME y Control Plane humano',
      badge: 'Paso 4 de 4',
      narrative:
        'Las acciones permitidas (ALLOW) se despachan a ACME ERP (:9000); las sensibles (REQUIRE_APPROVAL) devuelven 202 Accepted y notifican por WebSockets al Control Plane React 19 (:5173), donde solo un humano APPROVER/ADMIN resuelve bajo bloqueo SELECT ... FOR UPDATE y TTL de 900 s.',
      focusNodeIds: ['hitl-ws', 'acme-api', 'control-plane'],
      focusEdgeId: 'rt-hitl-cp',
      selectNodeId: 'hitl-ws',
      layerId: 'enforcement'
    }
  ],
  scenarios: [
    {
      id: 'escenario-1',
      code: 'ESC-01',
      title: 'Cotización comercial permitida',
      action: 'create_quote',
      verdict: 'ALLOW',
      httpStatus: '200 OK',
      accent: 'emerald',
      summary:
        'Operación comercial legítima ($2,500 USD <= $10,000 USD) autorizada y despachada a ACME CRM.',
      narrative:
        'El Agente de Ventas invoca create_quote por $2,500 USD. El PEP valida la API Key en Redis DB 0, confirma el vínculo activo en agent_tools, sanitiza y verifica ausencia de amenazas OWASP, el PDP aplica la regla ALLOW (amount <= 10,000), despacha POST /crm/create_quote a ACME (:9000) y registra Execution(EXECUTED) con latency_ms real.',
      activeNodeIds: [
        'agente-ia',
        'pep-gateway',
        'redis-cache',
        'threat-sanitizer',
        'pdp-engine',
        'postgres-db',
        'acme-api'
      ],
      activeEdgeIds: [
        'rt-agent-pep',
        'rt-agent-redis',
        'rt-pep-redis',
        'rt-pep-threat',
        'rt-threat-pdp',
        'rt-pdp-pg',
        'rt-pep-pg',
        'rt-pep-acme'
      ],
      focusNodeId: 'acme-api',
      keyFacts: [
        'Veredicto: ALLOW con respuesta HTTP 200 OK y payload real de ACME CRM.',
        'Cumple la condición JSONB amount <= 10,000 y tiene vínculo habilitado en agent_tools.',
        'Persiste Execution(EXECUTED) con latency_ms medida por reloj monotónico y fila QUO-XXXXXXXX en SQLite.'
      ]
    },
    {
      id: 'escenario-2',
      code: 'ESC-02',
      title: 'Sabotaje de precio bloqueado',
      action: 'update_price',
      verdict: 'DENY',
      httpStatus: '403 Forbidden',
      accent: 'rose',
      summary:
        'Abuso de privilegio detenido tempranamente por ausencia de capacidad en agent_tools.',
      narrative:
        'El Agente de Ventas intenta invocar update_price para rebajar un producto del catálogo ($10 USD / $9.99 USD). Al verificar capacidades en Etapa 5, PEPGatewayService comprueba que el agente no tiene vinculada la herramienta Catálogo en agent_tools: aplica Fail-Closed inmediato, persiste Execution(DENY, REJECTED) y devuelve 403 sin contactar jamás a ACME (:9000).',
      activeNodeIds: [
        'agente-ia',
        'pep-gateway',
        'redis-cache',
        'threat-sanitizer',
        'postgres-db'
      ],
      activeEdgeIds: ['rt-agent-pep', 'rt-pep-redis', 'rt-pep-threat', 'rt-pep-pg'],
      focusNodeId: 'pep-gateway',
      keyFacts: [
        'Bloqueo temprano: Agent lacks capability (sin fila enabled=true en agent_tools).',
        'El endpoint POST /catalog/update_price de ACME Corp jamás recibe tráfico.',
        'En Modo Directo sin AgentGuard el precio del Cohete Mk-IV se sabotea a $9.99 en SQLite.'
      ]
    },
    {
      id: 'escenario-3',
      code: 'ESC-03',
      title: 'Reembolso HITL >= $500 USD',
      action: 'refund',
      verdict: 'REQUIRE_APPROVAL',
      httpStatus: '202 Accepted',
      accent: 'amber',
      summary:
        'Operación financiera de alto impacto retenida en bandeja HITL con WebSocket y bloqueo FOR UPDATE.',
      narrative:
        'El agente solicita un reembolso en Stripe por >= $500 USD ($4,500 USD en CLI / $12,500 USD en ACME). El PDP emite REQUIRE_APPROVAL, el PEP responde 202 Accepted sin contactar a Stripe, crea Approval(PENDING) con TTL de 900 s y difunde NEW_APPROVAL por WebSocket. Al aprobar un humano APPROVER/ADMIN, resolve_approval() toma lock SELECT ... FOR UPDATE y reanuda el despacho a POST /stripe/refund.',
      activeNodeIds: [
        'agente-ia',
        'pep-gateway',
        'redis-cache',
        'threat-sanitizer',
        'pdp-engine',
        'postgres-db',
        'hitl-ws',
        'control-plane',
        'acme-api'
      ],
      activeEdgeIds: [
        'rt-agent-pep',
        'rt-pep-redis',
        'rt-pep-threat',
        'rt-threat-pdp',
        'rt-pdp-pg',
        'rt-pep-pg',
        'rt-pep-hitl',
        'rt-pg-hitl',
        'rt-hitl-cp',
        'rt-hitl-acme'
      ],
      focusNodeId: 'hitl-ws',
      keyFacts: [
        'Suspensión asíncrona HTTP 202 Accepted con ticket único en approvals (1 : 0..1).',
        'Resolución atómica con SELECT ... FOR UPDATE (anti-doble cobro) y TTL estricto de 900 s.',
        'Solo humanos APPROVER o ADMIN con JWT pueden resolver; X-Agent-Id recibe 403 Forbidden.'
      ]
    },
    {
      id: 'escenario-4',
      code: 'ESC-04',
      title: 'Exfiltración C2 OWASP ASI03',
      action: 'export_customers',
      verdict: 'DENY + ALERT',
      httpStatus: '403 Forbidden',
      accent: 'rose',
      summary:
        'Exfiltración hacia dominio atacante bloqueada con sanitización LLM06 y alerta CRITICAL.',
      narrative:
        'El agente intenta exportar la base de clientes VIP hacia https://attacker.io/leak. SanitizerService redacta cualquier token Bearer y credenciales (OWASP LLM06), ThreatDetectorService identifica el dominio C2 (OWASP ASI03, confianza 0.99), fuerza override Fail-Closed a DENY, persiste _security_threat y Alert(CRITICAL, OPEN) y emite NEW_ALERT por WebSocket + webhook SIEM HMAC-SHA256.',
      activeNodeIds: [
        'agente-ia',
        'pep-gateway',
        'redis-cache',
        'threat-sanitizer',
        'pdp-engine',
        'postgres-db',
        'hitl-ws',
        'control-plane'
      ],
      activeEdgeIds: [
        'rt-agent-pep',
        'rt-pep-redis',
        'rt-pep-threat',
        'rt-threat-pdp',
        'rt-pdp-pg',
        'rt-pep-pg',
        'rt-pep-hitl',
        'rt-hitl-cp'
      ],
      focusNodeId: 'threat-sanitizer',
      keyFacts: [
        'OWASP ASI03 detectado con confianza 0.99 (dominio no confiable attacker.io).',
        'OWASP LLM06: tokens Bearer, API keys y PII enmascarados antes de escribir en PostgreSQL.',
        'Dispara Alert(CRITICAL, OPEN), broadcast WebSocket NEW_ALERT y SIEM HMAC-SHA256 sin tocar /crm/export_customers.'
      ]
    },
    {
      id: 'escenario-5',
      code: 'ESC-05',
      title: 'Consultante BI: borrado bloqueado',
      action: 'delete_sales',
      verdict: 'DENY',
      httpStatus: '403 Forbidden',
      accent: 'rose',
      summary:
        'Principio de menor privilegio en Consultante BI: protege SQLite y degrada a filtro visual local.',
      narrative:
        'Un empleado administrativo pide al Consultante BI borrar las ventas menores a $1,000 USD. El LLM propone delete_sales; el PDP evalúa la política "Gobernanza Consultante BI (Solo Lectura)" (ALLOW query_sales prio 150, DENY delete_sales prio 250) y bloquea con 403 Forbidden + Alert CRITICAL (riesgo CRITICAL). SQLite queda 100% intacta y la UI ofrece un filtro visual no destructivo.',
      activeNodeIds: [
        'agente-ia',
        'pep-gateway',
        'redis-cache',
        'threat-sanitizer',
        'pdp-engine',
        'postgres-db',
        'hitl-ws',
        'control-plane'
      ],
      activeEdgeIds: [
        'rt-agent-pep',
        'rt-agent-redis',
        'rt-pep-redis',
        'rt-pep-threat',
        'rt-threat-pdp',
        'rt-pdp-pg',
        'rt-pep-pg',
        'rt-pep-hitl',
        'rt-hitl-cp'
      ],
      focusNodeId: 'pdp-engine',
      keyFacts: [
        'Política de solo lectura: ALLOW query_sales (prio 150) y DENY delete_sales (prio 250).',
        'Mantiene intactas las 15 ventas de acme_corp.db y genera Alert CRITICAL en AgentGuard.',
        'Degradación elegante en ACME UI: ofrece el botón "Ocultar < $1,000 de esta vista (sin tocar la DB)".'
      ]
    }
  ]
}

export const EXPLORER_VIEWS: Record<ExplorerViewId, ExplorerViewConfig> = {
  'mer-postgres': merPostgresView,
  'mer-acme': merAcmeView,
  'runtime-flow': runtimeFlowView
}

export const EXPLORER_VIEW_LIST: ExplorerViewConfig[] = [
  EXPLORER_VIEWS['mer-postgres'],
  EXPLORER_VIEWS['mer-acme'],
  EXPLORER_VIEWS['runtime-flow']
]
