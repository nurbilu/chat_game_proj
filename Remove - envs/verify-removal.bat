@echo off
echo Checking for specific .env files in Git history...

REM Check for specific commit IDs
echo Checking commit ec7d4a3...
git show ec7d4a3 --name-only | findstr /i "\.env$"

echo Checking commit e2a57e7...
git show e2a57e7 --name-only | findstr /i "\.env$"

echo Checking commit fba97aa...
git show fba97aa --name-only | findstr /i "\.env$"

echo Checking commit f0ac27b...
git show f0ac27b --name-only | findstr /i "\.env$"

echo.
echo Checking all .env files in history...
git log --all --full-history -- **/*.env
git log --all --full-history -- **/*.ENV

echo.
echo To remove these specific commits, run:
echo git filter-branch --force --index-filter "git rm --cached --ignore-unmatch */*.env" --prune-empty --tag-name-filter cat -- --all
echo.
echo After removal, force push with: git push origin --force --all
echo.
echo If no output appears above for a commit, that .env file has been removed from that commit. 