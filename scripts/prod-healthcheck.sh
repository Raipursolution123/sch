#!/usr/bin/env bash
# Production health probe — run from cron or after deploy.
# Usage: BASE_URL=https://your-domain ./scripts/prod-healthcheck.sh

set -euo pipefail

BASE_URL="${BASE_URL:-https://localhost}"
BASE_URL="${BASE_URL%/}"

echo "Checking liveness: ${BASE_URL}/health/"
curl -fsS "${BASE_URL}/health/" | grep -q '"status"[[:space:]]*:[[:space:]]*"healthy"'

echo "Checking readiness: ${BASE_URL}/health/ready/"
ready_code="$(curl -s -o /tmp/school-ready.json -w '%{http_code}' "${BASE_URL}/health/ready/")"
if [[ "${ready_code}" != "200" ]]; then
  echo "Readiness failed (HTTP ${ready_code}):" >&2
  cat /tmp/school-ready.json >&2
  exit 1
fi

echo "Production healthcheck passed."
