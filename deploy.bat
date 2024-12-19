@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

:: Build
call build.bat
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Build failed%NC%]
    exit /b 1
)

:: Run
call run.bat
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Run failed%NC%]
    exit /b 1
)

:: Push if requested
if "%1"=="--push" (
    call push.bat
    if %ERRORLEVEL% NEQ 0 (
        echo [%RED%Push failed%NC%]
        exit /b 1
    )
)

echo [%GREEN%Deployment complete!%NC%]
exit /b 0