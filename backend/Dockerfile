# Use an official Python runtime as a parent image
FROM python:3.9-slim-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    default-mysql-client \
    build-essential \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy requirements first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p /app/logs /app/data /app/myproj

# Copy the application files
COPY . .

# Fix line endings for all critical files
RUN dos2unix init.sh && \
    chmod +x init.sh && \
    dos2unix myproj/.env

# Create a more robust entrypoint script
RUN echo '#!/bin/bash\n\
\n\
# Wait for MySQL to be ready\n\
max_tries=30\n\
counter=0\n\
echo "Waiting for MySQL..."\n\
\n\
while ! mysqladmin ping -h"$DB_HOST" --silent; do\n\
    counter=$((counter + 1))\n\
    if [ $counter -gt $max_tries ]; then\n\
        echo "Error: MySQL did not become ready in time."\n\
        exit 1\n\
    fi\n\
    echo "Waiting for MySQL to be ready... ($counter/$max_tries)"\n\
    sleep 2\n\
done\n\
\n\
echo "MySQL is ready!"\n\
\n\
# Load environment variables\n\
export DB_HOST=mysql\n\
\n\
# Execute the original init script\n\
exec ./init.sh\n\
' > /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    DB_HOST=mysql

EXPOSE 8000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD mysqladmin ping -h"$DB_HOST" || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]