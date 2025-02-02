@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Testing pull process...%NC%]

:: Get tag name from command line argument
set "TAG=%~1"
if "%TAG%"=="" (
    echo [%RED%Error: Please provide a tag name%NC%]
    echo Usage: test-pull.bat tag-name
    exit /b 1
)

:: Test Docker Hub connectivity
echo [%YELLOW%1. Testing Docker Hub connectivity...%NC%]
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Docker is not running or not installed%NC%]
    exit /b 1
)

:: Function to test image availability
:testImage
set "SERVICE_NAME=%~1"
set "DOCKER_TAG=%~2"

echo [%YELLOW%Testing %SERVICE_NAME% availability...%NC%]
docker manifest inspect nuriz1996/demomo:%DOCKER_TAG%-%TAG% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Image nuriz1996/demomo:%DOCKER_TAG%-%TAG% not found in Docker Hub%NC%]
    exit /b 1
)
echo [%GREEN%Image nuriz1996/demomo:%DOCKER_TAG%-%TAG% is available%NC%]
goto :eof

:: Test if images exist in Docker Hub
echo [%YELLOW%2. Testing image availability in Docker Hub...%NC%]

:: Test each service image with proper registry path
call :testImage "Environment Service" nuriz1996/demomo:env-%TAG%
if %ERRORLEVEL% NEQ 0 exit /b 1

call :testImage "Frontend Service" nuriz1996/demomo:frontend-%TAG%
if %ERRORLEVEL% NEQ 0 exit /b 1

call :testImage "Backend Service" nuriz1996/demomo:backend-%TAG%
if %ERRORLEVEL% NEQ 0 exit /b 1

call :testImage "Text Generation Service" nuriz1996/demomo:text-gen-%TAG%
if %ERRORLEVEL% NEQ 0 exit /b 1

call :testImage "Character Creation Service" nuriz1996/demomo:char-create-%TAG%
if %ERRORLEVEL% NEQ 0 exit /b 1

call :testImage "Library Service" nuriz1996/demomo:library-%TAG%
if %ERRORLEVEL% NEQ 0 exit /b 1

call :testImage "MySQL Service" nuriz1996/demomo:mysql-%TAG%
if %ERRORLEVEL% NEQ 0 exit /b 1

echo [%GREEN%All images are available in Docker Hub%NC%]
echo [%GREEN%All pull tests passed successfully!%NC%]
exit /b 0 