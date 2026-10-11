@echo off
chcp 65001 > nul
title AgentGuard - Backend Starter
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-backend.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ---------------------------------------------------
    echo Ocurrió un error al iniciar el backend.
    echo ---------------------------------------------------
    pause
)
