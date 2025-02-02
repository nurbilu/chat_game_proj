@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Loading environment configuration...%NC%]

:: Check for environment source
if exist "..\Build & Push docker\theENVdock\.ENV" (
    set "ENV_SOURCE=..\Build & Push docker\theENVdock\.ENV"
) else if exist "..\model\.env" (
    set "ENV_SOURCE=..\model\.env"
) else if exist "..\backend\.env" (
    set "ENV_SOURCE=..\backend\.env"
) else (
    echo [%RED%No environment file found. Please run init-env-volume.sh first%NC%]
    exit /b 1
)

:: Create secrets directory if it doesn't exist
if not exist "secrets" mkdir secrets

:: Remove existing secrets
echo [%YELLOW%Removing existing secrets...%NC%]
docker secret rm db_password django_secret mongo_uri gemini_key >nul 2>&1

:: Create new secrets from environment file
echo [%YELLOW%Creating new secrets from %ENV_SOURCE%...%NC%]
for /f "usebackq tokens=1,* delims==" %%a in ("%ENV_SOURCE%") do (
    set "key=%%a"
    set "value=%%b"
    
    :: Remove quotes and spaces
    set "key=!key:'=!"
    set "key=!key: =!"
    set "value=!value:'=!"
    set "value=!value: =!"
    
    :: Create secrets
    if "!key!"=="DB_PASSWORD" (
        echo !value!> secrets\db_password.txt
        echo !value!| docker secret create db_password - >nul
    ) else if "!key!"=="SECRET_KEY" (
        echo !value!> secrets\django_secret.txt
        echo !value!| docker secret create django_secret - >nul
    ) else if "!key!"=="MONGO_ATLAS" (
        echo !value!> secrets\mongo_uri.txt
        echo !value!| docker secret create mongo_uri - >nul
    ) else if "!key!"=="GEMINI_API_KEY1" (
        echo !value!> secrets\gemini_key.txt
        echo !value!| docker secret create gemini_key - >nul
    )
)

if %ERRORLEVEL% EQU 0 (
    echo [%GREEN%Secrets initialized successfully%NC%]
    exit /b 0
) else (
    echo [%RED%Failed to create secrets%NC%]
    exit /b 1
)

:: Load from .env file if it exists
if exist "..\backend\myproj\.env" (
    for /f "tokens=*" %%a in (..\backend\myproj\.env) do (
        set "%%a"
    )
)

:: Set default values if not set
if not defined DB_NAME set DB_NAME=dnd
if not defined DB_USER set DB_USER=root
if not defined DB_PASSWORD set DB_PASSWORD=MYSQLnur1996##
if not defined DB_HOST set DB_HOST=mysql
if not defined DB_PORT set DB_PORT=3306

:: Export variables
set

endlocal & (
    set "DB_NAME=%DB_NAME%"
    set "DB_USER=%DB_USER%"
    set "DB_PASSWORD=%DB_PASSWORD%"
    set "DB_HOST=%DB_HOST%"
    set "DB_PORT=%DB_PORT%"
    set "MONGO_ATLAS=%MONGO_ATLAS%"
    set "DB_NAME_MONGO=%DB_NAME_MONGO%"
    set "SECRET_KEY=%SECRET_KEY%"
    set "GEMINI_API_KEY1=%GEMINI_API_KEY1%"
)

:: Database Configuration
set DB_NAME=dnd
set DB_USER=root
set DB_PASSWORD=MYSQLnur1996##
set DB_HOST=mysql
set DB_PORT=3306

:: API Keys
set GEMINI_API_KEY1="AIzaSyCUzo93zAuhdp7mBL2DPVs9LgupQppezl4"
set SECRET_KEY="django-insecure-s&49kpnt!ms0^9xg!1h3zovejldw!h9cic#@3ozg@^nly!msz("

:: MongoDB Configuration
set MONGO_ATLAS="mongodb+srv://nurb1111:BILUmongdb1996@cluster0.luomlfx.mongodb.net/?authSource=147.235.199.101%%2F32&authMechanism=SCRAM-SHA-1"
set DB_NAME_MONGO="DnD_AI_DB"

:: Email Configuration
