# ==============================================================================
# AgentGuard - Script de Parada Limpia (Full-Stack Stopper)
# Detiene los procesos de Backend (puerto 8000), Frontend (puerto 5173) y Docker
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
Set-Location $rootDir

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "          🛑  AGENTGUARD - DETENIENDO SERVICIOS LOCALES            " -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Detener procesos en puerto 8000 (Backend / Uvicorn)
Write-Host "[*] Liberando puerto 8000 (Backend FastAPI)..." -ForegroundColor Yellow
$pids8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($p in $pids8000) {
    try {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        Write-Host "    Proceso con PID $p detenido." -ForegroundColor Gray
    } catch {}
}

# 2. Detener procesos en puerto 5173 (Frontend / Vite)
Write-Host "[*] Liberando puerto 5173 (Frontend Vite)..." -ForegroundColor Yellow
$pids5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($p in $pids5173) {
    try {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        Write-Host "    Proceso con PID $p detenido." -ForegroundColor Gray
    } catch {}
}

# 3. Pausar o detener contenedores Docker de persistencia
Write-Host "[*] Deteniendo contenedores Docker (PostgreSQL 16 + Redis 7)..." -ForegroundColor Yellow
try {
    docker compose stop
    Write-Host "[OK] Contenedores detenidos correctamente (datos conservados en volumenes)." -ForegroundColor Green
} catch {
    Write-Host "[!] Docker no estaba corriendo o ya estaban detenidos." -ForegroundColor Gray
}

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "  [OK] Todos los servicios de AgentGuard han sido detenidos limpiamente." -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
Write-Host ""
