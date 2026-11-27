import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORTAL_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PORTAL_ROOT, '..');
const ASSETS_DIR = path.join(REPO_ROOT, 'assets-presentacion');
const SVG_DIR = path.join(ASSETS_DIR, 'svg');
const PNG_DARK_DIR = path.join(ASSETS_DIR, 'png-4k-dark');
const PNG_LIGHT_DIR = path.join(ASSETS_DIR, 'png-4k-light');
const MERMAID_SCRIPT_PATH = path.join(
  PORTAL_ROOT,
  'node_modules',
  'mermaid',
  'dist',
  'mermaid.min.js'
);

const CANONICAL_DOCS_ORDER = [
  'README.md',
  'INDICE_MAESTRO.md',
  '01_MER_RELACIONAL_Y_FISICO_DB.md',
  '02_MER_CONCEPTUAL_CHEN_Y_ATRIBUTOS.md',
  '03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST.md',
  '04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO.md',
  '05_MANUAL_FRONTEND_SPA_RBAC_Y_CREDENCIALES.md',
  '06_PORTAL_ACME_CORP_CONSULTANTE_BI_Y_AGENT_DEMO.md',
];

const VOLUMEN_TITLES = {
  'README.md': 'Guía Maestra del Proyecto y Arquitectura Zero Trust (README)',
  'INDICE_MAESTRO.md': 'Índice Maestro e Itinerarios de Evaluación',
  '01_MER_RELACIONAL_Y_FISICO_DB.md':
    'Volumen 01 · Modelo Entidad-Relación Relacional, Esquema Físico y Alembic',
  '02_MER_CONCEPTUAL_CHEN_Y_ATRIBUTOS.md':
    'Volumen 02 · MER Conceptual Notación Chen, Cardinalidades y Atributos',
  '03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST.md':
    'Volumen 03 · Arquitectura Runtime PEP/PDP 5D y Catálogo API REST',
  '04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO.md':
    'Volumen 04 · Secuencias Runtime, Máquinas de Estado y Casos de Uso',
  '05_MANUAL_FRONTEND_SPA_RBAC_Y_CREDENCIALES.md':
    'Volumen 05 · Manual Frontend SPA (React 19), Matriz RBAC y Credenciales',
  '06_PORTAL_ACME_CORP_CONSULTANTE_BI_Y_AGENT_DEMO.md':
    'Volumen 06 · Portal Empresarial ACME Corp, Consultante BI (Gemini 3.8) y CLI Demo',
};

const DARK_BG = '#0b1120';
const LIGHT_BG = '#ffffff';
const PADDING_PX = 32;
const MAX_SKIA_DIMENSION = 15360;

/**
 * Resuelve `../documentación final` tolerando diferencias de normalización Unicode (NFC/NFD)
 * entre entornos Windows, macOS y Linux.
 */
function resolveDocsSourceDir() {
  const directCandidate = path.join(REPO_ROOT, 'documentación final');
  if (fs.existsSync(directCandidate)) {
    return directCandidate;
  }

  const targetNormalized = 'documentación final'.normalize('NFC');
  const entries = fs.readdirSync(REPO_ROOT, { withFileTypes: true });
  const matched = entries.find(
    (entry) => entry.isDirectory() && entry.name.normalize('NFC') === targetNormalized
  );

  if (matched) {
    return path.join(REPO_ROOT, matched.name);
  }

  throw new Error(
    `[export-diagrams] No se encontró la carpeta fuente "../documentación final/" en ${REPO_ROOT}`
  );
}

/**
 * Localiza Chrome o Microsoft Edge instalado localmente sin descargas externas.
 */
function resolveBrowserExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    '[export-diagrams] No se encontró Google Chrome ni Microsoft Edge local. Definí CHROME_PATH si está en otra ruta.'
  );
}

function resetDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Limpia encabezados Markdown para obtener un título legible en español.
 */
function cleanHeadingTitle(rawHeading, fallbackTitle) {
  if (!rawHeading) return fallbackTitle;

  const cleaned = rawHeading
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\s]+/gu, '')
    .replace(/^\d+(?:\.\d+)*\.?\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || fallbackTitle;
}

/**
 * Convierte un título en un slug ASCII limpio y estable para nombres de archivo.
 */
function slugifyAscii(text) {
  const base = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!base) return 'diagrama';
  if (base.length <= 54) return base;

  const sliced = base.slice(0, 54).replace(/-+$/g, '');
  const lastDash = sliced.lastIndexOf('-');
  return lastDash > 24 ? sliced.slice(0, lastDash) : sliced;
}

/**
 * Detecta el tipo de diagrama Mermaid ignorando comentarios `%%` y bloques frontmatter `---`.
 */
function detectDiagramType(mermaidCode) {
  const lines = mermaidCode.split(/\r?\n/).map((line) => line.trim());
  let idx = 0;

  while (idx < lines.length && (!lines[idx] || lines[idx].startsWith('%%'))) {
    idx += 1;
  }

  if (lines[idx] === '---') {
    idx += 1;
    while (idx < lines.length && lines[idx] !== '---') {
      idx += 1;
    }
    idx += 1;
  }

  while (idx < lines.length && (!lines[idx] || lines[idx].startsWith('%%'))) {
    idx += 1;
  }

  const headerLine = lines[idx] || '';

  if (/^(?:flowchart|graph)\b/i.test(headerLine)) return 'flowchart';
  if (/^sequenceDiagram\b/.test(headerLine)) return 'sequenceDiagram';
  if (/^erDiagram\b/.test(headerLine)) return 'erDiagram';
  if (/^stateDiagram-v2\b/.test(headerLine)) return 'stateDiagram-v2';
  if (/^stateDiagram\b/.test(headerLine)) return 'stateDiagram';
  if (/^classDiagram\b/.test(headerLine)) return 'classDiagram';
  if (/^gantt\b/i.test(headerLine)) return 'gantt';
  if (/^pie\b/i.test(headerLine)) return 'pie';
  if (/^mindmap\b/i.test(headerLine)) return 'mindmap';

  const firstToken = headerLine.split(/\s+/)[0];
  return firstToken || 'flowchart';
}

/**
 * Asigna exactamente una de las 5 categorías oficiales del portal interactivo.
 */
function resolveCategory(docFile) {
  if (docFile.startsWith('01_') || docFile.startsWith('02_')) {
    return 'Base de Datos y Chen';
  }
  if (
    docFile.startsWith('03_') ||
    docFile.startsWith('04_') ||
    docFile === 'README.md'
  ) {
    return 'Runtime PEP/PDP y Secuencias';
  }
  if (docFile.startsWith('05_')) {
    return 'Frontend y RBAC';
  }
  if (docFile.startsWith('06_')) {
    return 'ACME Corp y Gemini';
  }
  return 'Navegación';
}

/**
 * Normaliza código Mermaid para compatibilidad estricta con Mermaid 11 sin alterar
 * los documentos fuente en `documentación final/`.
 * En `sequenceDiagram`, Mermaid interpreta `;` literal como fin de sentencia; se reemplaza
 * por ` · ` únicamente en el texto descriptivo posterior a `:` en mensajes/notas,
 * preservando directivas `%%` y entidades HTML/Mermaid (`&#59;`, `#59;`, `&quot;`, etc.).
 */
function sanitizeMermaidCode(rawCode, diagramType) {
  const isSequence =
    diagramType === 'sequenceDiagram' || /^\s*sequenceDiagram\b/m.test(rawCode);
  if (!isSequence) {
    return rawCode;
  }

  return rawCode
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (
        !trimmed ||
        trimmed.startsWith('%%') ||
        /^(?:participant|actor)\b/i.test(trimmed)
      ) {
        return line;
      }

      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) {
        return line;
      }

      const head = line.slice(0, colonIdx + 1);
      const tail = line
        .slice(colonIdx + 1)
        .replace(
          /(&(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);|#\d+;)|;\s*/g,
          (_match, entity) => (entity ? entity : ' · ')
        )
        .replace(/\s+·\s*$/, '');

      return `${head}${tail}`;
    })
    .join('\n');
}

/**
 * Extrae en orden canónico todos los bloques ```mermaid de los 8 volúmenes documentales.
 */
function extractMermaidDiagrams(docsDir) {
  const extracted = [];

  for (const docFile of CANONICAL_DOCS_ORDER) {
    const fullPath = path.join(docsDir, docFile);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`[export-diagrams] Falta el documento requerido: ${fullPath}`);
    }

    const rawMarkdown = fs.readFileSync(fullPath, 'utf8');
    const lines = rawMarkdown.split(/\r?\n/);
    const docSlug = docFile.replace(/\.md$/i, '');

    let currentHeading = docSlug;
    let inFence = false;
    let fenceChar = '';
    let fenceLength = 0;
    let isMermaidFence = false;
    let buffer = [];

    for (const line of lines) {
      const trimmed = line.trimStart();

      if (!inFence) {
        const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
        if (headingMatch) {
          currentHeading = headingMatch[2].trim();
        }

        const fenceMatch = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
        if (fenceMatch) {
          inFence = true;
          fenceChar = fenceMatch[1][0];
          fenceLength = fenceMatch[1].length;
          const infoString = fenceMatch[2].trim().toLowerCase();
          isMermaidFence =
            infoString === 'mermaid' || infoString.startsWith('mermaid ');
          buffer = [];
        }
      } else {
        const isClosingFence =
          trimmed.startsWith(fenceChar.repeat(fenceLength)) &&
          trimmed.slice(fenceLength).replace(new RegExp(`^${fenceChar}+`), '').trim() ===
            '';

        if (isClosingFence) {
          if (isMermaidFence) {
            const index = extracted.length + 1;
            const nn = String(index).padStart(2, '0');
            const rawMermaidCode = buffer.join('\n').trim();
            const diagramType = detectDiagramType(rawMermaidCode);
            const mermaidCode = sanitizeMermaidCode(rawMermaidCode, diagramType);
            const title = cleanHeadingTitle(
              currentHeading,
              `Diagrama ${nn} (${docSlug})`
            );
            const slug = slugifyAscii(title);
            const id = `${nn}_${slug}`;

            extracted.push({
              index,
              nn,
              id,
              slug,
              title,
              category: resolveCategory(docFile),
              diagramType,
              docFile,
              docSlug,
              mermaidCode,
              svgFile: `${id}.svg`,
              pngDarkFile: `${id}.png`,
              pngLightFile: `${id}.png`,
            });
          }

          inFence = false;
          fenceChar = '';
          fenceLength = 0;
          isMermaidFence = false;
          buffer = [];
        } else if (isMermaidFence) {
          buffer.push(line);
        }
      }
    }
  }

  return extracted;
}

/**
 * Lee las dimensiones reales en píxeles (IHDR) de un archivo PNG generado.
 */
function readPngDimensions(pngPath) {
  const header = Buffer.alloc(24);
  const fd = fs.openSync(pngPath, 'r');
  try {
    fs.readSync(fd, header, 0, 24, 0);
  } finally {
    fs.closeSync(fd);
  }

  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!header.subarray(0, 8).equals(pngSignature)) {
    throw new Error(`[export-diagrams] Archivo PNG inválido: ${pngPath}`);
  }

  return {
    width: header.readUInt32BE(16),
    height: header.readUInt32BE(20),
  };
}

/**
 * Renderiza un diagrama en la página de Puppeteer bajo el modo indicado ('dark' | 'light'),
 * normalizando viewBox/dimensiones sin recortes ni scrollbars.
 */
async function renderDiagramInPage(page, renderId, mermaidCode, mode) {
  const isDark = mode === 'dark';
  const background = isDark ? DARK_BG : LIGHT_BG;

  await page.setViewport({
    width: 1920,
    height: 1200,
    deviceScaleFactor: 3,
  });

  const layoutResult = await page.evaluate(
    async ({ id, code, darkMode, bgColor, pad }) => {
      const wrapper = document.getElementById('capture-wrapper');
      const root = document.getElementById('diagram-root');

      document.documentElement.style.background = bgColor;
      document.body.style.background = bgColor;
      wrapper.style.background = bgColor;
      wrapper.style.padding = `${pad}px`;
      root.innerHTML = '';

      const darkThemeVars = {
        darkMode: true,
        background: '#0b1120',
        fontFamily: 'Inter, "Segoe UI", system-ui, -apple-system, sans-serif',
        fontSize: '15px',
        primaryColor: '#0f172a',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#10b981',
        secondaryColor: '#1e293b',
        secondaryTextColor: '#f1f5f9',
        secondaryBorderColor: '#06b6d4',
        tertiaryColor: '#111827',
        tertiaryTextColor: '#e2e8f0',
        tertiaryBorderColor: '#38bdf8',
        lineColor: '#22d3ee',
        textColor: '#f8fafc',
        mainBkg: '#0f172a',
        secondBkg: '#1e293b',
        nodeBorder: '#10b981',
        clusterBkg: '#0d1829',
        clusterBorder: '#06b6d4',
        defaultLinkColor: '#22d3ee',
        titleColor: '#f8fafc',
        edgeLabelBackground: '#0f172a',
        actorBkg: '#0f172a',
        actorBorder: '#10b981',
        actorTextColor: '#f8fafc',
        actorLineColor: '#06b6d4',
        signalColor: '#22d3ee',
        signalTextColor: '#f8fafc',
        labelBoxBkgColor: '#0f172a',
        labelBoxBorderColor: '#06b6d4',
        labelTextColor: '#f8fafc',
        loopTextColor: '#e2e8f0',
        noteBkgColor: '#1e293b',
        noteTextColor: '#f8fafc',
        noteBorderColor: '#10b981',
        activationBkgColor: '#134e4a',
        activationBorderColor: '#10b981',
        sequenceNumberColor: '#0b1120',
        attributeBackgroundColorOdd: '#0f172a',
        attributeBackgroundColorEven: '#1e293b',
      };

      const lightThemeVars = {
        darkMode: false,
        background: '#ffffff',
        fontFamily: 'Inter, "Segoe UI", system-ui, -apple-system, sans-serif',
        fontSize: '15px',
      };

      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        maxTextSize: 500000,
        maxEdges: 2000,
        theme: darkMode ? 'dark' : 'default',
        themeVariables: darkMode ? darkThemeVars : lightThemeVars,
        flowchart: {
          useMaxWidth: false,
          htmlLabels: true,
          curve: 'basis',
          padding: 14,
        },
        sequence: {
          useMaxWidth: false,
          diagramMarginX: 24,
          diagramMarginY: 24,
          actorMargin: 50,
          boxMargin: 10,
          boxTextMargin: 8,
          noteMargin: 12,
          messageMargin: 38,
        },
        er: {
          useMaxWidth: false,
          minEntityWidth: 110,
          minEntityHeight: 75,
          entityPadding: 15,
        },
        state: {
          useMaxWidth: false,
        },
        class: {
          useMaxWidth: false,
        },
      });

      const { svg } = await window.mermaid.render(id, code);
      root.innerHTML = svg;

      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const svgEl = root.querySelector('svg');
      if (!svgEl) {
        throw new Error(`Mermaid no generó un nodo <svg> para ${id}`);
      }

      svgEl.style.maxWidth = 'none';
      svgEl.style.display = 'block';
      svgEl.style.overflow = 'visible';

      let vx = 0;
      let vy = 0;
      let vw = 0;
      let vh = 0;
      let hasViewBox = false;

      const rawVb = svgEl.getAttribute('viewBox');
      if (rawVb) {
        const parts = rawVb
          .trim()
          .split(/[\s,]+/)
          .map(Number);
        if (
          parts.length === 4 &&
          parts.every((n) => Number.isFinite(n)) &&
          parts[2] > 0 &&
          parts[3] > 0
        ) {
          [vx, vy, vw, vh] = parts;
          hasViewBox = true;
        }
      }

      try {
        const bbox = svgEl.getBBox();
        if (
          bbox &&
          Number.isFinite(bbox.width) &&
          Number.isFinite(bbox.height) &&
          bbox.width > 0 &&
          bbox.height > 0
        ) {
          if (!hasViewBox) {
            vx = bbox.x;
            vy = bbox.y;
            vw = bbox.width;
            vh = bbox.height;
            hasViewBox = true;
          } else {
            const minX = Math.min(vx, bbox.x);
            const minY = Math.min(vy, bbox.y);
            const maxX = Math.max(vx + vw, bbox.x + bbox.width);
            const maxY = Math.max(vy + vh, bbox.y + bbox.height);
            vx = minX;
            vy = minY;
            vw = maxX - minX;
            vh = maxY - minY;
          }
        }
      } catch {
        // Fallback a getBoundingClientRect si getBBox falla
      }

      if (!hasViewBox || vw <= 0 || vh <= 0) {
        const rect = svgEl.getBoundingClientRect();
        vx = 0;
        vy = 0;
        vw = Math.max(100, rect.width);
        vh = Math.max(100, rect.height);
      }

      const cleanW = Math.ceil(vw);
      const cleanH = Math.ceil(vh);

      svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgEl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      svgEl.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`);
      svgEl.setAttribute('width', String(cleanW));
      svgEl.setAttribute('height', String(cleanH));
      svgEl.style.width = `${cleanW}px`;
      svgEl.style.height = `${cleanH}px`;

      await new Promise((r) => requestAnimationFrame(r));

      const wrapperRect = wrapper.getBoundingClientRect();
      const boxWidth = Math.ceil(wrapperRect.width);
      const boxHeight = Math.ceil(wrapperRect.height);

      let standaloneSvg = '';
      if (darkMode) {
        const svgClone = svgEl.cloneNode(true);
        const padVx = Math.floor((vx - pad) * 100) / 100;
        const padVy = Math.floor((vy - pad) * 100) / 100;
        const padVw = Math.ceil(vw + pad * 2);
        const padVh = Math.ceil(vh + pad * 2);

        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        svgClone.setAttribute('viewBox', `${padVx} ${padVy} ${padVw} ${padVh}`);
        svgClone.setAttribute('width', String(padVw));
        svgClone.setAttribute('height', String(padVh));
        svgClone.setAttribute(
          'style',
          `background-color: ${bgColor}; max-width: none; font-family: Inter, 'Segoe UI', system-ui, -apple-system, sans-serif;`
        );

        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('x', String(padVx));
        bgRect.setAttribute('y', String(padVy));
        bgRect.setAttribute('width', String(padVw));
        bgRect.setAttribute('height', String(padVh));
        bgRect.setAttribute('fill', bgColor);
        svgClone.insertBefore(bgRect, svgClone.firstChild);

        const serializedSvg = new XMLSerializer().serializeToString(svgClone);
        standaloneSvg = `<?xml version="1.0" encoding="UTF-8"?>\n${serializedSvg}\n`;
      }

      return {
        boxWidth,
        boxHeight,
        standaloneSvg,
      };
    },
    {
      id: renderId,
      code: mermaidCode,
      darkMode: isDark,
      bgColor: background,
      pad: PADDING_PX,
    }
  );

  // Ajustar viewport exactamente al tamaño real del contenedor + margen para evitar recortes,
  // scrollbars o costuras de tiles, respetando el límite de textura de Chromium/Skia.
  const maxCssDim = Math.max(layoutResult.boxWidth, layoutResult.boxHeight);
  const scaleFactor =
    maxCssDim * 3 <= MAX_SKIA_DIMENSION
      ? 3
      : Math.max(1.5, Math.floor((MAX_SKIA_DIMENSION / maxCssDim) * 100) / 100);

  await page.setViewport({
    width: Math.max(1920, layoutResult.boxWidth + 64),
    height: Math.max(1200, layoutResult.boxHeight + 64),
    deviceScaleFactor: scaleFactor,
  });

  const wrapperHandle = await page.$('#capture-wrapper');
  if (!wrapperHandle) {
    throw new Error('[export-diagrams] No se encontró #capture-wrapper en el DOM.');
  }

  return {
    wrapperHandle,
    standaloneSvg: layoutResult.standaloneSvg,
    scaleFactor,
  };
}

/**
 * Construye el catálogo visual en español (`assets-presentacion/CATALOGO_DIAGRAMAS.md`).
 */
function buildCatalogMarkdown(manifestItems, generatedAt) {
  const byCategory = new Map();
  for (const item of manifestItems) {
    byCategory.set(item.category, (byCategory.get(item.category) || 0) + 1);
  }

  const lines = [
    '# 🎨 Catálogo Oficial de Diagramas HD (4K & SVG) — AgentGuard',
    '',
    '> **Proyecto:** `AgentGuard` — Gobernanza, Autorización Contextual (PEP/PDP) y Observabilidad en Runtime para Agentes de IA  ',
    '> **Cátedra:** Desarrollo Web (ITU — UNCuyo, 2026)  ',
    `> **Total de diagramas exportados:** **${manifestItems.length}** diagramas oficiales (**${manifestItems.length * 3}** archivos gráficos: ${manifestItems.length} SVG vectoriales + ${manifestItems.length} PNG 4K Oscuro + ${manifestItems.length} PNG 4K Claro)  `,
    `> **Última generación:** \`${generatedAt}\`  `,
    '> **Video Demo Oficial (68s):** [Ver AgentGuard Reel Oficial](https://drive.google.com/file/d/1MGKSaJY939cJWj5cr5Wl7op8VL1b91c5/view?usp=drivesdk)',
    '',
    '---',
    '',
    '## 💡 Tips Rápidos para Importar en Canva y Proyectar sin Pérdida de Nitidez',
    '',
    '1. **Para diapositivas oscuras en Canva (Recomendado — Fondo Navy `#0b1120`):**',
    '   - Arrastrá directamente los archivos de [`./png-4k-dark/`](./png-4k-dark/) al panel **Subidos** de Canva.',
    '   - Están rasterizados con `deviceScaleFactor: 3` (calidad **4K Ultra-HD**) sobre el mismo fondo `#0b1120` de la identidad visual de AgentGuard y preservan intactos emojis, etiquetas multilínea y contrastes Emerald (`#10b981`) / Cyan (`#06b6d4`).',
    '2. **Para zoom infinito en el navegador o proyectores de auditorio:**',
    '   - Usá los archivos de [`./svg/`](./svg/) o abrí la vista **Galería 4K (`/galeria-diagramas`)** en el Portal VitePress (`start_docs.bat`) y activá **⛶ Modo Proyector** para hacer pan/zoom vectorial de hasta `8x` con la rueda del mouse.',
    '3. **Para informes impresos, anexos académicos o diapositivas claras:**',
    '   - Usá los archivos de [`./png-4k-light/`](./png-4k-light/), generados sobre fondo blanco puro (`#ffffff`) con tema claro de alto contraste.',
    '4. **Truco para diagramas extensos (MER de 13 tablas o Secuencias completas):**',
    '   - En Canva, no comprimas todo el diagrama en un recuadro diminuto: insertá la imagen 4K a ancho completo (`1920×1080`) o duplicá la diapositiva aplicando recorte (*Crop*) a la mitad superior/inferior para que el tribunal lea cada atributo con claridad total.',
    '',
    '---',
    '',
    '## 📊 Resumen por Categoría Temática',
    '',
    '| Categoría Oficial | Cantidad de Diagramas | Uso Recomendado en Defensa |',
    '| :--- | :---: | :--- |',
    `| **Base de Datos y Chen** | **${byCategory.get('Base de Datos y Chen') || 0}** | Modelo relacional PostgreSQL 16 (13 tablas), SQLite ACME (7 tablas), Alembic y notación Chen. |`,
    `| **Runtime PEP/PDP y Secuencias** | **${byCategory.get('Runtime PEP/PDP y Secuencias') || 0}** | Interceptor PEP, motor PDP 5D fail-closed, secuencias demo, máquinas de estado HITL y casos de uso. |`,
    `| **Frontend y RBAC** | **${byCategory.get('Frontend y RBAC') || 0}** | Arquitectura React 19 + Tailwind v4, hidratación \`SERVER_BOOT_ID\`, las 9 vistas SPA y Playground PDP. |`,
    `| **ACME Corp y Gemini** | **${byCategory.get('ACME Corp y Gemini') || 0}** | Portal satélite \`:9000\`, auto-onboarding CEO, Gemini 3.8 Flash (\`thoughtSignature\`) y Modo Protegido vs Directo. |`,
    `| **Navegación** | **${byCategory.get('Navegación') || 0}** | Mapa de itinerarios de lectura según el perfil del jurado evaluador. |`,
    `| **TOTAL** | **${manifestItems.length}** | **Cobertura 100% sincronizada con \`documentación final/\`** |`,
    '',
    '---',
    '',
    '## 📚 Índice Visual Ordenado por Volumen Documental',
    '',
  ];

  for (const docFile of CANONICAL_DOCS_ORDER) {
    const groupItems = manifestItems.filter((item) => item.docFile === docFile);
    if (groupItems.length === 0) continue;

    const volumenHeading = VOLUMEN_TITLES[docFile] || docFile;
    lines.push(`### 📄 ${volumenHeading}`);
    lines.push(`*Archivo fuente:* [\`../documentación final/${docFile}\`](../documentación%20final/${encodeURIComponent(docFile)}) · *Diagramas en este volumen:* **${groupItems.length}**`);
    lines.push('');
    lines.push(
      '| # | Título del Diagrama | Tipo | Categoría | Resolución 4K | Descargas Directas |'
    );
    lines.push('| :---: | :--- | :---: | :--- | :---: | :--- |');

    for (const item of groupItems) {
      const nn = String(item.index).padStart(2, '0');
      const svgLink = `[SVG](./svg/${item.svgFile})`;
      const darkLink = `[PNG 4K Oscuro](./png-4k-dark/${item.pngDarkFile})`;
      const lightLink = `[PNG 4K Claro](./png-4k-light/${item.pngLightFile})`;
      lines.push(
        `| **${nn}** | **${item.title}** | \`${item.diagramType}\` | ${item.category} | \`${item.width}×${item.height} px\` | ${svgLink} · ${darkLink} · ${lightLink} |`
      );
    }

    lines.push('');
    lines.push('<details>');
    lines.push(
      `<summary>🔎 Ver vistas previas embebidas de <code>${docFile}</code> (${groupItems.length})</summary>`
    );
    lines.push('');

    for (const item of groupItems) {
      const nn = String(item.index).padStart(2, '0');
      lines.push(`#### ${nn}. ${item.title}`);
      lines.push(
        `- **ID:** \`${item.id}\` · **Tipo:** \`${item.diagramType}\` · **Dimensiones 4K:** \`${item.width}×${item.height} px\``
      );
      lines.push(
        `- **Archivos:** [Vectorial SVG](./svg/${item.svgFile}) | [PNG 4K Oscuro (Canva)](./png-4k-dark/${item.pngDarkFile}) | [PNG 4K Claro](./png-4k-light/${item.pngLightFile})`
      );
      lines.push('');
      lines.push(`![${nn} - ${item.title}](./png-4k-dark/${item.pngDarkFile})`);
      lines.push('');
    }

    lines.push('</details>');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push(
    '*Generado automáticamente por `docs-portal/scripts/export-diagrams.mjs` (100% offline con Mermaid local + Puppeteer Core).*'
  );
  lines.push('');

  return lines.join('\n');
}

async function main() {
  if (!fs.existsSync(MERMAID_SCRIPT_PATH)) {
    throw new Error(
      `[export-diagrams] No se encontró Mermaid local en ${MERMAID_SCRIPT_PATH}. Ejecutá "pnpm install" primero.`
    );
  }

  const docsDir = resolveDocsSourceDir();
  const browserExecutable = resolveBrowserExecutable();
  const diagrams = extractMermaidDiagrams(docsDir);

  if (diagrams.length === 0) {
    throw new Error(
      `[export-diagrams] No se encontraron bloques Mermaid en ${docsDir}.`
    );
  }

  console.log('==================================================================');
  console.log(' [AgentGuard HD Exporter] Iniciando exportación de diagramas 4K/SVG');
  console.log('------------------------------------------------------------------');
  console.log(` • Carpeta fuente     : ${docsDir}`);
  console.log(` • Navegador headless : ${browserExecutable}`);
  console.log(` • Mermaid bundle     : ${MERMAID_SCRIPT_PATH}`);
  console.log(` • Diagramas hallados : ${diagrams.length}`);
  console.log('==================================================================');

  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  resetDir(SVG_DIR);
  resetDir(PNG_DARK_DIR);
  resetDir(PNG_LIGHT_DIR);

  const browser = await puppeteer.launch({
    executablePath: browserExecutable,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--hide-scrollbars',
      '--font-render-hinting=none',
    ],
  });

  const browserProcess = browser.process();
  const manifestItems = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1200, deviceScaleFactor: 3 });

    const htmlShell = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      overflow: visible;
      font-family: Inter, "Segoe UI", system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
      text-rendering: geometricPrecision;
    }
    #capture-wrapper {
      display: inline-block;
      padding: ${PADDING_PX}px;
      margin: 0;
    }
    #diagram-root {
      display: inline-block;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="capture-wrapper">
    <div id="diagram-root"></div>
  </div>
</body>
</html>`;

    await page.setContent(htmlShell, { waitUntil: 'domcontentloaded' });
    await page.addScriptTag({ path: MERMAID_SCRIPT_PATH });

    for (const item of diagrams) {
      const svgOutPath = path.join(SVG_DIR, item.svgFile);
      const pngDarkOutPath = path.join(PNG_DARK_DIR, item.pngDarkFile);
      const pngLightOutPath = path.join(PNG_LIGHT_DIR, item.pngLightFile);

      // 1. Renderizar tema oscuro (#0b1120) -> SVG limpio + PNG 4K Dark
      const darkRender = await renderDiagramInPage(
        page,
        `ag_dark_${item.nn}`,
        item.mermaidCode,
        'dark'
      );
      fs.writeFileSync(svgOutPath, darkRender.standaloneSvg, 'utf8');
      await darkRender.wrapperHandle.screenshot({
        path: pngDarkOutPath,
        type: 'png',
        omitBackground: false,
      });
      await darkRender.wrapperHandle.dispose();

      // 2. Renderizar tema claro (#ffffff) -> PNG 4K Light
      const lightRender = await renderDiagramInPage(
        page,
        `ag_light_${item.nn}`,
        item.mermaidCode,
        'light'
      );
      await lightRender.wrapperHandle.screenshot({
        path: pngLightOutPath,
        type: 'png',
        omitBackground: false,
      });
      await lightRender.wrapperHandle.dispose();

      const { width, height } = readPngDimensions(pngDarkOutPath);

      manifestItems.push({
        index: item.index,
        id: item.id,
        title: item.title,
        category: item.category,
        diagramType: item.diagramType,
        docFile: item.docFile,
        docSlug: item.docSlug,
        mermaidCode: item.mermaidCode,
        svgFile: item.svgFile,
        pngDarkFile: item.pngDarkFile,
        pngLightFile: item.pngLightFile,
        width,
        height,
      });

      console.log(
        ` [${item.nn}/${String(diagrams.length).padStart(2, '0')}] ✓ ${item.id} (${item.diagramType} · ${width}x${height}px)`
      );
    }
  } finally {
    await Promise.race([
      browser.close().catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
    if (browserProcess && !browserProcess.killed) {
      try {
        browserProcess.kill();
      } catch {
        // Ignorar si el proceso ya terminó
      }
    }
  }

  const generatedAt = new Date().toISOString();
  const manifestPayload = {
    generatedAt,
    total: manifestItems.length,
    diagrams: manifestItems,
    items: manifestItems,
  };

  const manifestPath = path.join(ASSETS_DIR, 'manifest.json');
  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify(manifestPayload, null, 2)}\n`,
    'utf8'
  );

  const catalogPath = path.join(ASSETS_DIR, 'CATALOGO_DIAGRAMAS.md');
  fs.writeFileSync(
    catalogPath,
    buildCatalogMarkdown(manifestItems, generatedAt),
    'utf8'
  );

  console.log('==================================================================');
  console.log(' [AgentGuard HD Exporter] Exportación completada exitosamente');
  console.log('------------------------------------------------------------------');
  console.log(` • SVG Vectoriales   : ${manifestItems.length} -> assets-presentacion/svg/`);
  console.log(
    ` • PNG 4K Oscuros    : ${manifestItems.length} -> assets-presentacion/png-4k-dark/`
  );
  console.log(
    ` • PNG 4K Claros     : ${manifestItems.length} -> assets-presentacion/png-4k-light/`
  );
  console.log(` • Manifiesto JSON   : assets-presentacion/manifest.json`);
  console.log(` • Catálogo Markdown : assets-presentacion/CATALOGO_DIAGRAMAS.md`);
  console.log('==================================================================');
}

main().catch((err) => {
  console.error('[export-diagrams] Error fatal:', err);
  process.exit(1);
});
