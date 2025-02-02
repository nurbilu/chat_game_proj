@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Building Environment Image...%NC%]

:: Check if env-docker exists
if not exist "..\..\env-docker" (
    echo [%RED%env-docker directory not found%NC%]
    exit /b 1
)

:: Build Environment Image
cd ..\..\env-docker
docker build -t demomo/env:latest -f env.Dockerfile .
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Environment image build failed%NC%]
    cd "..\Build & Push docker\TheBuilds"
    exit /b 1
)

cd "..\Build & Push docker\TheBuilds"
echo [%GREEN%Environment image built successfully%NC%]
exit /b 0 