#!/bin/bash
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Environment Variables Volume${NC}"

# Create env-volume directory structure
mkdir -p ./env-volume/{current,backups,templates}

# Function to backup env files
backup_env_files() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="./env-volume/backups/${timestamp}"
    
    # Create backup directory
    mkdir -p "${backup_dir}"
    
    # Backup individual files with their original names
    if [ -f "docker/theENVdock/.ENV" ]; then
        cp "docker/theENVdock/.ENV" "${backup_dir}/docker_ENV"
    fi
    if [ -f "model/.env" ]; then
        cp "model/.env" "${backup_dir}/model_env"
    fi
    if [ -f "backend/.env" ]; then
        cp "backend/.env" "${backup_dir}/backend_env"
    fi

    # Create combined backup
    cat > "${backup_dir}/combined_env" << EOL
# Combined Environment Variables Backup - ${timestamp}
# ================================================

# Docker ENV
# ----------
$(cat "docker/theENVdock/.ENV" 2>/dev/null || echo "# No Docker ENV found")

# Model ENV
# ---------
$(cat "model/.env" 2>/dev/null || echo "# No Model ENV found")

# Backend ENV
# -----------
$(cat "backend/.env" 2>/dev/null || echo "# No Backend ENV found")
EOL

    echo -e "${GREEN}Backup created at: ${backup_dir}${NC}"
}

# Function to create/update env files
create_env_files() {
    # Create template for environment variables
    cat > "./env-volume/templates/env_template" << EOL
# Database Configuration
DB_NAME='dnd'
DB_USER='root'
DB_PASSWORD='MYSQLnur1996##'
DB_HOST='mysql'
DB_PORT='3306'

# API Keys
GEMINI_API_KEY1='AIzaSyCUzo93zAuhdp7mBL2DPVs9LgupQppezl4'

# MongoDB Configuration
MONGO_ATLAS='mongodb+srv://nurb1111:BILUmongdb1996@cluster0.luomlfx.mongodb.net/?authSource=147.235.199.101%2F32&authMechanism=SCRAM-SHA-1'
DB_NAME_MONGO='DnD_AI_DB'

# Django Configuration
SECRET_KEY='django-insecure-s&49kpnt!ms0^9xg!1h3zovejldw!h9cic#@3ozg@^nly!msz('
EOL

    # Create directories if they don't exist
    mkdir -p docker/theENVdock
    mkdir -p model
    mkdir -p backend

    # Copy template to current directory
    cp "./env-volume/templates/env_template" "./env-volume/current/.ENV"
    cp "./env-volume/templates/env_template" "./env-volume/current/model.env"
    cp "./env-volume/templates/env_template" "./env-volume/current/backend.env"

    # Create symlinks or copy files based on OS
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        # Windows - copy files
        cp "./env-volume/current/.ENV" "docker/theENVdock/.ENV"
        cp "./env-volume/current/model.env" "model/.env"
        cp "./env-volume/current/backend.env" "backend/.env"
    else
        # Unix-like - create symlinks
        ln -sf "$(pwd)/env-volume/current/.ENV" "docker/theENVdock/.ENV"
        ln -sf "$(pwd)/env-volume/current/model.env" "model/.env"
        ln -sf "$(pwd)/env-volume/current/backend.env" "backend/.env"
    fi
}

# Main execution
echo -e "${YELLOW}Backing up existing environment files...${NC}"
backup_env_files

echo -e "${YELLOW}Creating/updating environment files...${NC}"
create_env_files

echo -e "${GREEN}Environment setup completed successfully${NC}"
echo -e "${YELLOW}Environment files are stored in:${NC}"
echo -e "  - env-volume/current/ (master copies)"
echo -e "  - env-volume/backups/ (backup history)"
echo -e "  - env-volume/templates/ (templates)"
echo -e "\n${YELLOW}Active environment files are in:${NC}"
echo -e "  - docker/theENVdock/.ENV"
echo -e "  - model/.env"
echo -e "  - backend/.env" 