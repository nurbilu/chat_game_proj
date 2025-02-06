@echo off
setlocal EnableDelayedExpansion

set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

if not exist ".ENV" (
    echo [%YELLOW%Copying environment file...%NC%]
    copy "..\Build & Push docker\theENVdock\.ENV" ".ENV" >nul

    if !ERRORLEVEL! NEQ 0 (
        echo [%RED%Failed to copy .ENV file%NC%]
        exit /b 1
    )
)

echo [%YELLOW%Building environment image...%NC%]
docker build -t demomo/env:latest -f env.Dockerfile .


if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Failed to build environment image%NC%]
    exit /b 1
)

echo [%YELLOW%Ensuring network exists...%NC%]

docker network inspect demomo-network >nul 2>&1 || (
    echo [%YELLOW%Creating docker network...%NC%]
    docker network create demomo-network
)

echo [%YELLOW%Cleaning up existing environment container...%NC%]
docker rm -f demomo-env >nul 2>&1


echo [%YELLOW%Starting environment container...%NC%]
docker run -d --name demomo-env ^
    --network demomo-network ^
    -v demomo-env:/app/env ^
    demomo/env:latest

if %ERRORLEVEL% EQU 0 (
    echo [%GREEN%Environment container started successfully%NC%]
    cd "..\Build & Push docker"
    exit /b 0
) else (
    echo [%RED%Failed to start environment container%NC%]
    cd "..\Build & Push docker"
    exit /b 1
) 