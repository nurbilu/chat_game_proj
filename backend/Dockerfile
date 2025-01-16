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

# Copy the rest of the application
COPY . .

# Fix line endings and make init script executable
COPY init.sh .
RUN dos2unix init.sh && \
    chmod +x init.sh

EXPOSE 8000

CMD ["./init.sh"]
