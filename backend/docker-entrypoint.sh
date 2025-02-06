#!/bin/bash
set -e

echo "Waiting for MySQL..."
until mysqladmin ping -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" --silent; do
    echo "Waiting for MySQL to be ready..."
    sleep 2
done
echo "MySQL is ready!"

exec "$@" 