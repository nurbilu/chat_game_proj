@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

:: Get tag name from command line argument
set "TAG=%~1"
if "%TAG%"=="" (
    echo [%YELLOW%No tag specified, pulling latest images...%NC%]
    set "TAG=latest"
) else (
    echo [%YELLOW%Pulling images with tag: %TAG%%NC%]
)



:: Pull images from Docker Hub
echo [%YELLOW%Pulling images...%NC%]
docker pull nuriz1996/demomo:env-%TAG%
docker pull nuriz1996/demomo:frontend-%TAG%
docker pull nuriz1996/demomo:backend-%TAG%
docker pull nuriz1996/demomo:text-gen-%TAG%
docker pull nuriz1996/demomo:char-create-%TAG%
docker pull nuriz1996/demomo:library-%TAG%
docker pull nuriz1996/demomo:mysql-%TAG%


:: Tag images for local use
docker tag nuriz1996/demomo:env-%TAG% demomo/env:latest
docker tag nuriz1996/demomo:frontend-%TAG% demomo/frontend:latest
docker tag nuriz1996/demomo:backend-%TAG% demomo/backend:latest
docker tag nuriz1996/demomo:text-gen-%TAG% demomo/model-text-generation:latest
docker tag nuriz1996/demomo:char-create-%TAG% demomo/model-character-creation:latest
docker tag nuriz1996/demomo:library-%TAG% demomo/model-library-service:latest
docker tag nuriz1996/demomo:mysql-%TAG% demomo/mysql:latest


if %ERRORLEVEL% EQU 0 (
    echo [%GREEN%Successfully pulled and tagged all services%NC%]
) else (
    echo [%RED%Failed to tag one or more services%NC%]
    exit /b 1
)

echo [%GREEN%All services have been pulled and tagged for local use%NC%]
:: Run pull tests first
:: echo [%YELLOW%Running pull tests...%NC%]
:: call ..\Tests\test-pull.bat %TAG%
:: if %ERRORLEVEL% NEQ 0 (
::     echo [%RED%Pull tests failed. Aborting pull process.%NC%]
::     exit /b 1
:: )
exit /b 0