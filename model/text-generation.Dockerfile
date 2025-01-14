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

WORKDIR /app

# Upgrade pip and install core dependencies
RUN python3.9 -m pip install --upgrade pip && \
    python3.9 -m pip install --no-cache-dir \
    "pymongo[srv]>=4.6.0,<4.7.0" \
    "dnspython>=2.4.0" \
    "python-dotenv>=1.0.0" \
    "gunicorn>=21.2.0" \
    "eventlet>=0.33.3" \
    "google-generativeai>=0.3.0" \
    "google-cloud-aiplatform>=1.36.0"

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
COPY gen_txt_chat_srvr.py .
RUN echo 'from gen_txt_chat_srvr import create_app\napp, socketio = create_app()\napp.config["APPLICATION_ROOT"] = "/api"' > wsgi.py

# Copy .env file first
COPY .env /app/.env

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    GOOGLE_API_KEY=${GEMINI_API_KEY1} \
    GEMINI_API_KEY1=${GEMINI_API_KEY1} \
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

# Update the CMD to use the config file and increase timeouts
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