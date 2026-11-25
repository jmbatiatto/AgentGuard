import { defineConfig } from 'vitepress'

const rawBase = process.env.VITEPRESS_BASE || '/'
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

export default defineConfig({
  title: 'AgentGuard Docs',
  description:
    'Documentación Oficial Verificada, Arquitectura Zero Trust y Defensa Académica (ITU — UNCuyo 2026)',
  lang: 'es-AR',
  base,
  cleanUrls: true,
  ignoreDeadLinks: false,
  appearance: 'dark',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo-agentguard.svg` }],
    ['meta', { name: 'theme-color', content: '#10b981' }]
  ],

  themeConfig: {
    logo: '/logo-agentguard.svg',
    siteTitle: 'AgentGuard Docs',

    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Galería 4K', link: '/galeria-diagramas' },
      { text: 'Modo Defensa & QR', link: '/modo-presentacion' },
      {
        text: 'Volúmenes',
        items: [
          {
            text: 'Índice Maestro',
            link: '/volumenes/INDICE_MAESTRO'
          },
          {
            text: 'Guía Maestra README',
            link: '/volumenes/README'
          },
          {
            text: 'Presentación Canva & Guion',
            link: '/volumenes/07_PRESENTACION_CANVA_Y_GUION_DEFENSA'
          },
          {
            text: 'Auditoría Forense',
            link: '/volumenes/00_INFORME_DISCREPANCIAS_DOC_VS_CODIGO_REAL'
          }
        ]
      },
      {
        text: 'Canva Slides',
        link: 'https://canva.link/59p7pjdurhxr1vk'
      },
      {
        text: 'Trello SCRUM',
        link: 'https://trello.com/b/2Ay99TRz/agentguard-tablero-scrum-itu-2026'
      }
    ],

    sidebar: [
      {
        text: 'Portal y Defensa',
        collapsed: false,
        items: [
          { text: 'Inicio del Portal', link: '/' },
          { text: 'Galería Interactiva 4K', link: '/galeria-diagramas' },
          { text: 'Modo Defensa & Código QR', link: '/modo-presentacion' },
          { text: 'Índice Maestro e Itinerarios', link: '/volumenes/INDICE_MAESTRO' },
          {
            text: '07 · Presentación Canva y Guion',
            link: '/volumenes/07_PRESENTACION_CANVA_Y_GUION_DEFENSA'
          }
        ]
      },
      {
        text: 'Arquitectura y Decisiones',
        collapsed: false,
        items: [
          { text: 'Guía Maestra SSOT (README)', link: '/volumenes/README' },
          { text: 'Decisiones Arquitectónicas (ADRs)', link: '/volumenes/DECISIONS' },
          {
            text: '00 · Auditoría Forense vs. Código',
            link: '/volumenes/00_INFORME_DISCREPANCIAS_DOC_VS_CODIGO_REAL'
          }
        ]
      },
      {
        text: 'Persistencia y Modelado (DB)',
        collapsed: false,
        items: [
          {
            text: '01 · MER Relacional, Físico y Alembic',
            link: '/volumenes/01_MER_RELACIONAL_Y_FISICO_DB'
          },
          {
            text: '02 · MER Conceptual Chen y Atributos',
            link: '/volumenes/02_MER_CONCEPTUAL_CHEN_Y_ATRIBUTOS'
          }
        ]
      },
      {
        text: 'Runtime PEP/PDP y Demo',
        collapsed: false,
        items: [
          {
            text: '03 · Arquitectura Runtime PEP/PDP y REST',
            link: '/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST'
          },
          {
            text: '04 · Secuencias, Estados y Casos de Uso',
            link: '/volumenes/04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO'
          }
        ]
      },
      {
        text: 'Frontend y Ecosistema ACME',
        collapsed: false,
        items: [
          {
            text: '05 · Manual Frontend SPA y RBAC',
            link: '/volumenes/05_MANUAL_FRONTEND_SPA_RBAC_Y_CREDENCIALES'
          },
          {
            text: '06 · Portal ACME Corp y Consultante BI',
            link: '/volumenes/06_PORTAL_ACME_CORP_CONSULTANTE_BI_Y_AGENT_DEMO'
          }
        ]
      }
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Buscar en la documentación...',
            buttonAriaLabel: 'Buscar en la documentación'
          },
          modal: {
            displayDetails: 'Mostrar vista detallada',
            resetButtonTitle: 'Limpiar consulta',
            backButtonTitle: 'Cerrar buscador',
            noResultsText: 'No se encontraron resultados para',
            footer: {
              selectText: 'para abrir',
              selectKeyAriaLabel: 'Enter',
              navigateText: 'para desplazarse',
              navigateUpKeyAriaLabel: 'Flecha arriba',
              navigateDownKeyAriaLabel: 'Flecha abajo',
              closeText: 'para cerrar',
              closeKeyAriaLabel: 'Escape'
            }
          }
        }
      }
    },

    outline: {
      level: [2, 3],
      label: 'En esta página'
    },

    docFooter: {
      prev: 'Anterior',
      next: 'Siguiente'
    },

    darkModeSwitchLabel: 'Apariencia',
    lightModeSwitchTitle: 'Cambiar a tema claro',
    darkModeSwitchTitle: 'Cambiar a tema oscuro',
    sidebarMenuLabel: 'Menú documental',
    returnToTopLabel: 'Volver arriba',
    langMenuLabel: 'Idioma',
    skipToContentLabel: 'Saltar al contenido principal',

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/jmbatiatto/AgentGuard',
        ariaLabel: 'Repositorio oficial de AgentGuard en GitHub'
      }
    ],

    footer: {
      message:
        'Documentación Oficial Verificada (SSOT) · Cátedra Desarrollo Web — ITU, UNCuyo (2026)',
      copyright:
        'Equipo AgentGuard · Agustín Belardinelli · Juan Martín Battiato · Mateo Ortega · Jonathan Araujo'
    }
  },

  markdown: {
    config(md) {
      const originalFence =
        md.renderer.rules.fence ||
        ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        if (token && token.info.trim().toLowerCase() === 'mermaid') {
          return `<MermaidDiagram code="${encodeURIComponent(token.content)}" />\n`
        }
        return originalFence(tokens, idx, options, env, self)
      }
    }
  }
})
