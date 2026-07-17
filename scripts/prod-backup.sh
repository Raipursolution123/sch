#!/usr/bin/env bash
# Backup MySQL database and media volume for production.
# Usage: ./scripts/prod-backup.sh [output-dir]
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.prod.yml"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="${1:-$ROOT_DIR/backups}"
mkdir -p "$OUT_DIR"

# shellcheck disable=SC1091
if [[ -f .env ]]; then set -a && source .env && set +a; fi

DB_NAME="${DB_NAME:?DB_NAME is required}"
DB_USER="${DB_USER:?DB_USER is required}"
DB_PASSWORD="${DB_PASSWORD:?DB_PASSWORD is required}"

SQL_FILE="$OUT_DIR/db_${DB_NAME}_${STAMP}.sql.gz"
MEDIA_FILE="$OUT_DIR/media_${STAMP}.tar.gz"

echo "==> Dumping MySQL database ${DB_NAME} → ${SQL_FILE}"
docker compose -f "$COMPOSE_FILE" exec -T mysql \
  mysqldump -u"$DB_USER" -p"$DB_PASSWORD" --single-transaction --routines --triggers "$DB_NAME" \
  | gzip -c > "$SQL_FILE"

echo "==> Archiving media volume → ${MEDIA_FILE}"
# Copy media out of the named volume via a short-lived alpine container.
MEDIA_VOL="$(docker volume ls -q --filter name=media_volume | head -n1 || true)"
if [[ -z "$MEDIA_VOL" ]]; then
  # Fallback: compose project-prefixed volume name
  MEDIA_VOL="$(docker volume ls -q | grep -E 'media_volume$' | head -n1 || true)"
fi
if [[ -n "$MEDIA_VOL" ]]; then
  docker run --rm -v "${MEDIA_VOL}:/media:ro" -v "$OUT_DIR:/backup" alpine:3.20 \
    tar -czf "/backup/$(basename "$MEDIA_FILE")" -C /media .
else
  echo "WARN: media_volume not found — skipping media archive."
fi

echo "==> Backup complete:"
ls -lh "$SQL_FILE" || true
[[ -f "$MEDIA_FILE" ]] && ls -lh "$MEDIA_FILE" || true
