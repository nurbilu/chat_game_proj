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
    echo [%RED%Error: Please provide a tag name%NC%]
    echo Usage: push-compose.bat tag-name
    exit /b 1
)

echo [%YELLOW%Logging into Docker Hub...%NC%]
docker login

if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Login failed. Please try again.%NC%]
    exit /b 1
)

echo [%YELLOW%Pushing compose files to repository...%NC%]

:: Create a temporary directory
mkdir temp-compose
copy docker-compose.yml temp-compose\
copy model\init-mongo-pulled.sh temp-compose\

:: Create and push a new tag
git add temp-compose\*
git commit -m "Update compose files for tag %TAG%"
git tag compose-%TAG%
git push origin compose-%TAG%

:: Cleanup
rmdir /s /q temp-compose

echo [%GREEN%Compose files pushed successfully with tag: compose-%TAG%%NC%]
echo.
echo [%YELLOW%To use these services:%NC%]
echo [%GREEN%1. Pull the images:%NC%]
echo    pull-all-tags.bat %TAG%
echo.
echo [%GREEN%2. Run the services:%NC%]
echo    run-pulled-repo.bat %TAG%

exit /b 0