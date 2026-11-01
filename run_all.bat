@echo off
echo Starting Workforce Scheduling Optimization System...
start "Backend Flask API (Port 5000)" cmd /k "%~dp0run_backend.bat"
start "Frontend React App (Port 3000)" cmd /k "%~dp0run_frontend.bat"
echo Both servers started!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000/api/dashboard/stats
