@echo off

REM Checkout to a new temporary branch
git checkout --orphan temp_branch

REM Add all files to the new branch
git add -A

REM Create a commit
git commit -m "Remove sensitive files from history"

REM Delete the main branch
git branch -D main

REM Rename temp branch to main
git branch -m main

REM Force push to remote
git push -f origin main

REM Clean up
git gc --aggressive --prune=all 