@echo off
chcp 65001 > nul
title AgentGuard - Full Stack Starter
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-all.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ---------------------------------------------------
    echo Ocurrio un error al iniciar AgentGuard.
    echo ---------------------------------------------------
    pause
)
