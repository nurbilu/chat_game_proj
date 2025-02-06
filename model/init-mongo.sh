#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' 

echo -e "${YELLOW}MongoDB Atlas Connection Setup${NC}"

check_mongosh() {

    if ! command -v mongosh &> /dev/null; then
        echo -e "${RED}MongoDB Shell (mongosh) is not installed.${NC}"

        echo -e "${YELLOW}Installing MongoDB Shell...${NC}"
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            wget -qO - https://www.mongodb.org/static/pgp/server-8.0.asc | \
            gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/mongodb-8.0.gpg > /dev/null

            echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/8.0 multiverse" | \
            sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
            sudo apt-get update
            sudo apt-get install -y mongodb-mongosh
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install mongosh
        fi
    fi
}


test_atlas_connection() {
    local uri=$1
    echo -e "${YELLOW}Testing MongoDB Atlas connection...${NC}"

    
    if mongosh "$uri" --eval "db.adminCommand('ping')" &>/dev/null; then
        echo -e "${GREEN}Successfully connected to MongoDB Atlas${NC}"
        return 0
    else
        echo -e "${RED}Failed to connect to MongoDB Atlas${NC}"
        return 1
    fi
}

main() {
    check_mongosh



    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    else

        echo -e "${RED}Error: .env file not found${NC}"
        exit 1
    fi

    if ! test_atlas_connection "$MONGO_ATLAS"; then
        echo -e "${RED}Connection test failed. Please check your credentials and network connection.${NC}"
        exit 1

    fi

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
            print(collection + ': ' + db[collection].countDocuments() + ' documents');
        });
    "

    echo -e "${GREEN}MongoDB initialization completed successfully${NC}"
}

main