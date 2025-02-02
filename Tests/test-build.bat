@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Testing build process...%NC%]

:: Test environment setup
echo [%YELLOW%1. Testing environment setup...%NC%]
if not exist "..\Build & Push docker\deploy-config.bat" (
    echo [%RED%deploy-config.bat not found%NC%]
    exit /b 1
)

if not exist "..\Build & Push docker\env-config.bat" (
    echo [%RED%env-config.bat not found%NC%]
    exit /b 1
)

:: Test Docker installation
echo [%YELLOW%2. Testing Docker installation...%NC%]
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Docker is not installed or not running%NC%]
    exit /b 1
)

:: Test required directories exist
echo [%YELLOW%3. Testing directory structure...%NC%]
if not exist "..\frontend" (
    echo [%RED%Frontend directory not found%NC%]
    exit /b 1
)

if not exist "..\backend" (
    echo [%RED%Backend directory not found%NC%]
    exit /b 1
)

if not exist "..\model" (
    echo [%RED%Model directory not found%NC%]
    exit /b 1
)

:: Test Dockerfile existence
echo [%YELLOW%4. Testing Dockerfile existence...%NC%]
if not exist "..\frontend\Dockerfile" (
    echo [%RED%Frontend Dockerfile not found%NC%]
    exit /b 1
)

if not exist "..\backend\Dockerfile" (
    echo [%RED%Backend Dockerfile not found%NC%]
    exit /b 1
)

if not exist "..\model\text-generation.Dockerfile" (
    echo [%RED%Text Generation Dockerfile not found%NC%]
    exit /b 1
)

if not exist "..\model\character-creation.Dockerfile" (
    echo [%RED%Character Creation Dockerfile not found%NC%]
    exit /b 1
)

if not exist "..\model\library-service.Dockerfile" (
    echo [%RED%Library Service Dockerfile not found%NC%]
    exit /b 1
)

:: Test build scripts existence
echo [%YELLOW%5. Testing build scripts...%NC%]
if not exist "..\Build & Push docker\TheBuilds\build-env.bat" (
    echo [%RED%Environment build script not found%NC%]
    exit /b 1
)

if not exist "..\Build & Push docker\TheBuilds\build-frontend.bat" (
    echo [%RED%Frontend build script not found%NC%]
    exit /b 1
)

if not exist "..\Build & Push docker\TheBuilds\build-Dj-back.bat" (
    echo [%RED%Backend build script not found%NC%]
    exit /b 1
)

if not exist "..\Build & Push docker\TheBuilds\build-model.bat" (
    echo [%RED%Model build script not found%NC%]
    exit /b 1
)

:: Test docker-compose.yml existence
echo [%YELLOW%6. Testing docker-compose configuration...%NC%]
if not exist "..\docker-compose.yml" (
    echo [%RED%docker-compose.yml not found%NC%]
    exit /b 1
)

echo [%GREEN%All build prerequisites verified successfully!%NC%]
exit /b 0 