#!/bin/bash
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing MongoDB Shell...${NC}"

# Install gnupg and curl if not present
apt-get update && apt-get install -y gnupg curl

# Add MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
   --dearmor

# Add MongoDB repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg] http://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | \
   tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install mongosh
apt-get update && apt-get install -y mongodb-mongosh

echo -e "${YELLOW}MongoDB Atlas Connection Setup${NC}"

# Source environment variables
if [ -f /app/.env ]; then
    source /app/.env
else
    echo -e "${RED}Error: .env file not found in /app/.env${NC}"
    exit 1
fi

# Function to URL encode string
urlencode() {
    local string="${1}"
    local strlen=${#string}
    local encoded=""
    local pos c o

    for (( pos=0 ; pos<strlen ; pos++ )); do
        c=${string:$pos:1}
        case "$c" in
            [-_.~a-zA-Z0-9] ) o="${c}" ;;
            * )               printf -v o '%%%02x' "'$c"
        esac
        encoded+="${o}"
    done
    echo "${encoded}"
}

# Extract and encode credentials from MONGO_ATLAS
MONGO_URI="${MONGO_ATLAS}"
echo -e "${YELLOW}Connecting to MongoDB Atlas...${NC}"

# Test connection
echo -e "${YELLOW}Testing connection...${NC}"
if mongosh "${MONGO_URI}" --eval "db.adminCommand('ping')" > /dev/null; then
    echo -e "${GREEN}Successfully connected to MongoDB Atlas${NC}"
    
    # Initialize database
    echo -e "${YELLOW}Initializing database...${NC}"
    mongosh "${MONGO_URI}" --eval "
        db = db.getSiblingDB('${DB_NAME_MONGO}');
        
        // Create application user if doesn't exist
        if (!db.getUser('${DB_NAME_MONGO}_user')) {
            db.createUser({
                user: '${DB_NAME_MONGO}_user',
                pwd: 'admin123',
                roles: ['readWrite']
            });
        }

        // Create collections if they don't exist
        db.createCollection('characters');
        db.createCollection('games');
        db.createCollection('chat_history');
        
        // Print database info
        print('Database initialized with collections:');
        db.getCollectionNames().forEach(function(collection) {
            print(' - ' + collection + ': ' + db[collection].countDocuments() + ' documents');
        });
    "
    
    echo -e "${GREEN}MongoDB initialization completed successfully${NC}"
else
    echo -e "${RED}Failed to connect to MongoDB Atlas${NC}"
    exit 1
fi