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
    apt-transport-https \
    && rm -rf /var/lib/apt/lists/*

# Install MongoDB Shell
RUN wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor > /etc/apt/trusted.gpg.d/mongodb-7.0.gpg && \
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list && \
    apt-get update && \
    apt-get install -y mongodb-mongosh && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip and install pymongo with dependencies
RUN python3.9 -m pip install --upgrade pip && \
    python3.9 -m pip install --no-cache-dir "pymongo[srv]>=4.6.0,<4.7.0" && \
    python3.9 -m pip install --no-cache-dir "dnspython>=2.4.0" && \
    python3.9 -m pip install --no-cache-dir "python-dotenv>=1.0.0" && \
    python3.9 -m pip install --no-cache-dir "gunicorn>=21.2.0" && \
    python3.9 -m pip install --no-cache-dir "flask>=2.0.0" && \
    python3.9 -m pip install --no-cache-dir "flask-cors>=3.0.0"

# Copy requirements and install other dependencies
COPY requirements.txt .
RUN grep -v "pymongo" requirements.txt | grep -v "bson" | grep -v "flask" | python3.9 -m pip install --no-cache-dir -r /dev/stdin

# Create chatbot directory and copy files
RUN mkdir -p /app/chatbot
COPY chatbot/GEM_cnnction.py /app/chatbot/
COPY chatbot/game_mchnics_blueprint.py /app/chatbot/
COPY chatbot/handle_data_blueprint.py /app/chatbot/
COPY chatbot/logout_user_blueprint.py /app/chatbot/
COPY chatbot/__init__.py /app/chatbot/

# Copy main server file and create wsgi
COPY lib_srvr.py .
RUN echo 'from lib_srvr import create_app\napp = create_app()\napp.config["APPLICATION_ROOT"] = "/api"' > wsgi.py

# Create data directory and ensure it exists
RUN mkdir -p /app/data

# Create log directory and file
RUN mkdir -p /app/logs && \
    touch /app/logs/library.log && \
    chmod 666 /app/logs/library.log

# Update environment variables
ENV PYTHONUNBUFFERED="1" \
    PYTHONPATH="/app" \
    FLASK_APP="lib_srvr.py" \
    FLASK_ENV="production" \
    LOG_FILE="/app/logs/library.log" \
    MONGODB_CONNECT_TIMEOUT_MS="5000" \
    MONGODB_SERVER_SELECTION_TIMEOUT_MS="5000" \
    MONGODB_SOCKET_TIMEOUT_MS="5000" \
    MONGODB_HEARTBEAT_FREQUENCY_MS="5000"

EXPOSE 7625

CMD ["gunicorn", "--workers", "1", "--bind", "0.0.0.0:7625", "--log-file", "/app/logs/library.log", "--log-level", "info", "--forwarded-allow-ips", "*", "wsgi:app"] 