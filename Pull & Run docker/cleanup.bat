@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Starting complete Docker cleanup...%NC%]

:: Stop all running containers
echo [%YELLOW%Stopping all running containers...%NC%]
for /f "tokens=*" %%c in ('docker ps -q') do (
    docker stop %%c
)

:: Remove all containers
echo [%YELLOW%Removing all containers...%NC%]
for /f "tokens=*" %%c in ('docker ps -aq') do (
    docker rm -f %%c
)

:: Remove all images
echo [%YELLOW%Removing all images...%NC%]
for /f "tokens=*" %%i in ('docker images -q') do (
    docker rmi -f %%i
)

:: Remove all volumes
echo [%YELLOW%Removing all volumes...%NC%]
for /f "tokens=*" %%v in ('docker volume ls -q') do (
    docker volume rm -f %%v
)

:: Remove all networks except default ones
echo [%YELLOW%Removing all custom networks...%NC%]
for /f "tokens=*" %%n in ('docker network ls --filter "type=custom" -q') do (
    docker network rm %%n
)

:: Clean up system
echo [%YELLOW%Performing deep system cleanup...%NC%]
docker system prune -af --volumes

:: Remove build cache
echo [%YELLOW%Removing build cache...%NC%]
docker builder prune -af

:: Remove environment files
echo [%YELLOW%Removing environment files...%NC%]
if exist ".env" del /f /q ".env"
if exist ".env.backup" del /f /q ".env.backup"

:: Verify cleanup
echo [%YELLOW%Verifying cleanup...%NC%]
docker ps -a
docker images
docker volume ls
docker network ls

echo [%GREEN%Complete Docker cleanup finished!%NC%]
echo [%YELLOW%System is now clean and ready for fresh deployment%NC%]
exit /b 0 