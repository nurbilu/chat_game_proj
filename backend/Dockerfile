# Use an official Python runtime as a parent image
FROM python:3.9-slim-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    default-mysql-client \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy requirements first to leverage cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create entrypoint script with proper line endings
RUN echo '#!/bin/bash\n\
python manage.py migrate --noinput\n\
python manage.py runserver 0.0.0.0:8000' > /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh && \
    sed -i 's/\r$//' /app/entrypoint.sh

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import mysql.connector; mysql.connector.connect(host='mysql-demomo', user='root', password='MYSQLnur1996##', database='dnd', port=3307)"

CMD ["/app/entrypoint.sh"]
