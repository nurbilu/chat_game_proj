FROM ubuntu:20.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Create app directory
WORKDIR /app/env

# Install required packages
RUN apt-get update && \
    apt-get install -y \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Copy the environment file
COPY .ENV /app/env/.env

# Make environment variables available
RUN set -a && . /app/env/.env && set +a

# Create a volume to share environment variables
VOLUME /app/env

# Keep container running
CMD ["tail", "-f", "/dev/null"] 