import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORTAL_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PORTAL_ROOT, '..');
const GITHUB_BLOB_BASE = 'https://github.com/jmbatiatto/AgentGuard/blob/main';

/**
 * Resuelve `../documentación final` tolerando diferencias de normalización Unicode (NFC/NFD)
 * entre entornos Windows, macOS y runners Linux de GitHub Actions.
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
    `[prepare-content] No se encontró la carpeta fuente "../documentación final/" en ${REPO_ROOT}`
  );
}

/**
 * Reescribe enlaces relativos `](../diagramas/<archivo>)` y `](../<ruta>)` hacia GitHub (`main`)
 * únicamente fuera de bloques de código fenced (``` o ~~~) para cumplir `ignoreDeadLinks: false`.
 */
function rewriteRelativeLinksOutsideFences(markdown) {
  const lineEnding = markdown.includes('\r\n') ? '\r\n' : '\n';
  const lines = markdown.split(/\r?\n/);

  let inFence = false;
  let fenceChar = '';
  let fenceLength = 0;
  let rewrittenLinks = 0;

  const transformedLines = lines.map((line) => {
    const trimmed = line.trimStart();
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);

    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!inFence) {
        inFence = true;
        fenceChar = marker[0];
        fenceLength = marker.length;
      } else if (
        marker[0] === fenceChar &&
        marker.length >= fenceLength &&
        trimmed.slice(marker.length).trim() === ''
      ) {
        inFence = false;
        fenceChar = '';
        fenceLength = 0;
      }
      return line;
    }

    if (inFence) {
      return line;
    }

    let updated = line.replace(
      /\]\(\.\.\/diagramas\/([^)\s]+)\)/g,
      (_match, diagramFile) => {
        rewrittenLinks += 1;
        return `](${GITHUB_BLOB_BASE}/diagramas/${diagramFile})`;
      }
    );

    updated = updated.replace(
      /\]\(\.\.\/([^)\s]+)\)/g,
      (_match, repoRelativePath) => {
        rewrittenLinks += 1;
        return `](${GITHUB_BLOB_BASE}/${repoRelativePath})`;
      }
    );

    return updated;
  });

  return {
    content: transformedLines.join(lineEnding),
    rewrittenLinks,
  };
}

function resetDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function countFilesRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += countFilesRecursive(fullPath);
    } else if (entry.isFile()) {
      total += 1;
    }
  }
  return total;
}

function main() {
  const docsSrcDir = resolveDocsSourceDir();
  const diagramasSrcDir = path.join(REPO_ROOT, 'diagramas');
  const assetsSrcDir = path.join(REPO_ROOT, 'assets-presentacion');

  const volumenesDestDir = path.join(PORTAL_ROOT, 'src', 'volumenes');
  const diagramasDestDir = path.join(PORTAL_ROOT, 'src', 'public', 'diagramas');
  const diagramasHdDestDir = path.join(PORTAL_ROOT, 'src', 'public', 'diagramas-hd');

  // 1. Limpiar y sincronizar los 11 volúmenes oficiales (.md)
  resetDir(volumenesDestDir);
  const mdFiles = fs
    .readdirSync(docsSrcDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'es'));

  let totalRewrittenLinks = 0;
  for (const fileName of mdFiles) {
    const srcFile = path.join(docsSrcDir, fileName);
    const destFile = path.join(volumenesDestDir, fileName);
    const rawMarkdown = fs.readFileSync(srcFile, 'utf8');
    const { content, rewrittenLinks } = rewriteRelativeLinksOutsideFences(rawMarkdown);
    fs.writeFileSync(destFile, content, 'utf8');
    totalRewrittenLinks += rewrittenLinks;
  }

  // 2. Copiar fuentes vectoriales Draw.io (*.drawio)
  resetDir(diagramasDestDir);
  let drawioCount = 0;
  if (fs.existsSync(diagramasSrcDir)) {
    const drawioFiles = fs
      .readdirSync(diagramasSrcDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.drawio'))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, 'es'));

    for (const fileName of drawioFiles) {
      fs.copyFileSync(
        path.join(diagramasSrcDir, fileName),
        path.join(diagramasDestDir, fileName)
      );
      drawioCount += 1;
    }
  }

  // 3. Sincronizar assets de presentación HD (SVG + PNG 4K + manifest.json) si existen
  resetDir(diagramasHdDestDir);
  const hdSummary = {
    svg: 0,
    'png-4k-dark': 0,
    'png-4k-light': 0,
    manifest: false,
  };

  if (fs.existsSync(assetsSrcDir)) {
    for (const subDir of ['svg', 'png-4k-dark', 'png-4k-light']) {
      const srcSubDir = path.join(assetsSrcDir, subDir);
      const destSubDir = path.join(diagramasHdDestDir, subDir);
      if (fs.existsSync(srcSubDir)) {
        fs.cpSync(srcSubDir, destSubDir, { recursive: true });
        if (subDir === 'svg') {
          for (const entry of fs.readdirSync(destSubDir, { withFileTypes: true })) {
            if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.svg')) continue;
            const svgPath = path.join(destSubDir, entry.name);
            const rawSvg = fs.readFileSync(svgPath, 'utf8');
            const fixedSvg = rawSvg.replace(/<(br|hr)(\s[^<>]*?)?(?<!\/)>/gi, '<$1$2/>');
            if (fixedSvg !== rawSvg) {
              fs.writeFileSync(svgPath, fixedSvg, 'utf8');
            }
          }
        }
        hdSummary[subDir] = countFilesRecursive(destSubDir);
      }
    }

    const manifestSrc = path.join(assetsSrcDir, 'manifest.json');
    if (fs.existsSync(manifestSrc)) {
      fs.copyFileSync(manifestSrc, path.join(diagramasHdDestDir, 'manifest.json'));
      hdSummary.manifest = true;
    }
  }

  console.log('==================================================================');
  console.log(' [AgentGuard Docs Portal] Sincronización de contenido completada');
  console.log('------------------------------------------------------------------');
  console.log(` • Volúmenes Markdown copiados : ${mdFiles.length} -> src/volumenes/`);
  console.log(` • Enlaces relativos reescritos: ${totalRewrittenLinks} -> ${GITHUB_BLOB_BASE}/*`);
  console.log(` • Diagramas Draw.io copiados  : ${drawioCount} -> src/public/diagramas/`);
  if (fs.existsSync(assetsSrcDir)) {
    console.log(
      ` • Diagramas HD sincronizados  : SVG=${hdSummary.svg}, 4K-Dark=${hdSummary['png-4k-dark']}, 4K-Light=${hdSummary['png-4k-light']}, manifest=${hdSummary.manifest ? 'sí' : 'no'}`
    );
  } else {
    console.log(
      ' • Diagramas HD (4K/SVG)       : carpeta ../assets-presentacion/ aún no generada (omitida sin error)'
    );
  }
  console.log('==================================================================');
}

main();
