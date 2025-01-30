# Use Ubuntu 20.04 as base image
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

# Upgrade pip and install core dependencies
RUN python3.9 -m pip install --upgrade pip && \
    python3.9 -m pip install --no-cache-dir \
    "pymongo[srv]>=4.6.0,<4.7.0" \
    "dnspython>=2.4.0" \
    "python-dotenv>=1.0.0" \
    "gunicorn>=21.2.0" \
    "eventlet>=0.33.3" \
    "google-generativeai>=0.3.0" \
    "google-cloud-aiplatform>=1.36.0" \
    "flask>=2.0.0" \
    "flask-cors>=3.0.0" \
    "flask-caching>=2.0.0" \
    "flask-socketio>=5.0.0" \
    "beautifulsoup4>=4.9.0"

# Copy requirements and install other dependencies
COPY requirements.txt .
RUN grep -v "pymongo" requirements.txt | grep -v "bson" | python3.9 -m pip install --no-cache-dir -r /dev/stdin

# Copy the application files
COPY chatbot /app/chatbot/
COPY gen_txt_chat_srvr.py /app/

# Create the WSGI file
RUN echo 'from gen_txt_chat_srvr import create_app\n\napp, socketio = create_app()\n' > /app/wsgi.py

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    MONGODB_CONNECT_TIMEOUT_MS=5000 \
    MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000 \
    MONGODB_SOCKET_TIMEOUT_MS=5000 \
    MONGODB_HEARTBEAT_FREQUENCY_MS=5000 \
    GUNICORN_TIMEOUT=300 \
    GUNICORN_WORKERS=1 \
    GUNICORN_THREADS=4

EXPOSE 5000

# Create a custom gunicorn config file
RUN echo 'timeout = 300\nworkers = 1\nthreads = 4\nworker_class = "eventlet"\nkeepalive = 120\nmax_requests = 100\nmax_requests_jitter = 20' > gunicorn.conf.py

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
CMD ["gunicorn", \
    "--config", "gunicorn.conf.py", \
    "--bind", "0.0.0.0:5000", \
    "--log-level", "debug", \
    "--timeout", "300", \
    "--graceful-timeout", "300", \
    "--keep-alive", "120", \
    "--worker-class", "eventlet", \
    "--workers", "1", \
    "--threads", "4", \
    "--forwarded-allow-ips", "*", \
    "wsgi:app"]