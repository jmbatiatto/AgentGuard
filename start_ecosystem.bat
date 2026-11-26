@echo off
chcp 65001 > nul
title AgentGuard + ACME Corp - Ecosystem Starter
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-ecosystem.ps1" %*
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ---------------------------------------------------
    echo Ocurrio un error al iniciar AgentGuard + ACME Corp.
    echo ---------------------------------------------------
    pause
)
