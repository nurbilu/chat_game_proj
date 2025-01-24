FROM ubuntu:20.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Python 3.9 and system dependencies
RUN apt-get update && apt-get install -y \
    python3.9 \
    python3.9-dev \
    python3-pip \
    pkg-config \
    build-essential \
    curl \
    gpg \
    wget \
    gnupg \
    apt-transport-https \
    && rm -rf /var/lib/apt/lists/*

# Install MongoDB Shell
RUN wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | \
    gpg --dearmor | \
    tee /usr/share/keyrings/mongodb-server-6.0.gpg > /dev/null && \
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | \
    tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update && \
    apt-get install -y mongodb-mongosh && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/logs /app/data

# Copy initialization scripts
COPY init-mongo.sh /app/
COPY init-mongo-cli.sh /app/
RUN chmod +x /app/init-mongo.sh /app/init-mongo-cli.sh

# Copy .env file
COPY .env /app/.env

# Create MongoDB initialization verification file
RUN touch /app/data/.mongodb_initialized

# Upgrade pip and install pymongo with dependencies
RUN python3.9 -m pip install --upgrade pip && \
    python3.9 -m pip install --no-cache-dir "pymongo[srv]>=4.6.0,<4.7.0" && \
    python3.9 -m pip install --no-cache-dir "dnspython>=2.4.0" && \
    python3.9 -m pip install --no-cache-dir "python-dotenv>=1.0.0" && \
    python3.9 -m pip install --no-cache-dir "gunicorn>=21.2.0"

# Copy requirements and install other dependencies
COPY requirements.txt .
RUN grep -v "pymongo" requirements.txt | grep -v "bson" | python3.9 -m pip install --no-cache-dir -r /dev/stdin

# Create chatbot directory and copy files
RUN mkdir -p /app/chatbot
COPY chatbot/GEM_cnnction.py /app/chatbot/
COPY chatbot/game_mchnics_blueprint.py /app/chatbot/
COPY chatbot/handle_data_blueprint.py /app/chatbot/
COPY chatbot/logout_user_blueprint.py /app/chatbot/
COPY chatbot/__init__.py /app/chatbot/

# Copy main server file and create wsgi
COPY chrcter_creation.py .
RUN echo 'from chrcter_creation import create_app\napp = create_app()\napp.config["APPLICATION_ROOT"] = "/api"' > wsgi.py

ENV PYTHONUNBUFFERED="1" \
    PYTHONPATH="/app" \
    MONGODB_CONNECT_TIMEOUT_MS="5000" \
    MONGODB_SERVER_SELECTION_TIMEOUT_MS="5000" \
    MONGODB_SOCKET_TIMEOUT_MS="5000" \
    MONGODB_HEARTBEAT_FREQUENCY_MS="5000"

EXPOSE 6500

# Create a more robust entrypoint script
RUN echo '#!/bin/bash\n\
if [ ! -f /app/data/.mongodb_initialized ]; then\n\
    echo "Initializing MongoDB for the first time..."\n\
    /app/init-mongo-cli.sh\n\
    if [ $? -eq 0 ]; then\n\
        touch /app/data/.mongodb_initialized\n\
        echo "MongoDB initialization completed successfully"\n\
    else\n\
        echo "MongoDB initialization failed"\n\
        exit 1\n\
    fi\n\
else\n\
    echo "MongoDB already initialized, skipping..."\n\
fi\n\
\n\
# Verify MongoDB connection\n\
mongosh "$MONGO_ATLAS" --eval "db.adminCommand({ping:1})" || {\n\
    echo "Failed to connect to MongoDB"\n\
    exit 1\n\
}\n\
\n\
exec "$@"' > /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Add MongoDB health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD mongosh "$MONGO_ATLAS" --eval "db.adminCommand({ping:1})" || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["gunicorn", "--workers", "1", "--bind", "0.0.0.0:6500", "--forwarded-allow-ips", "*", "wsgi:app"]