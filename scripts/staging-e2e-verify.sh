#!/usr/bin/env bash
# End-to-end staging verification for local or remote staging URL.
# Usage: ./scripts/staging-e2e-verify.sh [base_url]
set -euo pipefail

BASE_URL="${1:-http://localhost:8080}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORT="$ROOT_DIR/.deploy/e2e-report.txt"
mkdir -p "$ROOT_DIR/.deploy"

PASS=0
FAIL=0
SKIP=0
WARN=0

log() { echo "$1" | tee -a "$REPORT"; }
pass() { PASS=$((PASS + 1)); log "  [PASS] $1"; }
fail() { FAIL=$((FAIL + 1)); log "  [FAIL] $1"; }
skip() { SKIP=$((SKIP + 1)); log "  [SKIP] $1"; }
warn() { WARN=$((WARN + 1)); log "  [WARN] $1"; }

http_code() {
  curl -s -o /dev/null -w "%{http_code}" "$@"
}

: > "$REPORT"
log "=== School ERP Staging E2E Verification ==="
log "Base URL: $BASE_URL"
log "Time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
log ""

# --- Health ---
log "## Health endpoints"
code=$(http_code "$BASE_URL/health/")
[[ "$code" == "200" ]] && pass "/health/ returns 200" || fail "/health/ returned $code"

ready_code=$(http_code "$BASE_URL/health/ready/")
if [[ "$ready_code" == "200" ]]; then
  pass "/health/ready/ returns 200"
elif [[ "$ready_code" == "503" ]]; then
  warn "/health/ready/ returns 503 (onboarding incomplete — may be OK on fresh DB)"
else
  fail "/health/ready/ returned $ready_code"
fi

# --- Nginx API proxy ---
log ""
log "## API proxy (Nginx → backend)"
login_json=$(mktemp)
login_code=$(curl -s -o "$login_json" -w "%{http_code}" -X POST "$BASE_URL/api/v1/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@demo.com","password":"Admin@123"}')

if [[ "$login_code" == "200" ]] && grep -q '"access"' "$login_json"; then
  pass "Login via Nginx proxy (POST /api/v1/auth/login/)"
  ACCESS=$(python3 -c "import json; print(json.load(open('$login_json'))['data']['tokens']['access'])" 2>/dev/null || \
           python -c "import json; print(json.load(open('$login_json'))['data']['tokens']['access'])" 2>/dev/null)
  REFRESH=$(python3 -c "import json; print(json.load(open('$login_json'))['data']['tokens']['refresh'])" 2>/dev/null || \
            python -c "import json; print(json.load(open('$login_json'))['data']['tokens']['refresh'])" 2>/dev/null)
else
  fail "Login failed (HTTP $login_code)"
  ACCESS=""
  REFRESH=""
fi
rm -f "$login_json"

# --- Protected API ---
log ""
log "## Protected APIs"
if [[ -n "$ACCESS" ]]; then
  me_code=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ACCESS" "$BASE_URL/api/v1/auth/me/")
  [[ "$me_code" == "200" ]] && pass "GET /api/v1/auth/me/ with valid token" || fail "me/ returned $me_code"

  anon_code=$(http_code "$BASE_URL/api/v1/auth/me/")
  [[ "$anon_code" == "401" ]] && pass "GET /api/v1/auth/me/ without token returns 401" || fail "me/ without token returned $anon_code"
else
  skip "Protected API tests (no access token)"
fi

# --- Token refresh ---
log ""
log "## Token refresh"
if [[ -n "$REFRESH" ]]; then
  refresh_json=$(mktemp)
  refresh_code=$(curl -s -o "$refresh_json" -w "%{http_code}" -X POST "$BASE_URL/api/v1/auth/token/refresh/" \
    -H "Content-Type: application/json" \
    -d "{\"refresh\":\"$REFRESH\"}")
  if [[ "$refresh_code" == "200" ]] && grep -q '"access"' "$refresh_json"; then
    pass "POST /api/v1/auth/token/refresh/"
    NEW_ACCESS=$(python3 -c "import json; print(json.load(open('$refresh_json'))['access'])" 2>/dev/null || \
                 python -c "import json; print(json.load(open('$refresh_json'))['access'])" 2>/dev/null)
    new_me=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $NEW_ACCESS" "$BASE_URL/api/v1/auth/me/")
    [[ "$new_me" == "200" ]] && pass "Refreshed access token works on /me/" || fail "Refreshed token me/ returned $new_me"
  else
    fail "Token refresh failed (HTTP $refresh_code)"
  fi
  rm -f "$refresh_json"
else
  skip "Token refresh (no refresh token)"
fi

# --- Logout ---
log ""
log "## Logout"
if [[ -n "$ACCESS" ]]; then
  logout_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/auth/logout/" \
    -H "Authorization: Bearer $ACCESS")
  [[ "$logout_code" == "200" ]] && pass "POST /api/v1/auth/logout/" || fail "logout returned $logout_code"
  warn "Logout is client-side only (no JWT blacklist) — token still valid until expiry"
else
  skip "Logout test"
fi

# --- Frontend SPA routing ---
log ""
log "## Frontend routing (SPA)"
for path in "/" "/login" "/dashboard" "/students" "/settings/sessions"; do
  body=$(curl -s "$BASE_URL$path")
  if echo "$body" | grep -q 'id="root"'; then
    pass "SPA route $path serves index.html"
  else
    fail "SPA route $path did not return index.html"
  fi
done

# --- Static files ---
log ""
log "## Static files"
static_code=$(http_code "$BASE_URL/static/admin/css/base.css")
if [[ "$static_code" == "200" ]]; then
  pass "Django admin static served at /static/"
else
  warn "Admin static returned $static_code (collectstatic may still be running)"
fi

# --- Media files ---
log ""
log "## Media files"
media_test="e2e-verify.txt"
if command -v docker &>/dev/null && [[ -f "$ROOT_DIR/docker-compose.staging.yml" ]]; then
  COMPOSE="docker compose --env-file $ROOT_DIR/.env.staging.local -f $ROOT_DIR/docker-compose.staging.yml"
  if $COMPOSE ps backend 2>/dev/null | grep -q "running"; then
    $COMPOSE exec -T backend sh -c "echo 'e2e-media-ok' > /app/media/$media_test" 2>/dev/null || true
    media_code=$(http_code "$BASE_URL/media/$media_test")
    [[ "$media_code" == "200" ]] && pass "Media file served via Nginx /media/" || fail "Media file returned $media_code"
  else
    skip "Media test (backend container not running locally)"
  fi
else
  skip "Media test (docker not available)"
fi

# --- Django Admin ---
log ""
log "## Django Admin"
admin_code=$(http_code "$BASE_URL/admin/")
if [[ "$admin_code" == "200" || "$admin_code" == "302" ]]; then
  pass "Django /admin/ reachable via Nginx (HTTP $admin_code)"
else
  fail "Django /admin/ returned $admin_code"
fi

# --- Docker-internal checks ---
log ""
log "## Database, migrations, Redis, Celery (container checks)"
if command -v docker &>/dev/null && [[ -f "$ROOT_DIR/docker-compose.staging.yml" ]]; then
  COMPOSE="docker compose --env-file $ROOT_DIR/.env.staging.local -f $ROOT_DIR/docker-compose.staging.yml"

  redis_ping=$($COMPOSE exec -T redis redis-cli ping 2>/dev/null | tr -d '\r')
  [[ "$redis_ping" == "PONG" ]] && pass "Redis PING" || fail "Redis not responding"

  if $COMPOSE exec -T backend python manage.py showmigrations --plan 2>/dev/null | grep -q "\[X\]"; then
    pass "Django framework migrations applied"
  else
    warn "Could not confirm migrations (check showmigrations output)"
  fi

  table_count=$($COMPOSE exec -T mysql mysql -u school_erp -pstaging_local_db -N -e \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='school_erp';" 2>/dev/null | tr -d '\r')
  if [[ "${table_count:-0}" -ge 280 ]]; then
    pass "Business schema present ($table_count tables)"
  else
    fail "Schema table count low: ${table_count:-0}"
  fi

  sch_count=$($COMPOSE exec -T mysql mysql -u school_erp -pstaging_local_db -N -e \
    "SELECT COUNT(*) FROM school_erp.sch_settings;" 2>/dev/null | tr -d '\r')
  [[ "${sch_count:-0}" -ge 1 ]] && pass "School initialized (sch_settings rows: $sch_count)" || warn "sch_settings empty"

  celery_log=$($COMPOSE logs celery_worker --tail 5 2>/dev/null)
  if echo "$celery_log" | grep -qi "ready"; then
    pass "Celery worker running"
  else
    warn "Celery worker status unclear — check logs"
  fi

  if $COMPOSE exec -T backend celery -A config inspect ping 2>/dev/null | grep -q "pong"; then
    pass "Celery inspect ping"
  else
    warn "Celery inspect ping failed (worker may still be OK)"
  fi
else
  skip "Container-internal checks (docker not available)"
fi

# --- File uploads ---
log ""
log "## File uploads"
skip "No business upload API deployed yet (only auth endpoints live)"

# --- Browser refresh simulation ---
log ""
log "## Browser refresh on protected routes"
warn "Manual check recommended: login in browser, refresh /dashboard — should stay authenticated via localStorage token"

# --- Summary ---
log ""
log "=== Summary ==="
log "PASS: $PASS  FAIL: $FAIL  WARN: $WARN  SKIP: $SKIP"
if [[ "$FAIL" -eq 0 ]]; then
  log "RESULT: READY FOR SERVER DEPLOYMENT (with noted warnings)"
  exit 0
else
  log "RESULT: NOT READY — fix failures before server deploy"
  exit 1
fi
