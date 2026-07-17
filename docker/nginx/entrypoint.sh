#!/bin/sh
set -e

# The stock nginx:alpine entrypoint chowns /var/cache/nginx at runtime, which
# fails under compose cap_drop:ALL (no CAP_CHOWN). Temp dirs are prepared in
# the Dockerfile instead.
if [ "${1#-}" != "$1" ]; then
  set -- nginx "$@"
fi

if [ "$1" = "nginx" ] || [ "$1" = "nginx-debug" ]; then
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "error: $1 binary not found" >&2
    exit 1
  fi
  nginx -t
fi

exec "$@"
