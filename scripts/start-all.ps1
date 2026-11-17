# ==============================================================================
# AgentGuard - Orquestador Completo de Desarrollo Local (Full-Stack Starter)
# Levanta secuencialmente: Docker (Postgres/Redis) -> Backend (FastAPI) -> Frontend (Vite) -> Abre Navegador
# ==============================================================================

param(
    [switch]$Reset,
    [switch]$SeedAcme
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

Set-Location $rootDir

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "        [+] AGENTGUARD - INICIALIZADOR COMPLETO (FULL-STACK)        " -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host " Secuencia: Docker DB -> Migraciones -> Seeder -> Backend -> Frontend -> Browser" -ForegroundColor Gray
Write-Host ""

# ------------------------------------------------------------------------------
# 1. Verificar Docker & Levantar Contenedores (PostgreSQL 16 + Redis 7)
# ------------------------------------------------------------------------------
Write-Host "[1/6] Verificando Docker Desktop y servicios de persistencia..." -ForegroundColor Yellow

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
    Write-Host "[*] Abriendo Docker Desktop o espera a que termine de inicializar..." -ForegroundColor White
    Write-Host ""
    $prompt = Read-Host "Presiona [ENTER] una vez que Docker Desktop este abierto para continuar..."
    
    & docker info --format "{{.ServerVersion}}" *>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] No se pudo conectar al daemon de Docker. Abortando arranque." -ForegroundColor Red
        exit 1
    }
}

Write-Host "[+] Iniciando contenedores de base de datos y cache (PostgreSQL + Redis)..." -ForegroundColor Cyan
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
# 2. Configurar Backend, Migraciones y Seeder
# ------------------------------------------------------------------------------
Write-Host "[2/6] Configurando entorno Python, migraciones y semillas..." -ForegroundColor Yellow

Set-Location $backendDir

# Copiar .env si no existe
$envFile = Join-Path $backendDir ".env"
$envExampleFile = Join-Path $backendDir ".env.example"
if (-not (Test-Path $envFile)) {
    Write-Host "[*] Creando backend/.env a partir de .env.example..." -ForegroundColor Cyan
    Copy-Item $envExampleFile $envFile
    Write-Host "[OK] Archivo .env configurado." -ForegroundColor Green
}

# Verificar o crear .venv
$venvDir = Join-Path $backendDir ".venv"
$venvPython = Join-Path $venvDir "Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "[*] Creando entorno virtual .venv en backend/..." -ForegroundColor Cyan
    python -m venv .venv
    Write-Host "[*] Instalando dependencias de backend..." -ForegroundColor Cyan
    & $venvPython -m pip install -q -r requirements.txt
    Write-Host "[OK] Dependencias instaladas." -ForegroundColor Green
} else {
    Write-Host "[OK] Entorno virtual Python (.venv) detectado." -ForegroundColor Green
}

# Aplicar migraciones con Alembic
$alembicExe = Join-Path $venvDir "Scripts\alembic.exe"
Write-Host "[*] Aplicando migraciones de esquema con Alembic..." -ForegroundColor Gray
& $alembicExe upgrade head
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Error al aplicar migraciones de base de datos con Alembic (codigo $LASTEXITCODE)." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Esquema de base de datos sincronizado (13 tablas operativas)." -ForegroundColor Green

# Seeder oficial de Acme Corp (precarga unicamente bajo demanda explicita con -SeedAcme o -Reset)
if ($SeedAcme -or $Reset) {
    $seedScript = Join-Path $backendDir "scripts\seed_demo.py"
    $seedArgs = @($seedScript)
    if ($Reset) {
        Write-Host "[*] Reiniciando datos semilla de la demo (--reset)..." -ForegroundColor Yellow
        $seedArgs += "--reset"
    } else {
        Write-Host "[*] Verificando y sincronizando datos semilla de Acme Corp (5 roles RBAC)..." -ForegroundColor Gray
    }
    & $venvPython @seedArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] Error al ejecutar el seeder demo (codigo $LASTEXITCODE)." -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Semillas y usuarios RBAC sincronizados correctamente." -ForegroundColor Green
} else {
    Write-Host "[+] AgentGuard inicia limpio a la espera de registro de clientes o alta automatica de Acme Corp." -ForegroundColor Cyan
    Write-Host "    (Pasa -SeedAcme o -Reset si deseas precargar los datos de prueba de Acme Corp)" -ForegroundColor Gray
}
Write-Host ""

# ------------------------------------------------------------------------------
# 3. Verificar Dependencias de Frontend
# ------------------------------------------------------------------------------
Write-Host "[3/6] Verificando dependencias de Frontend..." -ForegroundColor Yellow
Set-Location $frontendDir

$frontendNodeModules = Join-Path $frontendDir "node_modules"
$pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue

if (-not (Test-Path $frontendNodeModules)) {
    Write-Host "[*] Instalando modulos de npm en frontend/..." -ForegroundColor Cyan
    if ($pnpmCmd) {
        & pnpm install
    } else {
        & npm install
    }
    Write-Host "[OK] Modulos de frontend instalados." -ForegroundColor Green
} else {
    Write-Host "[OK] node_modules detectado en frontend/." -ForegroundColor Green
}
Write-Host ""

# ------------------------------------------------------------------------------
# 4. Iniciar Servidor Backend FastAPI (Puerto 8000)
# ------------------------------------------------------------------------------
Write-Host "[4/6] Levantando Backend API con Uvicorn en http://localhost:8000..." -ForegroundColor Yellow

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
        Write-Host "[!] Se detecto un proceso colgado en puerto 8000 sin responder /health; liberando puerto..." -ForegroundColor Yellow
        $port8000Listeners | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Milliseconds 600
    }
}

if ($backendAlreadyHealthy) {
    Write-Host "[OK] Backend AgentGuard ya esta corriendo y saludable en http://localhost:8000." -ForegroundColor Green
} else {
    $backendStartCmd = "Set-Location '$backendDir'; & '$venvPython' -m uvicorn app.main:app --reload --port 8000"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendStartCmd
    Write-Host "[+] Proceso de Backend iniciado en ventana separada." -ForegroundColor Cyan
}

# Esperar que el backend responda en /health
Write-Host "[*] Esperando que la API FastAPI este respondiendo..." -ForegroundColor Gray
$retries = 20
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
    Write-Host "[OK] Backend FastAPI conectado y saludable." -ForegroundColor Green
} else {
    Write-Host "[!] El backend continua arrancando en su consola." -ForegroundColor Yellow
}
Write-Host ""

# ------------------------------------------------------------------------------
# 5. Iniciar Servidor Frontend Vite (Puerto 5173)
# ------------------------------------------------------------------------------
Write-Host "[5/6] Levantando Frontend Vite en http://localhost:5173..." -ForegroundColor Yellow

$port5173Listeners = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 4 }
if ($port5173Listeners) {
    Write-Host "[OK] El puerto 5173 ya esta escuchando (Frontend ya corriendo)." -ForegroundColor Green
} else {
    $pkgRun = if ($pnpmCmd) { "pnpm run dev" } else { "npm run dev" }
    $frontendStartCmd = "Set-Location '$frontendDir'; $pkgRun"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendStartCmd
    Write-Host "[+] Proceso de Frontend iniciado en ventana separada." -ForegroundColor Cyan
}

# Esperar que Vite este respondiendo
Write-Host "[*] Esperando que Vite este disponible..." -ForegroundColor Gray
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
    Write-Host "[OK] Frontend Vite listo." -ForegroundColor Green
} else {
    Write-Host "[!] Frontend continua arrancando en su consola." -ForegroundColor Yellow
}
Write-Host ""

# ------------------------------------------------------------------------------
# 6. Abrir Navegador Web Automaticamente (siempre en pantalla de Login)
# ------------------------------------------------------------------------------
Write-Host "[6/6] Abriendo AgentGuard en tu navegador web predeterminado (Login)..." -ForegroundColor Green
Start-Sleep -Seconds 1
Start-Process "http://localhost:5173/#auth"

# ------------------------------------------------------------------------------
# Resumen de Puntos de Acceso
# ------------------------------------------------------------------------------
Set-Location $rootDir

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "          [OK] AGENTGUARD ESTA EN VIVO Y LISTO PARA PROBAR          " -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  [FRONTEND]   http://localhost:5173" -ForegroundColor White
Write-Host "  [BACKEND]    http://localhost:8000" -ForegroundColor White
Write-Host "  [DOCS]       http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  [WEBSOCKET]  ws://localhost:8000/api/v1/ws/{organization_id}" -ForegroundColor Cyan
Write-Host "  [POSTGRES]   localhost:5433 (agentguard_db)" -ForegroundColor Gray
Write-Host "  [REDIS]      localhost:6379" -ForegroundColor Gray
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "  [INFO] Para detener todos los servicios de forma limpia:" -ForegroundColor Yellow
Write-Host "         Doble clic en stop_all.bat o corre 'pnpm stop' o './scripts/stop-all.ps1'" -ForegroundColor White
Write-Host "====================================================================" -ForegroundColor Green
Write-Host ""
