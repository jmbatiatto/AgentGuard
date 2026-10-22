@echo off
chcp 65001 > nul
title AgentGuard - Full Stack Stopper
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-all.ps1"
