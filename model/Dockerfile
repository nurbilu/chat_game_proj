# Use an official Python runtime as a parent image
FROM python:3.9-slim-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    build-essential \
    supervisor \
    default-libmysqlclient-dev \
    default-mysql-client \
    curl \
    gpg \
    wget \
    apt-transport-https \
    && rm -rf /var/lib/apt/lists/*

# Add these lines after the initial apt-get install
RUN curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
    gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
    --dearmor && \
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] http://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" | \
    tee /etc/apt/sources.list.d/mongodb-org-7.0.list && \
    apt-get update && \
    apt-get install -y mongodb-database-tools mongodb-mongosh && \
    rm -rf /var/lib/apt/lists/*

# Create necessary directories
RUN mkdir -p /etc/supervisor/conf.d/ && \
    mkdir -p /docker-entrypoint-initdb.d/ && \
    mkdir -p /scripts/mongo/init

# Set the working directory
WORKDIR /app

# Copy requirements first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create supervisor directory
RUN mkdir -p /etc/supervisor/conf.d/

# Copy application files including chatbot directory
COPY . .

# Create supervisor config file with corrected paths
RUN echo '[supervisord]\n\
nodaemon=true\n\
logfile=/var/log/supervisor/supervisord.log\n\
pidfile=/var/run/supervisord.pid\n\
\n\
[program:text_generation]\n\
command=python /app/gen_txt_chat_srvr.py\n\
directory=/app\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/text_generation.err.log\n\
stdout_logfile=/var/log/supervisor/text_generation.out.log\n\
\n\
[program:character_creation]\n\
command=python /app/chrcter_creation.py\n\
directory=/app\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/character_creation.err.log\n\
stdout_logfile=/var/log/supervisor/character_creation.out.log\n\
\n\
[program:library_service]\n\
command=python /app/lib_srvr.py\n\
directory=/app\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/library_service.err.log\n\
stdout_logfile=/var/log/supervisor/library_service.out.log' > /etc/supervisor/conf.d/supervisord.conf

# Setup logging
RUN mkdir -p /var/log/supervisor && \
    touch /var/log/supervisor/supervisord.log && \
    touch /var/log/supervisor/text_generation.err.log && \
    touch /var/log/supervisor/text_generation.out.log && \
    touch /var/log/supervisor/character_creation.err.log && \
    touch /var/log/supervisor/character_creation.out.log && \
    touch /var/log/supervisor/library_service.err.log && \
    touch /var/log/supervisor/library_service.out.log && \
    chmod -R 777 /var/log/supervisor

EXPOSE 5000 6500 7652

ENV PYTHONUNBUFFERED="1" \
    PYTHONPATH="/app"

# Set environment variables for MongoDB
ENV MONGO_ATLAS=mongodb+srv://nurb1111:BILUmongdb1996@cluster0.luomlfx.mongodb.net/?authSource=147.235.199.101%2F32&authMechanism=SCRAM-SHA-1
ENV DB_NAME_MONGO=DnD_AI_DB

# Copy and make init script executable
COPY init-mongo.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init-mongo.sh

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

