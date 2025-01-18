#!/bin/bash
set -e

# Load environment variables if .env exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Create superuser
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('haga', 'haga12345@gmail.com', 'haga123456789') if not User.objects.filter(username='haga').exists() else None" | python manage.py shell

exec python manage.py runserver 0.0.0.0:8000