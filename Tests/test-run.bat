@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Testing run process...%NC%]

:: Test tag
set "TEST_TAG=VplzV3000"

:: Test run process
echo [%YELLOW%1. Testing container deployment...%NC%]
call ..\Pull ^& Run docker\run.bat %TEST_TAG%
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Deployment failed%NC%]
    exit /b 1
)

:: Verify containers are running
echo [%YELLOW%2. Verifying container status...%NC%]
for %%s in (frontend backend model-text-generation model-character-creation model-library-service mysql) do (
    docker ps --filter "name=demomo-%%s" --format "{{.Status}}" | findstr "Up" >nul
    if !ERRORLEVEL! NEQ 0 (
        echo [%RED%Container demomo-%%s is not running%NC%]
        exit /b 1
    )
)

:: Test service endpoints
echo [%YELLOW%3. Testing service endpoints...%NC%]
curl -f http://localhost:4200 >nul 2>&1 || (
    echo [%RED%Frontend endpoint not responding%NC%]
    exit /b 1
)
curl -f http://localhost:8000 >nul 2>&1 || (
    echo [%RED%Backend endpoint not responding%NC%]
    exit /b 1
)

echo [%GREEN%All run tests passed successfully!%NC%]
exit /b 0 