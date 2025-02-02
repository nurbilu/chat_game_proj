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
for %%s in (frontend backend text-gen char-create library mysql) do (
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

:: Create temporary environment file
echo [%YELLOW%Creating docker-compose environment file...%NC%]
(
    echo DEMOMO_TAG=%TAG%
    echo DEMOMO_REGISTRY=nuriz1996/demomo
) > temp.env

:: Add variables from .env.backup first as base
if exist ".env.backup" (
    for /f "usebackq tokens=1,* delims==" %%a in (".env.backup") do (
        echo %%a=%%~b>> temp.env
    )
)

:: Override with .env if it exists and has non-empty values
if exist ".env" (
    for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
        set "key=%%a"
        set "value=%%~b"
        if not "!value!"=="" (
            echo !key!=!value!>> temp.env
        )
    )
)

:: Replace .env with the new file
move /y temp.env .env >nul

:: Start services with docker-compose
echo [%YELLOW%Starting containers...%NC%]
docker-compose up -d

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