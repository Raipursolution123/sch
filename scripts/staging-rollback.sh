#!/usr/bin/env bash
# Roll back to the previous known-good image tag.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.staging.yml"
DEPLOY_DIR="$ROOT_DIR/.deploy"
PREVIOUS_TAG="$(cat "$DEPLOY_DIR/previous" 2>/dev/null || echo "")"

if [[ -z "$PREVIOUS_TAG" ]]; then
  echo "ERROR: No previous deployment tag found in .deploy/previous"
  exit 1
fi

echo "==> Rolling back to tag: ${PREVIOUS_TAG}"

export IMAGE_TAG="$PREVIOUS_TAG"
# shellcheck disable=SC1091
if [[ -f .env ]]; then set -a && source .env && set +a; fi

docker compose -f "$COMPOSE_FILE" pull backend frontend celery_worker celery_beat 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" up -d --wait backend frontend celery_worker celery_beat nginx

echo "$PREVIOUS_TAG" > "$DEPLOY_DIR/last-good"
echo "==> Rollback complete."
