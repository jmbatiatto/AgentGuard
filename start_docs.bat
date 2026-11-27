@echo off
setlocal EnableExtensions
chcp 65001 >nul
title AgentGuard - Portal Interactivo de Documentacion
pushd "%~dp0"

set "FORCE_REBUILD=0"
if /I "%~1"=="--rebuild" set "FORCE_REBUILD=1"

echo ====================================================================
echo   AgentGuard Docs Portal - Lanzador Oficial (ITU - UNCuyo 2026)
echo ====================================================================
echo.

if not exist "docs-portal\node_modules" (
    echo [1/3] Instalando dependencias del workspace con pnpm...
    call pnpm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Fallo la instalacion de dependencias con pnpm.
        popd
        pause
        exit /b 1
    )
) else (
    echo [1/3] Dependencias verificadas en docs-portal\node_modules.
)

if "%FORCE_REBUILD%"=="1" (
    echo [2/3] Reconstruyendo portal documental (--rebuild solicitado^)...
    call pnpm --dir docs-portal run build
    if errorlevel 1 (
        echo.
        echo [ERROR] Fallo la compilacion del portal VitePress.
        popd
        pause
        exit /b 1
    )
) else if not exist "docs-portal\src\.vitepress\dist" (
    echo [2/3] Compilando portal VitePress por primera vez...
    call pnpm --dir docs-portal run build
    if errorlevel 1 (
        echo.
        echo [ERROR] Fallo la compilacion inicial del portal VitePress.
        popd
        pause
        exit /b 1
    )
) else (
    echo [2/3] Build existente detectado en docs-portal\src\.vitepress\dist.
    echo       ^(Usa "start_docs.bat --rebuild" si actualizaste los documentos^).
)

echo [3/3] Iniciando servidor de vista previa en ventana externa (:4173^)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1
start "AgentGuard Docs Portal" cmd /k "pnpm --dir docs-portal run preview"
timeout /t 2 /nobreak >nul
start "" "http://localhost:4173"

echo.
echo --------------------------------------------------------------------
echo   Portal activo en:
echo     * Inicio             : http://localhost:4173
echo     * Instalacion Local  : http://localhost:4173/instalacion
echo     * Galeria 4K         : http://localhost:4173/galeria-diagramas
echo     * Presentacion ^& QR  : http://localhost:4173/modo-presentacion
echo --------------------------------------------------------------------
echo.

popd
endlocal
