FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app/env

RUN apt-get update && \
    apt-get install -y \
    bash \
    && rm -rf /var/lib/apt/lists/*

COPY .ENV /app/env/.env

RUN set -a && . /app/env/.env && set +a

VOLUME /app/env

CMD ["tail", "-f", "/dev/null"] 