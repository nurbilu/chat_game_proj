@echo off
setlocal enabledelayedexpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Starting multi-container deployment...%NC%]

:: Set the default tag if not specified
set TAG=latest
if not "%1"=="" set TAG=%1

:: Verify images exist locally
echo [%YELLOW%Verifying required images...%NC%]
for %%s in (env frontend backend text-gen char-create library mysql) do (
    docker image inspect nuriz1996/demomo:%%s-%TAG% >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        echo [%RED%Error: Image nuriz1996/demomo:%%s-%TAG% not found. Please run pull.bat first%NC%]
        exit /b 1
    )
)

:: Create docker network if it doesn't exist
docker network inspect demomo-network >nul 2>&1 || (
    echo [%YELLOW%Creating docker network...%NC%]
    docker network create demomo-network
)

<<<<<<< HEAD
:: Remove existing env container if it exists
echo [%YELLOW%Checking for existing environment container...%NC%]
docker rm -f demomo-env >nul 2>&1

:: Start env container first
echo [%YELLOW%Starting environment container...%NC%]
docker run -d --name demomo-env --network demomo-network nuriz1996/demomo:env-%TAG%
if !ERRORLEVEL! NEQ 0 (
    echo [%RED%Failed to start environment container%NC%]
    exit /b 1
)

:: Wait for env container to be ready
echo [%YELLOW%Waiting for environment container...%NC%]
timeout /t 5 /nobreak >nul

:: Copy environment from container
echo [%YELLOW%Loading environment from container...%NC%]
docker cp demomo-env:/app/env/.env .env
if !ERRORLEVEL! NEQ 0 (
    echo [%RED%Failed to load environment from container%NC%]
    exit /b 1
)

:: Set registry and tag for docker-compose
set "DEMOMO_REGISTRY=nuriz1996/demomo"
set "DEMOMO_TAG=%TAG%"

:: Start services with docker-compose
echo [%YELLOW%Starting remaining containers...%NC%]
docker-compose --env-file .env up -d
=======
:: Check if .env exists and has required variables
if not exist ".env" (
    echo [%RED%Error: .env file not found%NC%]
    exit /b 1
)

:: Update only the tag in the existing .env file
echo [%YELLOW%Updating environment variables...%NC%]
powershell -Command "(Get-Content .env) -replace '^DEMOMO_TAG=.*$', 'DEMOMO_TAG=%TAG%' | Set-Content .env"

:: Start env container first
echo [%YELLOW%Starting environment container...%NC%]
docker run -d --name demomo-env --network demomo-network nuriz1996/demomo:env-%TAG%
if !ERRORLEVEL! NEQ 0 (
    echo [%RED%Failed to start environment container%NC%]
    exit /b 1
)

:: Wait for env container to be ready
timeout /t 5 /nobreak >nul

:: Start services with docker-compose
echo [%YELLOW%Starting remaining containers...%NC%]
docker-compose up -d
>>>>>>> d46151541e4c17cd72c226b08451daee00816e8d

:: Check container health
echo [%YELLOW%Checking container health...%NC%]
timeout /t 10 /nobreak >nul

:: Verify all containers are running
for %%s in (frontend backend model-text-generation model-character-creation model-library-service mysql) do (
    docker ps --filter "name=demomo-%%s" --format "{{.Status}}" | findstr "Up" >nul
    if !ERRORLEVEL! NEQ 0 (
        echo [%RED%Container demomo-%%s failed to start properly%NC%]
        exit /b 1
    )
)

echo [%GREEN%All containers started successfully!%NC%]
exit /b 0
