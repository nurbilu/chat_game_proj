# Build stage
FROM node:20-slim AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and Angular CLI
RUN npm ci && \
    npm install -g @angular/cli@18.0.0

# Copy the rest of the application
COPY . .

# Build the application with increased memory allocation
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN ng build --configuration production

# Production stage
FROM nginx:1.24-alpine

# Copy built files
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Create nginx configuration
RUN echo 'server {\n\
    listen 4200;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    location /api {\n\
        proxy_pass http://backend:8000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
    }\n\
\n\
    location /model {\n\
        proxy_pass http://model:5000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
    }\n\
\n\
    error_page 500 502 503 504 /50x.html;\n\
    location = /50x.html {\n\
        root /usr/share/nginx/html;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

# Create directory for nginx pid file
RUN mkdir -p /run/nginx

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
