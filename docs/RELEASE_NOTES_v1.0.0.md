# Release Notes — v1.0.0 (draft)

**Target date:** TBD after UAT sign-off  
**Branch:** `main`

## Highlights

- Full core ERP spine: academics, students, attendance, fees, exams, staff, front office, transport, hostel, finance
- Legacy RBAC enforced on backend APIs and frontend route guards
- 64 implemented admin routes with Coming Soon badges for remaining nav items
- Redis-backed reference cache for sessions and permissions
- Docker Compose stacks for dev, staging, and production
- CI: backend lint/test, frontend lint/typecheck/vitest, Docker build + Trivy scan

## Security

- Registration disabled by default (`ALLOW_REGISTRATION=false`)
- JWT refresh rotation with Redis blacklist
- RBAC from `/auth/me` legacy permissions map
- gzip compression on nginx staging/production configs

## Testing

- ~200 backend unit + integration tests
- 14 frontend Vitest tests (utils + permission helpers)
- Staging curl E2E verify script (`scripts/staging-e2e-verify.sh`)

## Upgrade / deploy

See `docs/PRODUCTION.md` and `.env.production.example`.

```bash
./scripts/prod-backup.sh
./scripts/prod-deploy.sh <git-sha>
./scripts/prod-healthcheck.sh
```

## Known limitations

- ~85 nav items still Coming Soon (future phases)
- Offline bank payments UI not implemented
- Legacy MySQL schema (`managed=False`) — indexes applied at DB level

---

_UAT sign-off: see `docs/UAT_CHECKLIST.md`_
