@echo off
setlocal EnableDelayedExpansion

:: Colors
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Starting comprehensive testing suite...%NC%]

:: Get tag name from command line argument
set "TAG=%~1"
if "%TAG%"=="" (
    echo [%RED%Error: Please provide a tag name%NC%]
    echo Usage: test-master.bat tag-name
    exit /b 1
)

:: Run all tests in sequence
echo [%YELLOW%1. Running build tests...%NC%]
call "..\Tests\test-build.bat"
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Build tests failed! Aborting process.%NC%]
    exit /b 1
)
echo [%GREEN%Build tests passed successfully!%NC%]

echo [%YELLOW%2. Running push tests...%NC%]
call "..\Tests\test-push.bat" %TAG%
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Push tests failed! Aborting process.%NC%]
    exit /b 1
)
echo [%GREEN%Push tests passed successfully!%NC%]

echo [%YELLOW%3. Running pull tests...%NC%]
call "..\Tests\test-pull.bat" %TAG%
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Pull tests failed! Aborting process.%NC%]
    exit /b 1
)
echo [%GREEN%Pull tests passed successfully!%NC%]

echo [%YELLOW%4. Running deployment tests...%NC%]
call "..\Tests\test-run.bat" %TAG%
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Deployment tests failed! Aborting process.%NC%]
    exit /b 1
)
echo [%GREEN%Deployment tests passed successfully!%NC%]

:: If all tests pass, proceed with actual deployment
echo [%GREEN%All tests passed! Proceeding with deployment...%NC%]

:: Execute actual deployment process
echo [%YELLOW%Starting deployment process...%NC%]

echo [%YELLOW%1. Building images...%NC%]
call "..\Build & Push docker\build.bat"
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Build process failed%NC%]
    exit /b 1
)

echo [%YELLOW%2. Pushing images...%NC%]
call "..\Build & Push docker\push.bat" %TAG%
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Push process failed%NC%]
    exit /b 1
)

echo [%YELLOW%3. Pulling images...%NC%]
call "..\Pull & Run docker\pull.bat" %TAG%
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Pull process failed%NC%]
    exit /b 1
)

echo [%YELLOW%4. Deploying containers...%NC%]
call "..\Pull & Run docker\run.bat" %TAG%
if %ERRORLEVEL% NEQ 0 (
    echo [%RED%Deployment failed%NC%]
    exit /b 1
)

echo [%GREEN%Complete deployment process finished successfully!%NC%]
exit /b 0 