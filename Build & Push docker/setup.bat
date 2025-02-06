@echo off
setlocal EnableDelayedExpansion

set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

echo [%YELLOW%Setting up deployment configuration...%NC%]

if exist "deploy-config.bat" (
    echo [%YELLOW%deploy-config.bat already exists. Skipping...%NC%]
) else (

    copy "deploy-config.template.bat" "deploy-config.bat" >nul
    if %ERRORLEVEL% EQU 0 (
        echo [%GREEN%Successfully created deploy-config.bat%NC%]
    ) else (
        echo [%RED%Failed to create deploy-config.bat%NC%]
        exit /b 1
    )
)

echo [%GREEN%Setup complete! You can now run build.bat and push.bat%NC%]
exit /b 0 