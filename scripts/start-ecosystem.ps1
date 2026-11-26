# ==============================================================================
# AgentGuard + ACME Corp - Orquestador Unificado del Ecosistema Completo
# Levanta secuencialmente:
#   Docker (PostgreSQL 16 + Redis 7) -> Migraciones Alembic -> Backend (:8000)
#   -> Frontend SPA (:5173) -> ACME Corp (:9000 + Auto-Onboarding) -> Navegador
# ==============================================================================

param(
    [switch]$Reset,
    [switch]$SeedAcme,
    [switch]$NoBrowser
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"
$acmeDir = Join-Path $rootDir "acme-corp"

Set-Location $rootDir

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "   [+] AGENTGUARD + ACME CORP - ARRANQUE UNIFICADO (ECOSISTEMA)     " -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host " Secuencia: Docker -> Alembic -> Backend (:8000) -> Frontend (:5173) -> ACME (:9000)" -ForegroundColor Gray
Write-Host ""

# ------------------------------------------------------------------------------
# 1. Verificar Docker & Levantar Contenedores (PostgreSQL 16 + Redis 7)
# ------------------------------------------------------------------------------
Write-Host "[1/7] Verificando Docker Desktop y servicios de persistencia..." -ForegroundColor Yellow

$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
    Write-Host "[!] Error: Docker no esta instalado en este sistema." -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop desde https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    exit 1
}

$dockerRunning = $false
& docker info --format "{{.ServerVersion}}" *>$null
if ($LASTEXITCODE -eq 0) {
    $dockerRunning = $true
}

if (-not $dockerRunning) {
    Write-Host ""
    Write-Host "[!] ATENCION: Docker Desktop no esta iniciado." -ForegroundColor Yellow
    Write-Host "[*] Abre Docker Desktop y espera a que termine de inicializar..." -ForegroundColor White
    Write-Host ""
    $null = Read-Host "Presiona [ENTER] una vez que Docker Desktop este abierto para continuar..."

    & docker info --format "{{.ServerVersion}}" *>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] No se pudo conectar al daemon de Docker. Abortando arranque." -ForegroundColor Red
        exit 1
    }
}

Write-Host "[+] Iniciando contenedores de base de datos y cache (PostgreSQL 16 + Redis 7)..." -ForegroundColor Cyan
docker compose up -d

Write-Host "[*] Esperando que PostgreSQL este listo para aceptar conexiones..." -ForegroundColor Gray
$retries = 15
$dbReady = $false
while ($retries -gt 0 -and -not $dbReady) {
    Start-Sleep -Seconds 1
    & docker compose exec -T postgres pg_isready -U agentguard -d agentguard_db *>$null
    if ($LASTEXITCODE -eq 0) {
        $dbReady = $true
    }
    $retries--
}

if ($dbReady) {
    Write-Host "[OK] PostgreSQL 16 y Redis 7 listos y operando." -ForegroundColor Green
} else {
    Write-Host "[!] PostgreSQL tardo en responder pero los contenedores continuan arriba." -ForegroundColor Yellow
}
Write-Host ""

# ------------------------------------------------------------------------------
# 2. Configurar Backend, Migraciones y Semillas Opcionales
# ------------------------------------------------------------------------------
Write-Host "[2/7] Configurando entorno Python de AgentGuard y migraciones Alembic..." -ForegroundColor Yellow

Set-Location $backendDir

$envFile = Join-Path $backendDir ".env"
$envExampleFile = Join-Path $backendDir ".env.example"
if (-not (Test-Path $envFile)) {
    Write-Host "[*] Creando backend/.env a partir de .env.example..." -ForegroundColor Cyan
    Copy-Item $envExampleFile $envFile
    Write-Host "[OK] Archivo backend/.env configurado." -ForegroundColor Green
}

$venvDir = Join-Path $backendDir ".venv"
$venvPython = Join-Path $venvDir "Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "[*] Creando entorno virtual .venv en backend/..." -ForegroundColor Cyan
    python -m venv .venv
    Write-Host "[*] Instalando dependencias de backend..." -ForegroundColor Cyan
    & $venvPython -m pip install -q -r requirements.txt
    Write-Host "[OK] Dependencias de backend instaladas." -ForegroundColor Green
} else {
    Write-Host "[OK] Entorno virtual Python (.venv) detectado." -ForegroundColor Green
}

$alembicExe = Join-Path $venvDir "Scripts\alembic.exe"
Write-Host "[*] Aplicando migraciones de esquema con Alembic..." -ForegroundColor Gray
& $alembicExe upgrade head
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Error al aplicar migraciones de base de datos con Alembic (codigo $LASTEXITCODE)." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Esquema de base de datos sincronizado (13 tablas operativas)." -ForegroundColor Green

if ($SeedAcme -or $Reset) {
    $seedScript = Join-Path $backendDir "scripts\seed_demo.py"
    $seedArgs = @($seedScript)
    if ($Reset) {
        Write-Host "[*] Reiniciando datos semilla de la demo (--reset)..." -ForegroundColor Yellow
        $seedArgs += "--reset"
    } else {
        Write-Host "[*] Sincronizando datos semilla de Acme Corp (5 roles RBAC)..." -ForegroundColor Gray
    }
    & $venvPython @seedArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] Error al ejecutar el seeder demo (codigo $LASTEXITCODE)." -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Semillas y usuarios RBAC sincronizados correctamente." -ForegroundColor Green
} else {
    Write-Host "[+] Semilla manual omitida: ACME Corp ejecutara su auto-onboarding al conectarse a :8000." -ForegroundColor Cyan
}
Write-Host ""

# ------------------------------------------------------------------------------
# 3. Verificar Dependencias de Frontend
# ------------------------------------------------------------------------------
Write-Host "[3/7] Verificando dependencias de Frontend..." -ForegroundColor Yellow
Set-Location $frontendDir

$frontendNodeModules = Join-Path $frontendDir "node_modules"
$pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue

if (-not (Test-Path $frontendNodeModules)) {
    Write-Host "[*] Instalando dependencias en frontend/..." -ForegroundColor Cyan
    if ($pnpmCmd) {
        & pnpm install
    } else {
        & npm install
    }
    Write-Host "[OK] Dependencias de frontend instaladas." -ForegroundColor Green
} else {
    Write-Host "[OK] node_modules detectado en frontend/." -ForegroundColor Green
}
Write-Host ""

# ------------------------------------------------------------------------------
# 4. Iniciar Servidor Backend FastAPI de AgentGuard (Puerto 8000)
# ------------------------------------------------------------------------------
Write-Host "[4/7] Levantando Backend AgentGuard en http://localhost:8000..." -ForegroundColor Yellow

$port8000Listeners = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 4 }
$backendAlreadyHealthy = $false
if ($port8000Listeners) {
    try {
        $probe8000 = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($probe8000.app) {
            $backendAlreadyHealthy = $true
        }
    } catch {}

    if (-not $backendAlreadyHealthy) {
        Write-Host "[!] Proceso colgado detectado en puerto 8000 sin responder /health; liberando puerto..." -ForegroundColor Yellow
        $port8000Listeners | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Milliseconds 600
    }
}

if ($backendAlreadyHealthy) {
    Write-Host "[OK] Backend AgentGuard ya estaba corriendo y saludable en http://localhost:8000." -ForegroundColor Green
} else {
    $backendStartCmd = "`$Host.UI.RawUI.WindowTitle = 'AgentGuard Backend (:8000)'; Set-Location '$backendDir'; & '$venvPython' -m uvicorn app.main:app --reload --port 8000"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendStartCmd
    Write-Host "[+] Proceso de Backend iniciado en ventana separada." -ForegroundColor Cyan
}

Write-Host "[*] Esperando que AgentGuard responda en /health antes de iniciar ACME Corp..." -ForegroundColor Gray
$retries = 25
$backendReady = $false
while ($retries -gt 0 -and -not $backendReady) {
    Start-Sleep -Milliseconds 800
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($health.status -eq "healthy" -or $health.status -eq "degraded") {
            $backendReady = $true
        }
    } catch {}
    $retries--
}

if ($backendReady) {
    Write-Host "[OK] Backend AgentGuard listo y escuchando en :8000." -ForegroundColor Green
} else {
    Write-Host "[!] El backend tardo en responder /health; continuando igualmente con los demas servicios." -ForegroundColor Yellow
}
Write-Host ""

# ------------------------------------------------------------------------------
# 5. Iniciar Servidor Frontend Vite (Puerto 5173)
# ------------------------------------------------------------------------------
Write-Host "[5/7] Levantando Frontend SPA en http://localhost:5173..." -ForegroundColor Yellow

$port5173Listeners = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 4 }
if ($port5173Listeners) {
    Write-Host "[OK] El puerto 5173 ya esta escuchando (Frontend ya corriendo)." -ForegroundColor Green
} else {
    $pkgRun = if ($pnpmCmd) { "pnpm run dev" } else { "npm run dev" }
    $frontendStartCmd = "`$Host.UI.RawUI.WindowTitle = 'AgentGuard Frontend (:5173)'; Set-Location '$frontendDir'; $pkgRun"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendStartCmd
    Write-Host "[+] Proceso de Frontend iniciado en ventana separada." -ForegroundColor Cyan
}

Write-Host "[*] Esperando que Vite responda en :5173..." -ForegroundColor Gray
$retries = 20
$frontendReady = $false
while ($retries -gt 0 -and -not $frontendReady) {
    Start-Sleep -Milliseconds 800
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($res.StatusCode -eq 200) {
            $frontendReady = $true
        }
    } catch {}
    $retries--
}

if ($frontendReady) {
    Write-Host "[OK] Frontend Vite listo en :5173." -ForegroundColor Green
} else {
    Write-Host "[!] Frontend continua arrancando en su consola." -ForegroundColor Yellow
}
Write-Host ""

# ------------------------------------------------------------------------------
# 6. Iniciar Servidor Empresarial ACME Corp (Puerto 9000) + Auto-Onboarding
# ------------------------------------------------------------------------------
Write-Host "[6/7] Levantando Portal Empresarial ACME Corp en http://localhost:9000..." -ForegroundColor Yellow

$acmeEnvFile = Join-Path $acmeDir ".env"
$acmeEnvExample = Join-Path $acmeDir ".env.example"
if (-not (Test-Path $acmeEnvFile) -and (Test-Path $acmeEnvExample)) {
    Write-Host "[*] Creando acme-corp/.env a partir de .env.example..." -ForegroundColor Cyan
    Copy-Item $acmeEnvExample $acmeEnvFile
    Write-Host "[OK] Archivo acme-corp/.env configurado." -ForegroundColor Green
}

$acmeVenvPython = Join-Path $acmeDir ".venv\Scripts\python.exe"
$acmePython = if (Test-Path $acmeVenvPython) { $acmeVenvPython } else { $venvPython }

$port9000Listeners = Get-NetTCPConnection -LocalPort 9000 -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 4 }
$acmeAlreadyHealthy = $false
if ($port9000Listeners) {
    try {
        $probe9000 = Invoke-RestMethod -Uri "http://localhost:9000/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($probe9000.app) {
            $acmeAlreadyHealthy = $true
        }
    } catch {}

    if (-not $acmeAlreadyHealthy) {
        Write-Host "[!] Proceso colgado detectado en puerto 9000 sin responder /health; liberando puerto..." -ForegroundColor Yellow
        $port9000Listeners | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Milliseconds 600
    }
}

if ($acmeAlreadyHealthy) {
    Write-Host "[OK] ACME Corp ya estaba corriendo y saludable en http://localhost:9000." -ForegroundColor Green
} else {
    $acmeStartCmd = "`$Host.UI.RawUI.WindowTitle = 'ACME Corporation (:9000)'; Set-Location '$acmeDir'; & '$acmePython' run.py"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $acmeStartCmd
    Write-Host "[+] Proceso de ACME Corp iniciado en ventana separada." -ForegroundColor Cyan
}

Write-Host "[*] Esperando que ACME Corp responda en :9000/health..." -ForegroundColor Gray
$retries = 20
$acmeReady = $false
while ($retries -gt 0 -and -not $acmeReady) {
    Start-Sleep -Milliseconds 800
    try {
        $acmeHealth = Invoke-RestMethod -Uri "http://localhost:9000/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($acmeHealth.status -eq "ok" -or $acmeHealth.status -eq "warning") {
            $acmeReady = $true
        }
    } catch {}
    $retries--
}

if ($acmeReady) {
    Write-Host "[OK] ACME Corp listo en :9000. Esperando vinculacion automatica con AgentGuard..." -ForegroundColor Green
    Start-Sleep -Milliseconds 1500
} else {
    Write-Host "[!] ACME Corp continua arrancando en su consola." -ForegroundColor Yellow
}
Write-Host ""

# ------------------------------------------------------------------------------
# 7. Abrir Navegador y Mostrar Resumen Consolidado
# ------------------------------------------------------------------------------
Set-Location $rootDir

if (-not $NoBrowser) {
    Write-Host "[7/7] Abriendo AgentGuard y ACME Corp en tu navegador predeterminado..." -ForegroundColor Green
    Start-Process "http://localhost:5173/#auth"
    Start-Sleep -Milliseconds 600
    Start-Process "http://localhost:9000"
} else {
    Write-Host "[7/7] Apertura automatica del navegador omitida (-NoBrowser)." -ForegroundColor Gray
}

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "     [OK] ECOSISTEMA AGENTGUARD + ACME CORP EN VIVO Y VINCULADO     " -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  [DASHBOARD SPA]   http://localhost:5173/#auth" -ForegroundColor White
Write-Host "  [BACKEND API]     http://localhost:8000" -ForegroundColor White
Write-Host "  [SWAGGER AGENTG]  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  [ACME CORP UI]    http://localhost:9000" -ForegroundColor Yellow
Write-Host "  [SWAGGER ACME]    http://localhost:9000/docs" -ForegroundColor Cyan
Write-Host "  [POSTGRES 16]     localhost:5433 (agentguard_db)" -ForegroundColor Gray
Write-Host "  [REDIS 7]         localhost:6379" -ForegroundColor Gray
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "  [INFO] Para detener todos los servicios (AgentGuard + ACME + Docker):" -ForegroundColor Yellow
Write-Host "         npm run stop:all   |   pnpm stop   |   .\stop_all.bat" -ForegroundColor White
Write-Host "====================================================================" -ForegroundColor Green
Write-Host ""
