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

should_skip_ssl() {
  case "${SKIP_SSL_BOOTSTRAP:-}" in
    1 | true | TRUE | yes | YES) return 0 ;;
  esac
  case "${SHARED_VPS:-}" in
    1 | true | TRUE | yes | YES) return 0 ;;
  esac
  # Shared hosts bind Docker nginx to 127.0.0.1:PORT; host Apache owns 80/443.
  local http_port="${HTTP_PORT:-80}"
  if [[ "$http_port" != "80" ]]; then
    return 0
  fi
  return 1
}

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

if should_skip_ssl; then
  if [[ -z "${NGINX_STAGING_CONF:-}" ]]; then
    export NGINX_STAGING_CONF=nginx.staging.http-only.conf
  fi
else
  export NGINX_STAGING_CONF=nginx.staging.http-only.conf
fi
export IMAGE_TAG="${IMAGE_TAG:-latest}"

if should_skip_ssl; then
  echo "==> Building and starting application stack (shared VPS — host reverse proxy)..."
else
  echo "==> Building and starting application stack (HTTP only until SSL bootstrap)..."
fi
docker compose -f "$COMPOSE_FILE" up -d --build

echo "==> Running school initialization (if not already done)..."
docker compose -f "$COMPOSE_FILE" run --rm backend python manage.py initial_setup \
  --base-url "https://${DOMAIN}" || true

if should_skip_ssl; then
  echo "==> Skipping Docker SSL bootstrap (shared VPS / SKIP_SSL_BOOTSTRAP / non-default HTTP_PORT)."
  echo "    Host Apache/Nginx should terminate TLS and proxy to Docker nginx, e.g.:"
  if [[ "${HTTP_PORT:-80}" == *:* ]]; then
    echo "    ProxyPass / http://${HTTP_PORT}/"
  else
    echo "    ProxyPass / http://127.0.0.1:${HTTP_PORT}/"
  fi
  FINAL_URL="${STAGING_URL:-https://${DOMAIN}}"
else
  echo "==> Obtaining SSL certificate..."
  "$ROOT_DIR/scripts/staging-init-ssl.sh"
  FINAL_URL="https://${DOMAIN}"
fi

echo "==> Bootstrap complete."
echo "    URL: ${FINAL_URL}"
echo "    Default admin (if initial_setup just ran): admin@demo.com / Admin@123 — change immediately."
