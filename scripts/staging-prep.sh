#!/usr/bin/env bash
# Validate and prepare staging .env before deploying Docker Redis-auth / image-tag changes.
# Usage (on the staging server, from the repo root):
#   ./scripts/staging-prep.sh
#   ./scripts/staging-prep.sh --apply   # recreate redis + app after a successful check
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.staging.yml"
ENV_FILE="${ENV_FILE:-.env}"
APPLY=false

for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=true ;;
    -h|--help)
      echo "Usage: $0 [--apply]"
      echo "  Checks staging .env for Redis auth + IMAGE_TAG, then optionally recreates Redis/app."
      exit 0
      ;;
  esac
done

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found. Copy from .env.staging.example first:"
  echo "  cp .env.staging.example .env && chmod 600 .env"
  exit 1
fi

# shellcheck disable=SC1091
set -a && source "$ENV_FILE" && set +a

errors=0
warn() { echo "WARN: $*"; }
fail() { echo "ERROR: $*"; errors=$((errors + 1)); }
ok() { echo "OK: $*"; }

echo "==> Staging prep checks ($ENV_FILE)"

if [[ -z "${SECRET_KEY:-}" || "$SECRET_KEY" == change-me* ]]; then
  fail "SECRET_KEY must be set to a real secret (not the example placeholder)."
else
  ok "SECRET_KEY is set"
fi

if [[ -z "${REDIS_PASSWORD:-}" || "$REDIS_PASSWORD" == change-me* ]]; then
  fail "REDIS_PASSWORD must be a strong password (not the example placeholder)."
else
  ok "REDIS_PASSWORD is set"
fi

require_redis_url() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "$value" ]]; then
    fail "$name is empty"
    return
  fi
  if [[ "$value" != redis://:*@redis:6379/* ]]; then
    fail "$name must look like redis://:<REDIS_PASSWORD>@redis:6379/<db> (got: $value)"
    return
  fi
  if [[ "$value" == *change-me* ]]; then
    fail "$name still contains the example placeholder"
    return
  fi
  ok "$name uses authenticated Redis URL"
}

require_redis_url REDIS_URL
require_redis_url CELERY_BROKER_URL
require_redis_url CELERY_RESULT_BACKEND

if [[ -z "${IMAGE_TAG:-}" || "$IMAGE_TAG" == "latest" || "$IMAGE_TAG" == "abc1234" ]]; then
  fail "IMAGE_TAG must be a real commit SHA from CI (not latest / abc1234)."
  echo "       After CI push: set IMAGE_TAG to the short SHA, or pass it to staging-deploy.sh"
else
  ok "IMAGE_TAG=$IMAGE_TAG"
fi

if [[ -z "${DB_PASSWORD:-}" || "$DB_PASSWORD" == change-me* ]]; then
  fail "DB_PASSWORD must be set (not the example placeholder)."
else
  ok "DB_PASSWORD is set"
fi

if [[ -z "${MYSQL_ROOT_PASSWORD:-}" || "$MYSQL_ROOT_PASSWORD" == change-me* ]]; then
  fail "MYSQL_ROOT_PASSWORD must be set (not the example placeholder)."
else
  ok "MYSQL_ROOT_PASSWORD is set"
fi

echo ""
if [[ "$errors" -gt 0 ]]; then
  echo "==> $errors check(s) failed. Fix .env, then re-run."
  echo "    Template: .env.staging.example"
  exit 1
fi

echo "==> All checks passed."
echo ""
echo "One-time Redis auth rollout (if Redis previously had no password):"
echo "  1. Update .env (already done if checks passed)"
echo "  2. Recreate Redis + consumers:"
echo "       docker compose -f $COMPOSE_FILE up -d --force-recreate redis backend celery_worker celery_beat"
echo "  3. Deploy a SHA tag:"
echo "       ./scripts/staging-deploy.sh <short-sha>"
echo ""

if [[ "$APPLY" != true ]]; then
  echo "Re-run with --apply to recreate redis/backend/celery now."
  exit 0
fi

echo "==> Applying: recreating redis + application containers..."
docker compose -f "$COMPOSE_FILE" up -d --force-recreate --remove-orphans redis backend celery_worker celery_beat
echo "==> Waiting for health..."
docker compose -f "$COMPOSE_FILE" ps
bash "$ROOT_DIR/scripts/staging-healthcheck.sh" || {
  echo "WARN: external healthcheck failed — inspect logs if DNS/TLS is not ready yet."
  docker compose -f "$COMPOSE_FILE" logs --tail=40 backend redis
}
echo "==> Staging prep apply complete."
