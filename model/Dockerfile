# Use an official Python runtime as a parent image
FROM python:3.9-slim-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    build-essential \
    supervisor \
    default-libmysqlclient-dev \
    default-mysql-client \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy requirements first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create supervisor directory and config file
RUN mkdir -p /etc/supervisor/conf.d/

# Create supervisor config file
RUN echo '[supervisord]\n\
nodaemon=true\n\
logfile=/var/log/supervisor/supervisord.log\n\
pidfile=/var/run/supervisord.pid\n\
\n\
[program:text_generation]\n\
command=python /app/text_generation.py\n\
directory=/app\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/text_generation.err.log\n\
stdout_logfile=/var/log/supervisor/text_generation.out.log\n\
\n\
[program:character_creation]\n\
command=python /app/character_creation.py\n\
directory=/app\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/character_creation.err.log\n\
stdout_logfile=/var/log/supervisor/character_creation.out.log\n\
\n\
[program:library_service]\n\
command=python /app/library_service.py\n\
directory=/app\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/library_service.err.log\n\
stdout_logfile=/var/log/supervisor/library_service.out.log' > /etc/supervisor/conf.d/supervisord.conf

# Copy application files
COPY . .

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

# Add healthcheck for MongoDB Atlas
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import pymongo; pymongo.MongoClient('${MONGODB_URI}')"

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

