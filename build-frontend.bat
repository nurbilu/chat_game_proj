@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Building Frontend...%NC%]

:: Build Frontend
docker build -t demomo/frontend:latest -f frontend/Dockerfile ./frontend
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Frontend build failed%NC%]
    exit /b 1
)

echo [%GREEN%Frontend built successfully!%NC%]
exit /b 0