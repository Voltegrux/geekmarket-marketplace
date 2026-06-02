#!/bin/bash
set -e

echo "Waiting for database..."
while ! python -c "import asyncpg; import asyncio; asyncio.run(asyncpg.connect('$DATABASE_URL'.replace('postgresql+asyncpg', 'postgresql')))" 2>/dev/null; do
    sleep 2
done

echo "Running migrations..."
alembic upgrade head

echo "Seeding database..."
python scripts/seed.py || true

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
