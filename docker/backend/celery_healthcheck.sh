#!/bin/sh
# Celery health probes used by Compose healthchecks.
# Usage: celery_healthcheck.sh worker|beat
set -e

MODE="${1:-worker}"

case "$MODE" in
  worker)
    celery -A config inspect ping -d "celery@$(hostname)" --timeout 10 2>/dev/null | grep -qi OK
    ;;
  beat)
    # Beat has no inspect ping; confirm a beat process is alive.
    python - <<'PY'
import glob
import sys

for path in glob.glob("/proc/[0-9]*/cmdline"):
    try:
        cmd = open(path, "rb").read().replace(b"\x00", b" ").decode(errors="ignore")
    except OSError:
        continue
    if "celery" in cmd and "beat" in cmd:
        sys.exit(0)
sys.exit(1)
PY
    ;;
  *)
    echo "Usage: $0 worker|beat" >&2
    exit 2
    ;;
esac
