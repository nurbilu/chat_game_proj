@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Starting DeMe application...%NC%]

:: Stop and remove any existing containers and services
echo [%YELLOW%Cleaning up existing services...%NC%]
docker-compose down -v
docker stop mysql-demomo mongodb-demomo 2>nul
docker rm mysql-demomo mongodb-demomo 2>nul

:: Kill any process using required ports
echo [%YELLOW%Checking for processes using required ports...%NC%]
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3307"') do (
    echo Stopping process with PID: %%a
    taskkill /F /PID %%a 2>nul
)

:: Wait for ports to be freed
echo [%YELLOW%Waiting for ports to be freed...%NC%]
timeout /t 3 /nobreak > nul

:: Start application
echo [%YELLOW%Starting services...%NC%]
docker-compose up -d
if %ERRORLEVEL% EQU 0 (
    echo [%GREEN%Success%NC%] Services started successfully

    :: Wait for services to be ready
    echo [%YELLOW%Waiting for services to be ready...%NC%]
    timeout /t 15 /nobreak > nul

    :: Show status
    echo.
    echo [%YELLOW%Container status:%NC%]
    docker-compose ps

    echo.
    echo [%GREEN%Services available at:%NC%]
    echo   Frontend: http://localhost:4200
    echo   Backend: http://localhost:8000
    echo   Model Services:
    echo     - Text Generation: http://localhost:5000
    echo     - Character Creation: http://localhost:6500
    echo     - Library Service: http://localhost:7652
    echo   Databases:
    echo     - MySQL: localhost:3307
    echo     - MongoDB: localhost:27017
) else (
    echo [%RED%Failed%NC%] Service startup failed
    exit /b 1
)

exit /b 0 