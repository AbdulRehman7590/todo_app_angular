@echo off
cd /d "%~dp0"

echo Starting Todo Angular...
docker compose up -d --build
if errorlevel 1 (
  echo.
  echo Failed to start. Make sure Docker Desktop is running.
  pause
  exit /b 1
)

echo.
echo Frontend: http://localhost:4200
echo Backend:  http://localhost:3000/todos
echo.
echo Run stop.bat to shut the project down.
pause
