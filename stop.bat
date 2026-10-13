@echo off
cd /d "%~dp0"

echo Stopping Todo Angular...
docker compose down
if errorlevel 1 (
  echo.
  echo Failed to stop. Make sure Docker Desktop is running.
  pause
  exit /b 1
)

echo Project stopped.
pause
