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

# Install Python dependencies and gunicorn explicitly
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn==20.1.0

# Create necessary directories
RUN mkdir -p /app/logs /app/data /app/myproj /app/staticfiles

# Copy the rest of the application
COPY . .

# Create and configure entrypoint script
COPY docker-entrypoint.sh .
COPY init.sh .

# Fix line endings and permissions
RUN dos2unix docker-entrypoint.sh && \
    dos2unix init.sh && \
    chmod +x docker-entrypoint.sh && \
    chmod +x init.sh

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    DB_HOST=mysql \
    PATH="/usr/local/bin:$PATH"

EXPOSE 8000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD mysqladmin ping -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["/app/init.sh"]