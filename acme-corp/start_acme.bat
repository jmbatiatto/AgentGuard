@echo off
chcp 65001 > nul
title ACME Corporation (Looney Tunes) - Puerto 9000
pushd "%~dp0"

if not exist ".env" (
    if exist ".env.example" (
        echo [*] Creando acme-corp\.env a partir de .env.example...
        copy /Y ".env.example" ".env" > nul
    )
)

if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" run.py
    set "EXIT_CODE=%ERRORLEVEL%"
    goto :finish
)

if exist "..\backend\.venv\Scripts\python.exe" (
    "..\backend\.venv\Scripts\python.exe" run.py
    set "EXIT_CODE=%ERRORLEVEL%"
    goto :finish
)

echo [*] Creando entorno virtual aislado en acme-corp\.venv...
python -m venv .venv
if %ERRORLEVEL% NEQ 0 (
    set "EXIT_CODE=%ERRORLEVEL%"
    goto :err
)

echo [*] Instalando dependencias de acme-corp\requirements.txt...
".venv\Scripts\python.exe" -m pip install -q -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    set "EXIT_CODE=%ERRORLEVEL%"
    goto :err
)

".venv\Scripts\python.exe" run.py
set "EXIT_CODE=%ERRORLEVEL%"

:finish
if not "%EXIT_CODE%"=="0" goto :err
popd
exit /b 0

:err
echo.
echo [!] Error al iniciar ACME Corporation.
popd
pause
exit /b 1
