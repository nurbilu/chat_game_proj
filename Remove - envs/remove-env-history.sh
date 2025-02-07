#!/bin/bash

# Checkout to a new temporary branch
git checkout --orphan temp_branch

# Add all files to the new branch
git add -A

# Create a commit
git commit -m "Remove sensitive files from history"

# Delete the main branch
git branch -D main

# Rename temp branch to main
git branch -m main

# Force push to remote
git push -f origin main

# Clean up
git gc --aggressive --prune=all 