@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

:: Get tag name from command line argument
set "TAG=%1"
if "%TAG%"=="" (
    set "TAG=go"
)

echo [%YELLOW%Starting multi-container deployment with tag: %TAG%...%NC%]

:: Remove existing containers and networks
echo [%YELLOW%Cleaning up existing containers and networks...%NC%]
docker-compose -f docker-compose.pulled.yml down -v
docker network rm demomo-network 2>nul

:: Create network if it doesn't exist
echo [%YELLOW%Creating docker network...%NC%]
docker network create demomo-network

:: Check if MongoDB initialization is needed
if exist "model\.env" (
    echo [%YELLOW%Initializing MongoDB Atlas connection...%NC%]
    bash model/init-mongo-pulled.sh
    if %ERRORLEVEL% NEQ 0 (
        echo [%RED%MongoDB initialization failed%NC%]
        exit /b 1
    )
) else (
    echo [%YELLOW%Skipping MongoDB initialization (.env file not found)%NC%]
)

:: Pull images before starting
echo [%YELLOW%Pulling required images...%NC%]
docker pull nuriz1996/demomo:frontend-%TAG%
docker pull nuriz1996/demomo:backend-%TAG%
docker pull nuriz1996/demomo:text-gen-%TAG%
docker pull nuriz1996/demomo:char-create-%TAG%
docker pull nuriz1996/demomo:library-%TAG%
docker pull mysql:8.0

:: Start all containers using docker-compose with TAG environment variable
echo [%YELLOW%Starting all services with docker-compose...%NC%]
set TAG=%TAG%
docker-compose -f docker-compose.pulled.yml up -d

:: Wait for services to be ready
timeout /t 15 /nobreak

:: Check container status
echo [%YELLOW%Checking container status...%NC%]
docker-compose -f docker-compose.pulled.yml ps

if %ERRORLEVEL% EQU 0 (
    echo [%GREEN%Multi-container deployment completed!%NC%]
    echo [%YELLOW%Services are accessible at:%NC%]
    echo [%YELLOW%Frontend: http://localhost:4200%NC%]
    echo [%YELLOW%Backend: http://localhost:8000%NC%]
    echo [%YELLOW%Model Services:%NC%]
    echo [%YELLOW%- Text Generation: http://localhost:5000%NC%]
    echo [%YELLOW%- Character Creation: http://localhost:6500%NC%]
    echo [%YELLOW%- Library Service: http://localhost:7625%NC%]
    echo [%YELLOW%MySQL Database: localhost:3306%NC%]
) else (
    echo [%RED%Failed to start one or more services%NC%]
    exit /b 1
)

exit /b 0 