#!/bin/bash
set -e

# Load environment variables if .env exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Create superuser if not exists
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='haga').exists():
    User.objects.create_superuser('haga', 'haga12345@gmail.com', 'haga123456789')
EOF

# Verify gunicorn installation
which gunicorn || {
    echo "Installing gunicorn..."
    pip install --no-cache-dir gunicorn==20.1.0
}

# Start gunicorn with explicit path
exec /usr/local/bin/gunicorn myproj.wsgi:application --bind 0.0.0.0:8000 --workers 3