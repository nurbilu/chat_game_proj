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
    set "TAG=go"
)

echo [%YELLOW%Pulling all services from nuriz1996/demomo with tag: %TAG%...%NC%]

:: Pull individual tags
docker pull nuriz1996/demomo:frontend-%TAG%
docker pull nuriz1996/demomo:backend-%TAG%
docker pull nuriz1996/demomo:text-gen-%TAG%
docker pull nuriz1996/demomo:char-create-%TAG%
docker pull nuriz1996/demomo:library-%TAG%

if %ERRORLEVEL% EQU 0 (
    echo [%GREEN%Successfully pulled all services from Docker Hub%NC%]
) else (
    echo [%RED%Failed to pull one or more services%NC%]
    exit /b 1
)

echo [%GREEN%All services have been pulled successfully%NC%]
echo [%YELLOW%Available services:%NC%]
echo   - nuriz1996/demomo:frontend-%TAG%
echo   - nuriz1996/demomo:backend-%TAG%
echo   - nuriz1996/demomo:text-gen-%TAG%
echo   - nuriz1996/demomo:char-create-%TAG%
echo   - nuriz1996/demomo:library-%TAG%
echo.
echo [%YELLOW%Service Architecture:%NC%]
echo Frontend (User Interface):
echo   - Port: 4200
echo.
echo Backend Services:
echo   - Main Backend API: 8000
echo   - Model Services:
echo     * Text Generation: 5000
echo     * Character Creation: 6500
echo     * Library Service: 7625
exit /b 0 