@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

:: Check if deploy-config.bat exists
if not exist "deploy-config.bat" (
    echo [%RED%Error: deploy-config.bat not found%NC%]
    echo Please copy deploy-config.template.bat to deploy-config.bat and set your password
    exit /b 1
)

:: Load deployment configuration
call deploy-config.bat

:: Password Protection
set /p "INPUT_PASSWORD=Enter deployment password: "
if not "%INPUT_PASSWORD%"=="%DEPLOY_PASSWORD%" (
    echo [%RED%Invalid password. Build aborted.%NC%]
    exit /b 1
)

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

:: Pull and tag MySQL image
echo [%YELLOW%Pulling MySQL image...%NC%]
docker pull mysql:8.0
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%MySQL image pull failed%NC%]
    exit /b 1
)

:: Build Docker images
docker-compose build

echo [%GREEN%All builds completed successfully!%NC%]
exit /b 0 