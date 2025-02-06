@echo off
setlocal EnableDelayedExpansion

set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Building Backend framework...%NC%]

mkdir ..\backend\temp 2>nul


powershell -Command "(Get-Content ..\backend\init.sh) | Set-Content -NoNewline ..\backend\temp\init.sh -Encoding UTF8"


echo [%YELLOW%Building Backend...%NC%]
docker build -t demomo/backend:latest -f ..\backend\Dockerfile ..\backend
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Backend build failed%NC%]
    rmdir /s /q ..\backend\temp 2>nul
    exit /b 1
)

rmdir /s /q ..\backend\temp 2>nul

echo [%GREEN%Backend built successfully%NC%]
exit /b 0