# Contributor Guide (AGENTS.md)

Guidance for developers and AI agents working on the School ERP codebase.

## Before you start

1. Read `docs/MASTER_CHECKLIST.md` for current phase and progress.
2. Read `docs/ARCHITECTURE.md` for layer conventions.
3. Read `docs/RBAC.md` when touching permissions or nav.

## Workflow

- Work **one phase at a time**; update `MASTER_CHECKLIST.md` after sign-off.
- Do **not** edit plan files in `.cursor/plans/`.
- Keep diffs **focused** — match surrounding code style.
- Run **backend tests** and **frontend typecheck** before sign-off.

## Backend rules

- Business logic in **services**, not views.
- Use `APIResponse` for all JSON responses.
- Use `HasLegacyPrivilege` on staff-facing endpoints; align categories with `seeds/basic_seed.sql`.
- Paginate list endpoints with `StandardResultsSetPagination`; return a flat `results` array.
- Map domain errors via `legacy_domain_error_response()` from `common/exceptions/legacy_errors.py`.
- Invalidate caches on mutations: `invalidate_session_cache()`, `invalidate_user_permissions_cache()`.

## Frontend rules

- Import aliases: `@app-types`, `@hooks`, `@components`, `@services`, `@constants`, `@utils` — not `@/`.
- Centralize API paths in `constants/api-endpoints.ts`.
- Use `getApiErrorMessage(error, fallback)` in mutation `onError` handlers.
- New pages: `ModuleListPack`, `PermissionButton`, `ConfirmDialog` (no `window.confirm`).
- Register routes in `admin-routes.tsx` + `implemented-paths.ts` for nav visibility.

## Testing

```bash
# Backend (from backend/)
python -m pytest apps/ common/ tests/ -q

# Frontend (from frontend/)
npm run test
npm run typecheck
npm run lint
```

## Do not

- Commit unless explicitly asked.
- Force-push to `main`.
- Add Django migrations for `managed = False` legacy models.
- Use `fields = "__all__"` in serializers.
- Skip RBAC on new API views.
