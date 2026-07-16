#!/usr/bin/env bash
# Deploy latest staging images. Called by CI/CD or manually on the server.
# Usage: ./scripts/staging-deploy.sh [image-tag]
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.staging.yml"
IMAGE_TAG="${1:-$(git rev-parse --short HEAD 2>/dev/null || true)}"
if [[ -z "$IMAGE_TAG" ]]; then
  echo "ERROR: IMAGE_TAG is required. Pass a git commit SHA: ./scripts/staging-deploy.sh <tag>"
  exit 1
fi
DEPLOY_DIR="$ROOT_DIR/.deploy"

mkdir -p "$DEPLOY_DIR"

if [[ -f "$DEPLOY_DIR/last-good" ]]; then
  cp "$DEPLOY_DIR/last-good" "$DEPLOY_DIR/previous"
fi
echo "$IMAGE_TAG" > "$DEPLOY_DIR/current"

# shellcheck disable=SC1091
if [[ -f .env ]]; then set -a && source .env && set +a; fi

export IMAGE_TAG
export NGINX_STAGING_CONF="${NGINX_STAGING_CONF:-nginx.staging.conf}"

echo "==> Deploying staging tag: ${IMAGE_TAG}"
echo "==> Pulling latest compose config from git..."
git fetch origin main
git reset --hard "origin/main"
chmod +x scripts/staging-*.sh

echo "==> Pulling container images..."
if ! docker compose -f "$COMPOSE_FILE" pull backend frontend celery_worker celery_beat 2>/dev/null; then
  echo "    Registry pull failed — building images locally..."
  docker compose -f "$COMPOSE_FILE" build backend frontend
fi

rollback() {
  echo "==> DEPLOY FAILED — rolling back..."
  bash "$ROOT_DIR/scripts/staging-rollback.sh" || true
  exit 1
}

trap rollback ERR

echo "==> Recreating application containers (data volumes preserved)..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans --wait backend frontend celery_worker celery_beat nginx

echo "==> Running framework migrations..."
docker compose -f "$COMPOSE_FILE" exec -T backend python manage.py migrate --noinput || {
  echo "WARN: migrate had issues — check logs (legacy schema uses SQL seeds, not Django migrations)."
}

echo "==> Collecting static files..."
docker compose -f "$COMPOSE_FILE" exec -T backend python manage.py collectstatic --noinput --clear || {
  echo "WARN: collectstatic had issues — check backend logs."
}

echo "==> Ensuring School Admin legacy permissions..."
docker compose -f "$COMPOSE_FILE" exec -T backend python manage.py ensure_admin_permissions || {
  echo "WARN: ensure_admin_permissions had issues — check backend logs."
}

echo "==> Health check..."
bash "$ROOT_DIR/scripts/staging-healthcheck.sh"

echo "$IMAGE_TAG" > "$DEPLOY_DIR/last-good"
trap - ERR

echo "==> Staging deploy successful (tag: ${IMAGE_TAG})"
