#!/bin/sh
set -e

echo "🚀 Starting KaYa Django + SQLite Application..."

# Apply database migrations
python manage.py migrate --noinput

# Run seed / migration check if needed
python scripts/migrate_mongo_to_sqlite.py || true

# Collect static files
python manage.py collectstatic --noinput || true

PORT_VAL="${PORT:-10000}"
echo "✅ Server ready. Listening on 0.0.0.0:${PORT_VAL} via Gunicorn"

exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:${PORT_VAL} \
    --workers 2 \
    --threads 4 \
    --timeout 120

