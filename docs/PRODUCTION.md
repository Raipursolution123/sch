# Production Operations Runbook

Manual production releases for School ERP. Staging auto-deploys from `main`; production is **workflow_dispatch only**.

## Components

| Component | File |
|-----------|------|
| Compose stack | `docker-compose.prod.yml` |
| Django settings | `config.settings.production` |
| Nginx (TLS) | `nginx/nginx.prod.conf` |
| Deploy | `scripts/prod-deploy.sh` |
| Backup | `scripts/prod-backup.sh` |
| CI/CD | `.github/workflows/deploy-production.yml` |

## Required GitHub secrets

| Secret | Purpose |
|--------|---------|
| `PRODUCTION_HOST` | Server hostname / IP |
| `PRODUCTION_USER` | SSH user |
| `PRODUCTION_SSH_KEY` | Private key |
| `PRODUCTION_SSH_PORT` | Optional (default 22) |
| `PRODUCTION_APP_PATH` | Absolute path to repo on server |

## Deploy

1. Ensure staging is healthy on the same commit.
2. Run **Deploy Production** workflow with confirm input `deploy`.
3. Workflow builds images, pushes to GHCR, SSHs to the server, and runs `./scripts/prod-deploy.sh <short-sha>`.

Manual server deploy:

```bash
cd /path/to/school-erp
./scripts/prod-backup.sh          # recommended before release
./scripts/prod-deploy.sh <sha>
```

## Health checks

After deploy:

```bash
BASE_URL=https://your-domain ./scripts/prod-healthcheck.sh
```

Manual probes: `GET /health/` (liveness), `GET /health/ready/` (DB + onboarding).

1. Replace `PROD_DOMAIN` in `nginx/nginx.prod.conf` with the real hostname (or template cert paths from `SSL_CERT_PATH` / `SSL_KEY_PATH`).
2. Mount Let's Encrypt certs into the nginx container (same pattern as staging).
3. Set `NGINX_PROD_CONF=nginx.prod.conf` and publish ports 80/443.

## Backups

```bash
./scripts/prod-backup.sh /var/backups/school-erp
```

Produces:

- `db_<name>_<timestamp>.sql.gz` — mysqldump via the MySQL container
- `media_<timestamp>.tar.gz` — media volume archive

Retain off-server copies (S3 / object storage) per your retention policy.

## Sentry (optional)

Set in production `.env`:

```bash
SENTRY_DSN=https://...@o....ingest.sentry.io/...
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.0
```

Install `sentry-sdk` in the backend image when ready; settings skip init if the package is missing.

## Rollback

1. Note the previous good tag in `.deploy/previous` (or last known SHA).
2. `./scripts/prod-deploy.sh <previous-sha>`
3. Verify `/health/` and smoke-test login + one critical module.
