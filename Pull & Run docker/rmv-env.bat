@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Starting environment cleanup...%NC%]

:: Check if environment file exists and remove it
if exist ".env" (
    del /f /q ".env"
    if !ERRORLEVEL! EQU 0 (
        echo [%GREEN%Successfully removed .env file%NC%]
    ) else (
        echo [%RED%Failed to remove .env file%NC%]
        exit /b 1
    )
) else (
    echo [%YELLOW%No .env file found%NC%]
)

:: Check if backup exists and remove it
if exist ".env.backup" (
    del /f /q ".env.backup"
    if !ERRORLEVEL! EQU 0 (
        echo [%GREEN%Successfully removed .env.backup file%NC%]
    ) else (
        echo [%RED%Failed to remove .env.backup file%NC%]
        exit /b 1
    )
)

echo [%GREEN%Environment cleanup completed successfully!%NC%]
exit /b 0