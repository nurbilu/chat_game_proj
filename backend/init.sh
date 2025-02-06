#!/bin/bash
set -e

if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

python manage.py migrate --noinput

python manage.py collectstatic --noinput

python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='haga').exists():
    User.objects.create_superuser('haga', 'haga12345@gmail.com', 'haga123456789')
EOF

which gunicorn || {
    echo "Installing gunicorn..."
    pip install --no-cache-dir gunicorn==20.1.0
}

exec /usr/local/bin/gunicorn myproj.wsgi:application --bind 0.0.0.0:8000 --workers 3