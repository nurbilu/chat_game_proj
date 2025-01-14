@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Building Model services...%NC%]

:: Build Text Generation Service
echo [%YELLOW%Building Text Generation Service...%NC%]
docker build -t demomo/model-text-generation:latest -f model/text-generation.Dockerfile ./model
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Text Generation Service build failed%NC%]
    exit /b 1
)

:: Build Character Creation Service
echo [%YELLOW%Building Character Creation Service...%NC%]
docker build -t demomo/model-character-creation:latest -f model/character-creation.Dockerfile ./model
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Character Creation Service build failed%NC%]
    exit /b 1
)

:: Build Library Service
echo [%YELLOW%Building Library Service...%NC%]
docker build -t demomo/model-library-service:latest -f model/library-service.Dockerfile ./model
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Library Service build failed%NC%]
    exit /b 1
)

echo [%GREEN%All Model services built successfully%NC%]
exit /b 0 