#!/bin/sh
set -e

echo "Waiting for database..."
python << 'PYEOF'
import os
import sys
import time

os.environ.setdefault("DJANGO_SETTINGS_MODULE", os.environ.get("DJANGO_SETTINGS_MODULE", "config.settings.local"))

import django
django.setup()

from django.db import connection

for i in range(30):
    try:
        connection.ensure_connection()
        print("Database is ready.")
        sys.exit(0)
    except Exception:
        time.sleep(2)

print("Database connection failed.")
sys.exit(1)
PYEOF

echo "Checking onboarding prerequisites..."
python manage.py check_onboarding || true

echo "Running migrations..."
python manage.py migrate --noinput || {
    echo "Full migrate failed; applying framework migrations only..."
    python manage.py migrate contenttypes --noinput
    python manage.py migrate django_celery_results --noinput
    python manage.py migrate django_celery_beat --noinput
    python manage.py migrate sessions --noinput
}

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true

exec "$@"
