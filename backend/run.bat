@echo off
setlocal
title Katipunan Asset Management System - backend
cd /d "%~dp0.."

echo.
echo   Katipunan Asset Management System
echo   ---------------------------------
echo   Requires XAMPP MySQL (MariaDB) running on port 3306.
echo   Starting the backend...
echo.
echo   System page:  http://localhost:8080/
echo   Press Ctrl+C to stop the server.
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found on PATH.
  echo Install Python 3.10 or newer, then run this file again.
  echo.
  pause
  exit /b 1
)

rem Open the browser a moment after the server starts listening.
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:8080/'"

python backend\server.py

echo.
echo Server stopped.
pause
