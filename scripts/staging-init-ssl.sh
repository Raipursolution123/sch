#!/usr/bin/env bash
# Obtain or renew Let's Encrypt certificate for the staging domain.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.staging.yml"

# shellcheck disable=SC1091
if [[ -f .env ]]; then set -a && source .env && set +a; fi

DOMAIN="${STAGING_DOMAIN:-school.raipursolutions.com}"
EMAIL="${CERTBOT_EMAIL:-admin@raipursolutions.com}"

CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"

if docker compose -f "$COMPOSE_FILE" exec -T nginx test -f "$CERT_PATH" 2>/dev/null; then
  echo "==> SSL certificate already exists for ${DOMAIN}"
else
  echo "==> Requesting SSL certificate for ${DOMAIN}..."
  export NGINX_STAGING_CONF=nginx.staging.http-only.conf
  docker compose -f "$COMPOSE_FILE" up -d nginx

  docker compose -f "$COMPOSE_FILE" run --rm \
    --entrypoint certbot \
    certbot certonly \
    --webroot -w /var/www/certbot \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive
fi

echo "==> Switching Nginx to HTTPS config..."
export NGINX_STAGING_CONF=nginx.staging.conf
docker compose -f "$COMPOSE_FILE" up -d nginx

echo "==> SSL ready for https://${DOMAIN}"
