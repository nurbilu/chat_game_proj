#!/bin/bash
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}MongoDB Atlas Connection Setup${NC}"

# Function to check if mongosh is installed
check_mongosh() {
    if ! command -v mongosh &> /dev/null; then
        echo -e "${RED}MongoDB Shell (mongosh) is not installed.${NC}"
        echo -e "${YELLOW}Installing MongoDB Shell...${NC}"
        
        # Install MongoDB Shell based on OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
            gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
            --dearmor
            echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg] http://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | \
            tee /etc/apt/sources.list.d/mongodb-org-6.0.list
            apt-get update && apt-get install -y mongodb-mongosh
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install mongosh
        elif [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "win32" ]]; then
            echo -e "${YELLOW}Please install MongoDB Shell manually on Windows${NC}"
            echo -e "${YELLOW}Download from: https://www.mongodb.com/try/download/shell${NC}"
            exit 1
        fi
    fi
}

# Main execution
main() {
    # Check and install mongosh if needed
    check_mongosh

    # Load environment variables
    if [ -f model/.env ]; then
        export $(cat model/.env | grep -v '^#' | xargs)
    else
        echo -e "${RED}Error: .env file not found in model/.env${NC}"
        exit 1
    fi

    # Initialize database
    echo -e "${YELLOW}Initializing database...${NC}"
    mongosh "$MONGO_ATLAS" --eval "
        db = db.getSiblingDB('${DB_NAME_MONGO}');
        
        // Create collections if they don't exist
        db.createCollection('characters');
        db.createCollection('games');
        db.createCollection('chat_history');
        db.createCollection('library');
        
        // Create indexes for better performance
        db.characters.createIndex({ 'user_id': 1 });
        db.games.createIndex({ 'game_id': 1 });
        db.chat_history.createIndex({ 'session_id': 1 });
        db.library.createIndex({ 'document_id': 1 });
        
        // Verify collections
        print('Collections in database:');
        db.getCollectionNames().forEach(function(collection) {
            print(' - ' + collection + ': ' + db[collection].countDocuments() + ' documents');
        });
    "

    echo -e "${GREEN}MongoDB initialization completed successfully${NC}"
}

# Execute main function
main 