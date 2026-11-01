@echo off
echo ========================================================
echo   Workforce Scheduling Optimization System - Flask API
echo ========================================================
cd /d "%~dp0"
set PATH=%~dp0.tools\python;%PATH%
python backend\app.py
pause
