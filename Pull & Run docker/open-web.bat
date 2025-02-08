@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Opening DeMoMo Web-Site in your default browser...%NC%]

:: Check if the container is running first
docker ps --filter "name=demomo-frontend" --format "{{.Status}}" | findstr "Up" >nul
if !ERRORLEVEL! NEQ 0 (
    echo [%RED%Error: Frontend container is not running!%NC%]
    echo [%YELLOW%Please ensure all containers are running first.%NC%]
    exit /b 1
)

:: Open the website in the default browser
start http://localhost:4200/homepage

if !ERRORLEVEL! EQU 0 (
    echo [%GREEN%Successfully opened DeMoMo Web-Site!%NC%]
) else (
    echo [%RED%Failed to open the website. Please try opening it manually in your browser.%NC%]
)

exit /b 0 