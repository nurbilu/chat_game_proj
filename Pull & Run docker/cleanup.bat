@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Cleaning up containers and images...%NC%]

:: Stop all running containers first
echo [%YELLOW%Stopping all running containers...%NC%]
docker stop $(docker ps -a -q)

:: Stop and remove containers using docker-compose
echo [%YELLOW%Stopping docker-compose services...%NC%]
docker-compose -f ..\docker-compose.yml down

:: Remove containers
echo [%YELLOW%Removing containers...%NC%]
docker rm -f $(docker ps -a -q) 2>nul

:: Remove old images
echo [%YELLOW%Removing images...%NC%]
for /f "tokens=*" %%i in ('docker images -q') do docker rmi -f %%i 2>nul

:: Remove volumes
echo [%YELLOW%Removing volumes...%NC%]
for /f "tokens=*" %%i in ('docker volume ls -q') do docker volume rm -f %%i 2>nul

:: Remove build records
echo [%YELLOW%Cleaning build cache...%NC%]
docker builder prune -f

:: Clean up system
echo [%YELLOW%Performing system cleanup...%NC%]
docker system prune -f
docker container prune -f
docker image prune -f
docker volume prune -f
docker network prune -f

echo [%GREEN%Cleanup completed%NC%] 