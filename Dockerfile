FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
RUN npm install -g @angular/cli@18.0.0
COPY frontend/ .
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN ng build --configuration production


FROM python:3.9-slim-bullseye AS backend-build
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .


FROM python:3.9-slim-bullseye AS model-build
WORKDIR /app/model
RUN apt-get update && apt-get install -y \
    pkg-config \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
COPY model/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY model/ .


FROM python:3.9-slim-bullseye AS final

RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /var/log/supervisor /var/run /var/log/nginx /app/model /app/backend && \
    touch /var/run/supervisor.sock && \
    chmod 777 /var/run/supervisor.sock && \
    chown -R www-data:www-data /var/log/nginx && \
    chmod -R 755 /app

COPY --from=frontend-build /app/frontend/dist/frontend/browser /usr/share/nginx/html
COPY --from=backend-build /app/backend /app/backend
COPY --from=model-build /app/model /app/model

RUN find /app -type f -name "*.py" -exec dos2unix {} \; && \
    find /app -type f -name "*.py" -exec chmod +x {} \;

RUN touch /var/log/supervisor/supervisord.log && \
    touch /var/log/supervisor/nginx.err.log && \
    touch /var/log/supervisor/nginx.out.log && \
    touch /var/log/supervisor/backend.err.log && \
    touch /var/log/supervisor/backend.out.log && \
    touch /var/log/supervisor/text_generation.err.log && \
    touch /var/log/supervisor/text_generation.out.log && \
    touch /var/log/supervisor/character_creation.err.log && \
    touch /var/log/supervisor/character_creation.out.log && \
    touch /var/log/supervisor/library_service.err.log && \
    touch /var/log/supervisor/library_service.out.log && \
    chmod 666 /var/log/supervisor/*.log

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN dos2unix /etc/nginx/conf.d/default.conf && \
    dos2unix /etc/supervisor/conf.d/supervisord.conf

COPY .env /app/.env
COPY model/.env /app/model/.env
COPY backend/myproj/.env /app/backend/myproj/.env

EXPOSE 4200 8000 5000 6500 7652

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]