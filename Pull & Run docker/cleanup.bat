@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Cleaning up containers and images...%NC%]

:: Stop and remove containers
docker-compose -f docker-compose.yml down

:: Remove old images
for /f "tokens=*" %%i in ('docker images -q') do docker rmi -f %%i

:: Remove volumes
for /f "tokens=*" %%i in ('docker volume ls -q') do docker volume rm -f %%i

:: Remove builds records
for /f "tokens=*" %%i in ('docker builder ls --format "{{.Name}}"') do docker builder rm -f %%i

:: Remove build containers and images remove all docker objects : 
docker builder prune -a -f  
docker system prune -a -f
docker container prune -a -f
docker image prune -a -f
docker volume prune -a -f
docker network prune -a -f
docker system prune -a -f


echo [%GREEN%Cleanup completed%NC%] 