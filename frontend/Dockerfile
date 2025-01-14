# Build stage
FROM node:20-slim AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and Angular CLI with retry and network timeout settings
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retries 5 && \
    npm ci --fetch-retries=5 && \
    npm install -g @angular/cli@16.0.0

# Copy the rest of the application
COPY . .

# Build the application with increased memory allocation
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN ng build --configuration production

# Production stage
FROM nginx:1.24-alpine

# Copy built files
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create assets directory and ensure proper permissions
RUN mkdir -p /usr/share/nginx/html/assets && \
    chmod -R 755 /usr/share/nginx/html/assets

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
