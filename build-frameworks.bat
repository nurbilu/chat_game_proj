@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Building Backend and Model frameworks...%NC%]

:: Build Backend
echo [%YELLOW%Building Backend...%NC%]
docker build -t demomo/backend:latest -f backend/Dockerfile ./backend
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Backend build failed%NC%]
    exit /b 1
)
echo [%GREEN%Backend built successfully%NC%]

:: Build Model
echo [%YELLOW%Building Model...%NC%]
docker build -t demomo/model:latest -f model/Dockerfile ./model
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Model build failed%NC%]
    exit /b 1
)
echo [%GREEN%Model built successfully%NC%]

echo [%GREEN%All frameworks built successfully!%NC%]
exit /b 0 