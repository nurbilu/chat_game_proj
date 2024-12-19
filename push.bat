@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

:: Get tag from command line or use 'latest' as default
set "TAG=%1"
if "%TAG%"=="" set "TAG=latest"

echo [%YELLOW%Pushing DeMe images to Docker Hub with tag: %TAG%...%NC%]

:: Login to Docker Hub
echo [%YELLOW%Please login to Docker Hub:%NC%]
docker login
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Failed%NC%] Docker Hub login failed
    exit /b 1
)

:: Tag and push images
for %%s in (frontend backend model mysql mongodb) do (
    echo [%YELLOW%Processing %%s...%NC%]
    
    :: Only tag if not using 'latest'
    if not "%TAG%"=="latest" (
        docker tag demomo/%%s:latest demomo/%%s:%TAG%
        if %ERRORLEVEL% NEQ 0 (
            echo [%RED%Failed%NC%] Tagging %%s failed
            exit /b 1
        )
    )
    
    docker push demomo/%%s:%TAG%
    if %ERRORLEVEL% NEQ 0 (
        echo [%RED%Failed%NC%] Pushing %%s failed
        exit /b 1
    )
    echo [%GREEN%Success%NC%] %%s pushed to Docker Hub
)

echo [%GREEN%All images pushed successfully to demomo repository%NC%]
exit /b 0 