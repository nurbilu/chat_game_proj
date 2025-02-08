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

:: Remove existing env container if it exists
echo [%YELLOW%Checking for existing environment container...%NC%]
docker rm -f demomo-env >nul 2>&1


echo [%YELLOW%Wait please for all messages to be displayed before pressing any keys, thank you%NC%]
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

echo [%YELLOW%Wait please for all messages to be displayed before pressing any keys, thank you%NC%]

:: Start services with docker-compose
echo [%YELLOW%Starting remaining containers...%NC%]
docker-compose --env-file .env up -d

:: Check container health
echo [%YELLOW%Checking container health...%NC%] 
echo [%YELLOW%Wait please for all messages to be displayed before pressing any keys, thank you%NC%]
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
echo [%YELLOW%Wait please for all messages to be displayed before pressing any keys, thank you%NC%]

:: Clear instructions for all commands
echo [%YELLOW%Available commands:%NC%]
echo [%YELLOW%- Press 'q' or CTRL+C to stop all containers and cleanup%NC%]
echo [%YELLOW%- Press 'o' or type 'open' to open the Web-Site in your browser%NC%]
echo [%RED%- Press 'cD' to clear ALL Docker images and containers (WARNING: This will remove ALL Docker items)%NC%]

:loop
choice /c qocd /n /m "Enter command (Q=Quit, O=Open website, C=Clear Docker, D=Cancel): "
if errorlevel 4 goto :loop
if errorlevel 3 (
    echo [%RED%WARNING: This will remove ALL Docker images and containers!%NC%]
    choice /c yn /n /m "Are you sure? (Y/N): "
    if errorlevel 2 goto :loop
    if errorlevel 1 (
        echo [%YELLOW%Starting complete Docker cleanup...%NC%]
        call cleanup.bat
        exit /b 0
    )
)
if errorlevel 2 (
    echo [%YELLOW%Opening website...%NC%]
    call open-web.bat
    goto :loop
)
if errorlevel 1 (
    echo [%YELLOW%Stopping containers and cleaning up...%NC%]
    call :CLEANUP
)

:CLEANUP
:: Stop all containers with names starting with demomo-
echo [%YELLOW%Stopping all containers...%NC%]
for /f "tokens=*" %%c in ('docker ps --filter "name=demomo-" -q') do (
    echo Stopping container: %%c
    docker stop %%c
)

:: Wait for containers to stop
timeout /t 5 /nobreak >nul

:: Call rmv-env.bat to clean up environment files
echo [%YELLOW%Cleaning up environment files...%NC%]
call rmv-env.bat

echo [%GREEN%All containers stopped and cleanup completed!%NC%]
exit /b 0
