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
    echo [%YELLOW%No tag specified, pulling latest images...%NC%]
    set "TAG=latest"
) else (
    echo [%YELLOW%Pulling images with tag: %TAG%%NC%]
)

:: Pull all services
docker pull nuriz1996/demomo:frontend-%TAG%
docker pull nuriz1996/demomo:backend-%TAG%
docker pull nuriz1996/demomo:text-gen-%TAG%
docker pull nuriz1996/demomo:char-create-%TAG%
docker pull nuriz1996/demomo:library-%TAG%
docker pull nuriz1996/demomo:mysql-%TAG%

:: Tag images for local use
docker tag nuriz1996/demomo:frontend-%TAG% demomo/frontend:latest
docker tag nuriz1996/demomo:backend-%TAG% demomo/backend:latest
docker tag nuriz1996/demomo:text-gen-%TAG% demomo/model-text-generation:latest
docker tag nuriz1996/demomo:char-create-%TAG% demomo/model-character-creation:latest
docker tag nuriz1996/demomo:library-%TAG% demomo/model-library-service:latest
docker tag nuriz1996/demomo:mysql-%TAG% demomo/mysql:latest

if %ERRORLEVEL% EQU 0 (
    echo [%GREEN%Successfully pulled all services%NC%]
) else (
    echo [%RED%Failed to pull one or more services%NC%]
    exit /b 1
)

echo [%GREEN%All services have been pulled and tagged for local use%NC%]
exit /b 0 