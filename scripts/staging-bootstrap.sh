#!/usr/bin/env bash
# First-time staging server bootstrap (run once on the VPS).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.staging.yml"
DOMAIN="${STAGING_DOMAIN:-school.raipursolutions.com}"

echo "==> School ERP staging bootstrap"
echo "    Domain: $DOMAIN"
echo "    Root:   $ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "==> Creating .env from .env.staging.example"
  cp .env.staging.example .env
  echo "    IMPORTANT: Edit .env with real secrets before continuing."
  echo "    Press Enter when .env is ready, or Ctrl+C to abort."
  read -r _
fi

# shellcheck disable=SC1091
set -a && source .env && set +a

echo "==> Starting data services (MySQL + Redis)..."
docker compose -f "$COMPOSE_FILE" up -d mysql redis

echo "==> Waiting for MySQL..."
for i in $(seq 1 30); do
  if docker compose -f "$COMPOSE_FILE" exec -T mysql mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD}" --silent; then
    break
  fi
  sleep 2
done

echo "==> Checking if schema is loaded..."
TABLE_COUNT="$(docker compose -f "$COMPOSE_FILE" exec -T mysql \
  mysql -u "${DB_USER}" -p"${DB_PASSWORD}" -N -e \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}';" 2>/dev/null || echo 0)"

if [[ "${TABLE_COUNT:-0}" -lt 50 ]]; then
  echo "==> Loading schema.sql and basic_seed.sql (first run)..."
  docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < backend/seeds/schema.sql
  docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < backend/seeds/basic_seed.sql
else
  echo "==> Schema already present ($TABLE_COUNT tables), skipping seed SQL."
fi

export NGINX_STAGING_CONF=nginx.staging.http-only.conf
export IMAGE_TAG="${IMAGE_TAG:-latest}"

echo "==> Building and starting application stack (HTTP only for SSL bootstrap)..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "==> Running school initialization (if not already done)..."
docker compose -f "$COMPOSE_FILE" run --rm backend python manage.py initial_setup \
  --base-url "https://${DOMAIN}" || true

echo "==> Obtaining SSL certificate..."
"$ROOT_DIR/scripts/staging-init-ssl.sh"

echo "==> Bootstrap complete."
echo "    URL: https://${DOMAIN}"
echo "    Default admin (if initial_setup just ran): admin@demo.com / Admin@123 — change immediately."
