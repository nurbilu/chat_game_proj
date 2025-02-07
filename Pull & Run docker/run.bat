@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Starting multi-container deployment...%NC%]

:: Remove existing containers and networks
echo [%YELLOW%Cleaning up existing containers and networks...%NC%]
docker-compose down -v
docker network rm demomo-network 2>nul

<<<<<<< HEAD
:: Verify images exist locally
echo [%YELLOW%Verifying required images...%NC%]
for %%s in (env frontend backend text-gen char-create library mysql) do (
    docker image inspect nuriz1996/demomo:%%s-%TAG% >nul 2>&1
=======
:: Create network if it doesn't exist
echo [%YELLOW%Creating docker network...%NC%]
docker network create demomo-network || (
    echo [%RED%Failed to create network%NC%]
    exit /b 1
)

:: Initialize environment variables from existing files
echo [%YELLOW%Loading environment configuration...%NC%]
set "ENV_FILE=..\Build & Push docker\theENVdock\.ENV"

if not exist "%ENV_FILE%" (
    echo [%RED%Environment file not found at: %ENV_FILE%%NC%]
    echo [%RED%Please run init-env-volume.sh first%NC%]
    exit /b 1
)

:: Load and verify environment variables
for /f "usebackq tokens=1,* delims==" %%a in ("%ENV_FILE%") do (
    set "key=%%a"
    set "value=%%b"
    
    :: Remove quotes and spaces
    set "key=!key:'=!"
    set "key=!key: =!"
    set "value=!value:'=!"
    set "value=!value: =!"
    
    :: Set environment variable
    set "!key!=!value!"
)

:: Verify critical environment variables
call :verify_env DB_NAME || exit /b 1
call :verify_env DB_USER || exit /b 1
call :verify_env DB_PASSWORD || exit /b 1
call :verify_env MONGO_ATLAS || exit /b 1
call :verify_env DB_NAME_MONGO || exit /b 1
call :verify_env SECRET_KEY || exit /b 1
call :verify_env GEMINI_API_KEY1 || exit /b 1

:: Export variables for docker-compose
set "COMPOSE_ENV_FILE=%ENV_FILE%"

:: Initialize secrets if not already done
if not exist "secrets" (
    echo [%YELLOW%Initializing secrets...%NC%]
    call init-secrets.bat
>>>>>>> parent of 9663423 (test and might it the pull+run will work already lol)
    if !ERRORLEVEL! NEQ 0 (
        echo [%RED%Failed to initialize secrets%NC%]
        exit /b 1
    )
)

:: Initialize MongoDB Atlas connection
echo [%YELLOW%Initializing MongoDB Atlas connection...%NC%]
call ..\model\init-mongo.sh

<<<<<<< HEAD
:: Remove existing env container if it exists
echo [%YELLOW%Checking for existing environment container...%NC%]
docker rm -f demomo-env >nul 2>&1

:: Start env container first
echo [%YELLOW%Starting environment container...%NC%]
docker run -d --name demomo-env --network demomo-network nuriz1996/demomo:env-%TAG%
if !ERRORLEVEL! NEQ 0 (
    echo [%RED%Failed to start environment container%NC%]
    exit /b 1
)

:: Wait for env container to be ready
echo [%YELLOW%Waiting for environment container...%NC%]
timeout /t 5 /nobreak >nul

:: Copy environment from container
echo [%YELLOW%Loading environment from container...%NC%]
docker cp demomo-env:/app/env/.env .env
if !ERRORLEVEL! NEQ 0 (
    echo [%RED%Failed to load environment from container%NC%]
    exit /b 1
)

:: Set registry and tag for docker-compose
set "DEMOMO_REGISTRY=nuriz1996/demomo"
set "DEMOMO_TAG=%TAG%"

:: Start services with docker-compose
echo [%YELLOW%Starting remaining containers...%NC%]
docker-compose --env-file .env up -d

:: Check container health
echo [%YELLOW%Checking container health...%NC%] 
timeout /t 10 /nobreak >nul

:: Verify all containers are running
for %%s in (frontend backend model-text-generation model-character-creation model-library-service mysql) do (
    docker ps --filter "name=demomo-%%s" --format "{{.Status}}" | findstr "Up" >nul
    if !ERRORLEVEL! NEQ 0 (
        echo [%RED%Container demomo-%%s failed to start properly%NC%]
        exit /b 1
    )
)

echo [%GREEN%All containers started successfully!%NC%]

:: Clear instructions for stopping
echo [%YELLOW%Press 'q' and Enter to quit from Demo Web Site Docker and stop all containers%NC%]

:loop
set /p "input="
if /i "%input%"=="q" (
    :: Stop all containers with names starting with demomo-
    echo [%YELLOW%Stopping all containers...%NC%]
    for /f "tokens=*" %%c in ('docker ps --filter "name=demomo-" -q') do (
        echo Stopping container: %%c
        docker stop %%c
    )
    
    :: Wait for containers to stop
    timeout /t 5 /nobreak >nul
    
    :: Remove the environment file
    echo [%YELLOW%Removing environment file...%NC%]
    if exist ".env" (
        del /f /q ".env"
        echo [%GREEN%Environment file removed successfully%NC%]
    ) else (
        echo [%YELLOW%No environment file found to remove%NC%]
    )
    
    echo [%GREEN%All containers stopped and cleanup completed!%NC%]
    exit /b 0
)
goto :loop
=======
:: Check and handle MySQL port
echo [%YELLOW%Checking MySQL port availability...%NC%]
set "MYSQL_PORT=3306"
set "MAX_PORT=3316"

:check_port_loop
netstat -ano | find ":%MYSQL_PORT% " >nul
if %ERRORLEVEL% EQU 0 (
    if %MYSQL_PORT% LSS %MAX_PORT% (
        set /a MYSQL_PORT+=1
        goto check_port_loop
    ) else (
        echo [%RED%No available ports in range 3306-3316. Stopping all MySQL processes...%NC%]
        taskkill /F /IM mysqld.exe >nul 2>&1
        taskkill /F /IM mysql.exe >nul 2>&1
        timeout /t 5 /nobreak >nul
        set "MYSQL_PORT=3306"
    )
)

echo [%GREEN%Using MySQL port: %MYSQL_PORT%%NC%]
set "DB_PORT=%MYSQL_PORT%"

:: Start containers with environment file
docker-compose --env-file "%COMPOSE_ENV_FILE%" up -d

:: Wait for services to be healthy
echo [%YELLOW%Waiting for services to be healthy...%NC%]
:healthcheck_loop
set "all_healthy=true"
for /f "tokens=*" %%a in ('docker-compose ps --format "{{.Name}}"') do (
    docker inspect --format="{{.State.Health.Status}}" %%a 2>nul | findstr /i "healthy" >nul
    if %ERRORLEVEL% NEQ 0 (
        set "all_healthy=false"
    )
)
if "%all_healthy%"=="false" (
    echo [%YELLOW%Waiting for containers to be healthy...%NC%]
    timeout /t 5 /nobreak >nul
    goto healthcheck_loop
)

:: Check container status
echo [%YELLOW%Checking container status...%NC%]
docker-compose ps

echo [%GREEN%Multi-container deployment completed!%NC%]
echo [%YELLOW%Services are accessible at:%NC%]
echo [%YELLOW%Frontend: http://localhost:4200%NC%]
echo [%YELLOW%Backend: http://localhost:8000%NC%]
echo [%YELLOW%Model Services:%NC%]
echo [%YELLOW%- Text Generation: http://localhost:5000%NC%]
echo [%YELLOW%- Character Creation: http://localhost:6500%NC%]
echo [%YELLOW%- Library Service: http://localhost:7625%NC%]
echo [%YELLOW%MySQL Database: localhost:%DB_PORT%%NC%]
exit /b 0

:verify_env
if not defined %1 (
    echo [%RED%Error: %1 is not set in environment file%NC%]
    exit /b 1
)
echo [%GREEN%Verified: %1 is set%NC%]
exit /b 0
>>>>>>> parent of 9663423 (test and might it the pull+run will work already lol)
