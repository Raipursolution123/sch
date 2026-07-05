# Staging Deployment — school.raipursolutions.com

Shared staging environment for continuous development. Every successful push to **`main`** triggers CI, then auto-deploys to the staging server.

## Architecture

```
GitHub (main) → CI workflow → Deploy Staging workflow
                                    ↓
                          Build images → GHCR
                                    ↓
                          SSH → staging-deploy.sh
                                    ↓
              school.raipursolutions.com (Nginx TLS → frontend + backend)
```

| Component | File |
|-----------|------|
| Compose stack | `docker-compose.staging.yml` |
| Django settings | `config.settings.staging` |
| Nginx (HTTPS) | `nginx/nginx.staging.conf` |
| Nginx (HTTP bootstrap) | `nginx/nginx.staging.http-only.conf` |
| Env template | `.env.staging.example` |
| First-time setup | `scripts/staging-bootstrap.sh` |
| Deploy | `scripts/staging-deploy.sh` |
| Rollback | `scripts/staging-rollback.sh` |
| Health check | `scripts/staging-healthcheck.sh` |
| SSL init | `scripts/staging-init-ssl.sh` |
| CI/CD | `.github/workflows/deploy-staging.yml` |

## Branch strategy

| Branch | Behavior |
|--------|----------|
| `main` | CI on push → auto-deploy to staging on success |
| `develop` | CI only (no deploy) |
| Feature branches | CI on PR to `main` / `develop` |

## One-time server setup

### 1. Server requirements

- Ubuntu 22.04+ (or similar Linux)
- Docker Engine 24+ and Docker Compose v2
- 4 GB RAM minimum recommended
- Ports **80** and **443** open
- DNS **A record**: `school.raipursolutions.com` → server IP

### 2. Clone repository

**Raipur Solutions server (`web1`, user `raipu622`)** — deploy alongside existing apps:

```bash
mkdir -p ~/apps/school-erp
git clone https://github.com/Raipursolution123/sch.git ~/apps/school-erp
cd ~/apps/school-erp
```

Existing layout on this host:

```
~/apps/alumni-app
~/apps/school-erp-admin    # separate project — do not overwrite
~/apps/school-erp          # this staging stack (new)
```

**Dedicated VPS (optional):**

```bash
sudo mkdir -p /opt/school-erp
sudo chown "$USER":"$USER" /opt/school-erp
git clone https://github.com/Raipursolution123/sch.git /opt/school-erp
cd /opt/school-erp
```

### 3. Configure environment

```bash
cp .env.staging.example .env
nano .env   # set SECRET_KEY, DB passwords, CERTBOT_EMAIL
chmod 600 .env
```

### 4. GHCR access (private packages)

If the GitHub repo/packages are private, log in on the server:

```bash
echo <GITHUB_PAT_WITH_read:packages> | docker login ghcr.io -u <github-username> --password-stdin
```

### 5. Bootstrap (schema + SSL + first deploy)

```bash
chmod +x scripts/staging-*.sh
./scripts/staging-bootstrap.sh
```

This will:

1. Start MySQL and Redis
2. Load `schema.sql` + `basic_seed.sql` (first run only)
3. Build and start the app stack
4. Run `initial_setup` (creates demo school + admin)
5. Obtain Let's Encrypt certificate
6. Switch Nginx to HTTPS

**Default admin after bootstrap:** `admin@demo.com` / `Admin@123` — change immediately.

### 6. GitHub Actions secrets

Add these in **Settings → Secrets and variables → Actions**:

| Secret | Example | Purpose |
|--------|---------|---------|
| `STAGING_HOST` | `web1` or server IP | Server hostname or IP |
| `STAGING_USER` | `raipu622` | SSH user |
| `STAGING_SSH_KEY` | private key PEM | Deploy key (no passphrase) |
| `STAGING_APP_PATH` | `/home/raipu622/apps/school-erp` | Repo path on server |
| `STAGING_SSH_PORT` | `22` | Optional SSH port |

Ensure the deploy user's SSH key is in `~/.ssh/authorized_keys` and has `docker` + `git` access to the app path.

> **Shared host note:** If `alumni-app` or `school-erp-admin` already bind ports 80/443, coordinate with your panel (`domains/`, `public_html/`) or map staging Nginx to alternate host ports in `.env` (`HTTP_PORT`, `HTTPS_PORT`) and reverse-proxy from the main web server.

## Continuous deployment flow

1. Developer merges PR to `main`
2. **CI** runs (lint, test, build)
3. **Deploy Staging** runs on CI success:
   - Builds `backend` and `frontend` images
   - Pushes to `ghcr.io/raipursolution123/sch/backend:<sha>` and `frontend:<sha>`
   - SSH to server → `staging-deploy.sh <short-sha>`
4. Deploy script:
   - `git pull` latest compose/nginx/scripts
   - `docker compose pull` new images
   - `docker compose up -d --wait` (recreates app containers)
   - Runs framework migrations
   - Health check → rollback on failure

### Manual deploy

GitHub → Actions → **Deploy Staging** → Run workflow.

Or on the server:

```bash
cd /home/raipu622/apps/school-erp
./scripts/staging-deploy.sh latest
```

## Database strategy

| Layer | Strategy |
|-------|----------|
| Business schema | Frozen `backend/seeds/schema.sql` — loaded once at bootstrap |
| Product seed | `backend/seeds/basic_seed.sql` — loaded once at bootstrap |
| School data | `python manage.py initial_setup` — idempotent (skips if exists) |
| Django framework | `migrate` on every deploy (Celery beat, sessions, etc.) |

**Data persists** across deploys via the `mysql_data` Docker volume. Deploys do **not** wipe the database.

To reset staging DB (destructive):

```bash
docker compose -f docker-compose.staging.yml down
docker volume rm school_staging_mysql_data
./scripts/staging-bootstrap.sh
```

## Static & media files

| Type | Handling |
|------|----------|
| Static | `collectstatic` on backend container start → `static_volume` → Nginx `/static/` |
| Media | `media_volume` shared backend ↔ Nginx `/media/` |
| Frontend assets | Baked into frontend image at build time |

Volumes survive container recreation. Only wiped if volumes are explicitly removed.

## Zero-downtime & rollback

Staging uses **rolling container recreation** (not blue-green):

- MySQL, Redis, and volumes stay up during deploy
- Backend/frontend/nginx recreated with `--wait` until healthchecks pass
- Brief API unavailability (seconds) possible during backend swap

**Automatic rollback:** if health check fails, `staging-rollback.sh` restores the previous image tag from `.deploy/previous`.

**Manual rollback:**

```bash
./scripts/staging-rollback.sh
```

## Health checks

| Endpoint | Purpose |
|----------|---------|
| `GET /health/` | Liveness — always 200 if Django is up |
| `GET /health/ready/` | Readiness — DB + onboarding status |

Docker healthchecks are configured on backend, frontend, and nginx.

```bash
./scripts/staging-healthcheck.sh
curl https://school.raipursolutions.com/health/
```

## Logging

All staging containers use json-file logging with rotation (10 MB × 5 files).

```bash
# Tail all services
docker compose -f docker-compose.staging.yml logs -f

# Single service
docker compose -f docker-compose.staging.yml logs -f backend
```

## Container restart policy

All services use `restart: unless-stopped` — containers restart after server reboot or crash, but respect manual `docker compose stop`.

## SSL renewal

The `certbot` service in compose renews certificates automatically every 12 hours. Nginx reload is handled by certbot's deploy hooks (renew only; reload nginx manually if needed after renewal):

```bash
docker compose -f docker-compose.staging.yml exec nginx nginx -s reload
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Deploy fails at pull | Run `docker login ghcr.io` on server |
| 502 Bad Gateway | `docker compose -f docker-compose.staging.yml ps` — wait for backend healthy |
| `/health/ready/` 503 | Run `docker compose ... exec backend python manage.py check_onboarding` |
| SSL cert missing | `./scripts/staging-init-ssl.sh` |
| Wrong nginx config | Set `NGINX_STAGING_CONF=nginx.staging.http-only.conf` in `.env` for HTTP-only |

## What is intentionally relaxed (vs production)

- Frontend still uses mock data (`USE_MOCK = true`) until backend APIs ship
- Browsable API enabled in staging settings
- Default demo admin may exist
- Media files served without auth
- No Redis password
- Shorter HSTS, no preload

These are acceptable for a shared dev/staging server and should be tightened before a production launch.
