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
    echo [%RED%Error: Please provide a tag name%NC%]
    echo Usage: push.bat tag-name
    exit /b 1
)

:: Check if deploy-config.bat exists
if not exist "deploy-config.bat" (
    echo [%RED%Error: deploy-config.bat not found%NC%]
    echo Please copy deploy-config.template.bat to deploy-config.bat and set your password
    exit /b 1
)

:: Load deployment configuration
call deploy-config.bat

:: Password Protection
set /p "INPUT_PASSWORD=Enter deployment password: "
if not "%INPUT_PASSWORD%"=="%DEPLOY_PASSWORD%" (
    echo [%RED%Error: Invalid deployment password%NC%]
    exit /b 1
)

:: Create temporary env file for docker builds
echo [%YELLOW%Creating environment configuration for builds...%NC%]
if not exist "theENVdock" mkdir "theENVdock"
copy "env-config.bat" "theENVdock\.ENV" >nul 2>&1
if not exist "theENVdock\.ENV" (
    echo [%RED%Error: Could not copy environment file%NC%]
    exit /b 1
)

echo [%YELLOW%Logging into Docker Hub...%NC%]
docker login
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Login failed. Please try again.%NC%]
    exit /b 1
)

:: Verify local images exist before pushing
echo [%YELLOW%Verifying local images...%NC%]
for %%s in (env frontend backend model-text-generation model-character-creation model-library-service) do (
    docker image inspect demomo/%%s:latest >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        echo [%RED%Image demomo/%%s:latest not found locally%NC%]
        exit /b 1
    )
)

echo [%YELLOW%Tagging and pushing services with tag: %TAG%%NC%]

:: Tag and push services
for %%s in (env frontend backend) do (
    echo [%YELLOW%Processing %%s...%NC%]
    docker tag demomo/%%s:latest %DOCKER_REGISTRY%/demomo:%%s-%TAG%
    docker push %DOCKER_REGISTRY%/demomo:%%s-%TAG%
    if !ERRORLEVEL! NEQ 0 (
        echo [%RED%Failed to push %%s%NC%]
        exit /b 1
    )
)

:: Tag and push model services
docker tag demomo/model-text-generation:latest %DOCKER_REGISTRY%/demomo:text-gen-%TAG%
docker push %DOCKER_REGISTRY%/demomo:text-gen-%TAG%
docker tag demomo/model-character-creation:latest %DOCKER_REGISTRY%/demomo:char-create-%TAG%
docker push %DOCKER_REGISTRY%/demomo:char-create-%TAG%
docker tag demomo/model-library-service:latest %DOCKER_REGISTRY%/demomo:library-%TAG%
docker push %DOCKER_REGISTRY%/demomo:library-%TAG%

:: Tag and push MySQL
docker tag mysql:8.0 %DOCKER_REGISTRY%/demomo:mysql-%TAG%
docker push %DOCKER_REGISTRY%/demomo:mysql-%TAG%

echo [%GREEN%All services have been pushed to %DOCKER_REGISTRY%/demomo with tag: %TAG%%NC%]
echo [%YELLOW%Available services:%NC%]
echo   - %DOCKER_REGISTRY%/demomo:env-%TAG%
echo   - %DOCKER_REGISTRY%/demomo:frontend-%TAG%
echo   - %DOCKER_REGISTRY%/demomo:backend-%TAG%
echo   - %DOCKER_REGISTRY%/demomo:text-gen-%TAG%
echo   - %DOCKER_REGISTRY%/demomo:char-create-%TAG%
echo   - %DOCKER_REGISTRY%/demomo:library-%TAG%
echo   - %DOCKER_REGISTRY%/demomo:mysql-%TAG%

:: Cleanup
del /f /q "theENVdock\.ENV" >nul 2>&1

exit /b 0