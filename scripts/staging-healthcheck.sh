#!/usr/bin/env bash
# Verify staging stack is responding after deploy.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.staging.yml"

# shellcheck disable=SC1091
if [[ -f .env ]]; then set -a && source .env && set +a; fi

BASE_URL="${STAGING_URL:-https://school.raipursolutions.com}"
MAX_ATTEMPTS="${HEALTHCHECK_ATTEMPTS:-12}"
SLEEP_SECS="${HEALTHCHECK_SLEEP:-5}"

echo "==> Health check: ${BASE_URL}"

for i in $(seq 1 "$MAX_ATTEMPTS"); do
  if curl -fsS "${BASE_URL}/health/" >/dev/null; then
    echo "    /health/ OK"
    break
  fi
  if [[ "$i" -eq "$MAX_ATTEMPTS" ]]; then
    echo "ERROR: /health/ failed after ${MAX_ATTEMPTS} attempts"
    docker compose -f "$COMPOSE_FILE" ps
    exit 1
  fi
  echo "    waiting... (${i}/${MAX_ATTEMPTS})"
  sleep "$SLEEP_SECS"
done

READY_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}/health/ready/" || echo 000)"
if [[ "$READY_STATUS" == "200" ]]; then
  echo "    /health/ready/ OK"
else
  echo "    WARN: /health/ready/ returned ${READY_STATUS} (onboarding may be incomplete — app may still work)"
fi

echo "==> Health check passed."
