@echo off
echo ========================================================
echo   Workforce Scheduling Optimization System - Vite React
echo ========================================================
cd /d "%~dp0frontend"
set PATH=%~dp0.tools\node;%PATH%
call npm.cmd run dev
pause
