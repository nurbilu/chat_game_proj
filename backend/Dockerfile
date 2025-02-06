# Use an official Python runtime as a parent image
FROM python:3.9-slim-bullseye

RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    default-mysql-client \
    build-essential \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn==20.1.0 

RUN mkdir -p /app/logs /app/data /app/myproj /app/staticfiles

COPY . .

COPY docker-entrypoint.sh .
COPY init.sh .



RUN dos2unix docker-entrypoint.sh && \
    dos2unix init.sh && \
    chmod +x docker-entrypoint.sh && \
    chmod +x init.sh


ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    DB_HOST=mysql \
    PATH="/usr/local/bin:$PATH"

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD mysqladmin ping -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["/app/init.sh"]