@echo off
setlocal EnableDelayedExpansion

set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

<<<<<<< HEAD

echo [%YELLOW%Running build tests...%NC%]
call ..\Tests\test-build.bat

if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Build tests failed. Aborting build process.%NC%]
    exit /b 1
)

=======
:: Check if deploy-config.bat exists
>>>>>>> parent of 9663423 (test and might it the pull+run will work already lol)
if not exist "deploy-config.bat" (
    echo [%RED%Error: deploy-config.bat not found%NC%]

    echo Please copy deploy-config.template.bat to deploy-config.bat and set your password
    exit /b 1
)

call deploy-config.bat


set /p "INPUT_PASSWORD=Enter deployment password: "

if not "%INPUT_PASSWORD%"=="%DEPLOY_PASSWORD%" (
    echo [%RED%Invalid password. Build aborted.%NC%]
    exit /b 1
)

echo [%YELLOW%Starting complete build process...%NC%]

<<<<<<< HEAD
echo [%YELLOW%Building Environment Image...%NC%]
cd ..\env-docker
call env-docker.bat

if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Environment image build failed%NC%]
    cd ..\Build ^& Push docker
    exit /b 1
)
cd "..\Build & Push docker"

=======
:: Build Backend and Model frameworks
>>>>>>> parent of 9663423 (test and might it the pull+run will work already lol)
echo [%YELLOW%Building Backend framework...%NC%]
call TheBuilds\build-Dj-back.bat

if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Backend framework build failed%NC%]
    exit /b 1
)

echo [%YELLOW%Building Model framework...%NC%]
call TheBuilds\build-model.bat
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Model framework build failed%NC%]
    exit /b 1
)

echo [%YELLOW%Building frontend...%NC%]
call TheBuilds\build-frontend.bat

if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Frontend build failed%NC%]
    exit /b 1
)

echo [%YELLOW%Pulling MySQL image...%NC%]
docker pull mysql:8.0

if %ERRORLEVEL% NEQ 0 (
    echo [%RED%MySQL image pull failed%NC%]
    exit /b 1
)

docker-compose build

echo [%GREEN%All builds completed successfully!%NC%]
exit /b 0 