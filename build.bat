@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Starting complete build process...%NC%]

:: Build frameworks (Backend and Model)
echo [%YELLOW%Building frameworks...%NC%]
call build-frameworks.bat
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Framework build failed%NC%]
    exit /b 1
)

:: Build frontend
echo [%YELLOW%Building frontend...%NC%]
call build-frontend.bat
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Frontend build failed%NC%]
    exit /b 1
)

:: Build and tag database images
echo [%YELLOW%Building database images...%NC%]

:: MySQL
docker pull mysql:8.0
docker tag mysql:8.0 demomo/mysql:latest

:: MongoDB
docker pull mongo:latest
docker tag mongo:latest demomo/mongodb:latest

echo [%GREEN%All builds completed successfully!%NC%]
exit /b 0 