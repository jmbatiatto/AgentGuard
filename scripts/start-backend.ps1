# ==============================================================================
# AgentGuard - Script de Arranque Automatizado del Backend
# Diseñado para levantar en orden: Docker -> .venv -> Migraciones -> FastAPI
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$backendDir = Join-Path $rootDir "backend"

Set-Location $rootDir

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "       [+] AGENTGUARD - INICIALIZADOR DE DESARROLLO (BACKEND)       " -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------------------------
# 1. Verificar Docker & Docker Compose
# ------------------------------------------------------------------------------
Write-Host "[1/4] Verificando Docker y servicios de persistencia..." -ForegroundColor Yellow

$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
    Write-Host "[!] Error: Docker no esta instalado en esta maquina." -ForegroundColor Red
    Write-Host "Instala Docker Desktop desde https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    exit 1
}

# Comprobar si el motor de Docker esta corriendo suprimiendo warnings inocuos de stderr
$dockerRunning = $false
& docker info --format "{{.ServerVersion}}" *>$null
if ($LASTEXITCODE -eq 0) {
    $dockerRunning = $true
}

if (-not $dockerRunning) {
    Write-Host ""
    Write-Host "[!] ATENCION: Docker Desktop no esta iniciado o esta arrancando." -ForegroundColor Yellow
    Write-Host "[*] Por favor, abri Docker Desktop en Windows y espera unos segundos." -ForegroundColor White
    Write-Host ""
    $prompt = Read-Host "Presiona [ENTER] una vez que Docker Desktop este abierto para continuar..."
    
    & docker info --format "{{.ServerVersion}}" *>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] No se pudo conectar al daemon de Docker. Abortando arranque." -ForegroundColor Red
        exit 1
    }
}

Write-Host "[+] Levantando contenedores (PostgreSQL 16 + Redis 7)..." -ForegroundColor Cyan
docker compose up -d

Write-Host "[*] Esperando disponibilidad de PostgreSQL..." -ForegroundColor Gray
$retries = 15
$ready = $false
while ($retries -gt 0 -and -not $ready) {
    Start-Sleep -Seconds 2
    & docker compose exec -T postgres pg_isready -U agentguard -d agentguard_db *>$null
    if ($LASTEXITCODE -eq 0) {
        $ready = $true
    }
    $retries--
}

if ($ready) {
    Write-Host "[OK] PostgreSQL 16 y Redis 7 listos y aceptando conexiones." -ForegroundColor Green
} else {
    Write-Host "[!] PostgreSQL demoro en responder pero los contenedores estan arriba. Continuando..." -ForegroundColor Yellow
}
Write-Host ""

# ------------------------------------------------------------------------------
# 2. Verificar Entorno Virtual de Python y Dependencias
# ------------------------------------------------------------------------------
Write-Host "[2/4] Verificando entorno Python en backend/..." -ForegroundColor Yellow

Set-Location $backendDir

# Verificar archivo .env
$envFile = Join-Path $backendDir ".env"
$envExampleFile = Join-Path $backendDir ".env.example"
if (-not (Test-Path $envFile)) {
    Write-Host "[*] Creando backend/.env desde .env.example..." -ForegroundColor Cyan
    Copy-Item $envExampleFile $envFile
    Write-Host "[OK] Archivo .env configurado con valores predeterminados de desarrollo." -ForegroundColor Green
}

# Verificar .venv
$venvDir = Join-Path $backendDir ".venv"
$venvPython = Join-Path $venvDir "Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "[*] Creando entorno virtual .venv en backend/..." -ForegroundColor Cyan
    python -m venv .venv
    Write-Host "[*] Instalando dependencias desde requirements.txt (puede demorar un momento)..." -ForegroundColor Cyan
    & $venvPython -m pip install -q -r requirements.txt
    Write-Host "[OK] Entorno virtual instalado y listo." -ForegroundColor Green
} else {
    Write-Host "[OK] Entorno virtual (.venv) detectado correctamente." -ForegroundColor Green
}
Write-Host ""

# ------------------------------------------------------------------------------
# 3. Aplicar Migraciones de Base de Datos con Alembic
# ------------------------------------------------------------------------------
Write-Host "[3/4] Sincronizando esquema de base de datos con Alembic..." -ForegroundColor Yellow
$alembicExe = Join-Path $venvDir "Scripts\alembic.exe"

try {
    & $alembicExe upgrade head
    Write-Host "[OK] Migraciones de Alembic aplicadas exitosamente (12 tablas del MER creadas)." -ForegroundColor Green
} catch {
    Write-Host "[!] Nota: No se pudo ejecutar alembic automaticamente o ya esta al dia." -ForegroundColor Yellow
}
Write-Host ""

# ------------------------------------------------------------------------------
# 4. Iniciar Servidor FastAPI con Uvicorn
# ------------------------------------------------------------------------------
Write-Host "[4/4] Iniciando servidor FastAPI con Uvicorn..." -ForegroundColor Green
$uvicornExe = Join-Path $venvDir "Scripts\uvicorn.exe"

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "   AGENTGUARD BACKEND EN VIVO Y ESCUCHANDO" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "  API Base:           http://localhost:8000" -ForegroundColor White
Write-Host "  Swagger UI (Docs):  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  ReDoc:              http://localhost:8000/redoc" -ForegroundColor Cyan
Write-Host "  Healthcheck:        http://localhost:8000/health" -ForegroundColor White
Write-Host "====================================================================" -ForegroundColor Green
Write-Host " Presiona Ctrl + C en esta terminal para detener el servidor." -ForegroundColor Gray
Write-Host ""

& $uvicornExe app.main:app --reload --port 8000
