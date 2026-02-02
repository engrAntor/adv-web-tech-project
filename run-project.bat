@echo off
echo ================================================
echo    Online Learning Platform - Project Launcher
echo ================================================
echo.

:: Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

:: Check if PostgreSQL is running (optional check)
echo Checking PostgreSQL connection...
echo Make sure PostgreSQL is running and configured in backend/.env
echo.

:: Install backend dependencies
echo ================================================
echo Installing Backend Dependencies...
echo ================================================
cd backend
if not exist node_modules (
    echo Running npm install for backend...
    call npm install
) else (
    echo Backend dependencies already installed.
)

:: Install frontend dependencies
echo.
echo ================================================
echo Installing Frontend Dependencies...
echo ================================================
cd ..\frontend
if not exist node_modules (
    echo Running npm install for frontend...
    call npm install
) else (
    echo Frontend dependencies already installed.
)

cd ..

echo.
echo ================================================
echo Starting the Application...
echo ================================================
echo.
echo Starting Backend (NestJS) on port 3000...
echo Starting Frontend (Next.js) on port 3001...
echo.
echo Press Ctrl+C to stop both servers.
echo.

:: Start backend in a new window
start "Backend Server" cmd /k "cd backend && npm run start:dev"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ================================================
echo Servers are starting...
echo ================================================
echo.
echo Backend API: http://localhost:3000
echo Frontend App: http://localhost:3001
echo.
echo Admin Panel: http://localhost:3001/admin
echo.
echo Press any key to close this window...
echo (The servers will continue running in their windows)
pause >nul
