@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Starting complete build process...%NC%]

:: Build Backend and Model frameworks
echo [%YELLOW%Building Backend framework...%NC%]
call TheBuilds\build-Dj-back.bat
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Backend framework build failed%NC%]
    exit /b 1
)

echo [%YELLOW%Building Model framework...%NC%]
call TheBuilds\build-model.bat
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Model framework build failed%NC%]
    exit /b 1
)

:: Build frontend
echo [%YELLOW%Building frontend...%NC%]
call TheBuilds\build-frontend.bat
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Frontend build failed%NC%]
    exit /b 1
)

:: Build and tag MySQL image
echo [%YELLOW%Building database images...%NC%]
docker pull mysql:8.0
docker tag mysql:8.0 demomo/mysql:latest

:: Build Docker images
docker-compose build

echo [%GREEN%All builds completed successfully!%NC%]
exit /b 0 