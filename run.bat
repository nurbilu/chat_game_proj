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

:: Create network if it doesn't exist
echo [%YELLOW%Creating docker network...%NC%]
docker network create demomo-network

:: Initialize MongoDB Atlas connection
echo [%YELLOW%Initializing MongoDB Atlas connection...%NC%]
call model\init-mongo.sh

:: Start all containers using docker-compose
echo [%YELLOW%Starting all services with docker-compose...%NC%]
docker-compose up -d

:: Wait for services to be ready
timeout /t 15 /nobreak

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
echo [%YELLOW%MySQL Database: localhost:3306%NC%]
exit /b 0