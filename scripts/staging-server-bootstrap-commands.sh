# Server bootstrap commands — run on the VPS as the deploy user
# Prerequisites: DNS A record, GitHub Secrets configured, ports 80/443 open

set -euo pipefail

APP_PATH="/opt/school-erp"

# Phase 1 — one-time VPS prep (as root)
# sudo bash scripts/staging-server-prep.sh

# Phase 2 — clone and configure (as deploy user)
sudo mkdir -p "$APP_PATH"
sudo chown "$USER":"$USER" "$APP_PATH"
git clone https://github.com/Raipursolution123/sch.git "$APP_PATH"
cd "$APP_PATH"

cp .env.staging.example .env
# Edit .env: SECRET_KEY, DB_PASSWORD, MYSQL_ROOT_PASSWORD, CERTBOT_EMAIL
chmod 600 .env
chmod +x scripts/staging-*.sh

# Phase 3 — GHCR login (if packages are private)
# echo <GITHUB_PAT_with_read:packages> | docker login ghcr.io -u <github-username> --password-stdin

# Phase 4 — bootstrap (schema, SSL, first stack)
./scripts/staging-bootstrap.sh

# Phase 5 — verify
./scripts/staging-e2e-verify.sh https://school.raipursolutions.com
