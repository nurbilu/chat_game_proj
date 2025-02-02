@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Testing push process...%NC%]

:: Get tag name from command line argument
set "TAG=%~1"
if "%TAG%"=="" (
    echo [%RED%Error: Please provide a tag name%NC%]
    echo Usage: test-push.bat tag-name
    exit /b 1
)

:: Test Docker login status
echo [%YELLOW%1. Testing Docker Hub connectivity...%NC%]
docker info | findstr "Username:" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Not logged into Docker Hub%NC%]
    exit /b 1
)

:: Test if required images exist locally
echo [%YELLOW%2. Verifying local images...%NC%]
for %%s in (env frontend backend model-text-generation model-character-creation model-library-service) do (
    docker image inspect demomo/%%s:latest >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        echo [%RED%Image demomo/%%s:latest not found locally%NC%]
        exit /b 1
    )
)

:: Test if deploy-config.bat exists and contains required variables
echo [%YELLOW%3. Testing deployment configuration...%NC%]
if not exist "..\Build & Push docker\deploy-config.bat" (
    echo [%RED%deploy-config.bat not found%NC%]
    exit /b 1
)

:: Source deploy-config.bat and test DOCKER_REGISTRY
call "..\Build & Push docker\deploy-config.bat"
if "%DOCKER_REGISTRY%"=="" (
    echo [%RED%DOCKER_REGISTRY not set in deploy-config.bat%NC%]
    exit /b 1
)

:: Test if we have write access to the registry
echo [%YELLOW%4. Testing registry write access...%NC%]
docker pull hello-world:latest >nul 2>&1
docker tag hello-world:latest %DOCKER_REGISTRY%/test-push:latest >nul 2>&1
docker push %DOCKER_REGISTRY%/test-push:latest >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%No write access to Docker registry%NC%]
    exit /b 1
)
docker rmi %DOCKER_REGISTRY%/test-push:latest >nul 2>&1
docker rmi hello-world:latest >nul 2>&1

echo [%GREEN%All push prerequisites verified successfully!%NC%]
exit /b 0 