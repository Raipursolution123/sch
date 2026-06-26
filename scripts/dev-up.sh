#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

docker compose -f docker-compose.dev.yml up --build -d

echo ""
echo "School ERP is starting..."
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API:      http://localhost:8000/api/v1/"
echo ""
echo "Run migrations and create superuser:"
echo "  docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser"
