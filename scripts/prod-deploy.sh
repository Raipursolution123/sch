#!/usr/bin/env bash
# Deploy production images. Called by CI/CD or manually on the server.
# Usage: ./scripts/prod-deploy.sh [image-tag]
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.prod.yml"
REQUESTED_TAG="${1:-}"
DEPLOY_DIR="$ROOT_DIR/.deploy"

mkdir -p "$DEPLOY_DIR"

# shellcheck disable=SC1091
if [[ -f .env ]]; then set -a && source .env && set +a; fi

if [[ -n "$REQUESTED_TAG" ]]; then
  IMAGE_TAG="$REQUESTED_TAG"
elif [[ -z "${IMAGE_TAG:-}" ]]; then
  IMAGE_TAG="$(git rev-parse --short HEAD 2>/dev/null || true)"
fi
if [[ -z "$IMAGE_TAG" || "$IMAGE_TAG" == "latest" ]]; then
  echo "ERROR: IMAGE_TAG must be a real commit SHA (got '${IMAGE_TAG:-empty}')."
  echo "       Pass it explicitly: ./scripts/prod-deploy.sh <short-sha>"
  exit 1
fi

if [[ -f "$DEPLOY_DIR/last-good" ]]; then
  cp "$DEPLOY_DIR/last-good" "$DEPLOY_DIR/previous"
fi
echo "$IMAGE_TAG" > "$DEPLOY_DIR/current"

export IMAGE_TAG
export NGINX_PROD_CONF="${NGINX_PROD_CONF:-nginx.prod.conf}"

echo "==> Deploying production tag: ${IMAGE_TAG}"
echo "==> Pulling latest compose config from git..."
git fetch origin main
git reset --hard "origin/main"
chmod +x scripts/prod-*.sh

export IMAGE_TAG
if [[ -n "$REQUESTED_TAG" ]]; then
  export IMAGE_TAG="$REQUESTED_TAG"
fi
echo "==> Using image tag: ${IMAGE_TAG}"

echo "==> Pulling container images..."
if ! docker compose -f "$COMPOSE_FILE" pull backend frontend nginx celery_worker celery_beat 2>/dev/null; then
  echo "    Registry pull failed — building images locally..."
  docker compose -f "$COMPOSE_FILE" build backend frontend nginx
fi

rollback() {
  echo "==> DEPLOY FAILED — check logs and restore previous tag from .deploy/previous"
  docker compose -f "$COMPOSE_FILE" ps || true
  docker compose -f "$COMPOSE_FILE" logs --tail=80 backend frontend nginx || true
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
curl -fsS "http://127.0.0.1:${HTTP_PORT:-80}/health/" >/dev/null || \
  curl -fsS "https://127.0.0.1/health/" -k >/dev/null || {
  echo "ERROR: health check failed"
  exit 1
}

echo "$IMAGE_TAG" > "$DEPLOY_DIR/last-good"
trap - ERR

echo "==> Production deploy successful (tag: ${IMAGE_TAG})"
