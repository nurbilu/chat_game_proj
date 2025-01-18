@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

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
    echo [%RED%Invalid password. Deployment aborted.%NC%]
    exit /b 1
)

:: Get tag name from command line argument
set "TAG=%1"
if "%TAG%"=="" (
    echo [%RED%Error: Please provide a tag name%NC%]
    echo Usage: push.bat tag-name
    exit /b 1
)

echo [%YELLOW%Logging into Docker Hub...%NC%]
docker login

if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Login failed. Please try again.%NC%]
    exit /b 1
)

echo [%YELLOW%Tagging and pushing services with tag: %TAG%%NC%]

:: Tag services with provided tag
docker tag demomo/frontend:latest nuriz1996/demomo:frontend-%TAG%
docker tag demomo/backend:latest nuriz1996/demomo:backend-%TAG%
docker tag demomo/model-text-generation:latest nuriz1996/demomo:text-gen-%TAG%
docker tag demomo/model-character-creation:latest nuriz1996/demomo:char-create-%TAG%
docker tag demomo/model-library-service:latest nuriz1996/demomo:library-%TAG%
docker tag mysql:8.0 nuriz1996/demomo:mysql-%TAG%

:: Push individual tags
docker push nuriz1996/demomo:frontend-%TAG%
docker push nuriz1996/demomo:backend-%TAG%
docker push nuriz1996/demomo:text-gen-%TAG%
docker push nuriz1996/demomo:char-create-%TAG%
docker push nuriz1996/demomo:library-%TAG%
docker push nuriz1996/demomo:mysql-%TAG%

if %ERRORLEVEL% EQU 0 (
    echo [%GREEN%Successfully pushed all services to Docker Hub%NC%]
) else (
    echo [%RED%Failed to push one or more services%NC%]
    exit /b 1
)

echo [%GREEN%All services have been pushed to nuriz1996/demomo with tag: %TAG%%NC%]
echo [%YELLOW%Available services:%NC%]
echo   - nuriz1996/demomo:frontend-%TAG%
echo   - nuriz1996/demomo:backend-%TAG%
echo   - nuriz1996/demomo:text-gen-%TAG%
echo   - nuriz1996/demomo:char-create-%TAG%
echo   - nuriz1996/demomo:library-%TAG%
echo   - nuriz1996/demomo:mysql-%TAG%
exit /b 0