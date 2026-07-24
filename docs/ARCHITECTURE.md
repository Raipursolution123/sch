# School ERP — Architecture Overview

**Last updated:** 2026-07-20

## System shape

```
Browser (React SPA)
    ↓ HTTPS
nginx (gzip, TLS, static + proxy)
    ↓
Django REST API (backend/)
    ↓
MySQL (legacy Smart School schema, managed=False models)
Redis (cache, JWT refresh blacklist)
```

## Backend (`backend/`)

| Layer | Location | Role |
|-------|----------|------|
| **URLs** | `apps/<domain>/urls.py` | Route mounting under `/api/v1/` |
| **Views** | `apps/<domain>/api/views/` | HTTP handlers, RBAC, pagination |
| **Serializers** | `apps/<domain>/api/serializers/` | Input validation, output shape |
| **Services** | `apps/<domain>/services/` | Business logic, transactions |
| **Selectors** | `apps/<domain>/selectors/` | Read/query helpers (no side effects) |
| **Domain** | `apps/<domain>/domain/` | Exceptions, validators |
| **Models** | `apps/<domain>/models/` | Unmanaged ORM maps to legacy tables |

### Shared infrastructure

- **`common/responses/api.py`** — `APIResponse.success()` / `.error()` envelope
- **`common/pagination/standard.py`** — `StandardResultsSetPagination` → `{count, next, previous, results}`
- **`common/exceptions/legacy_errors.py`** — `legacy_domain_error_response()` for domain exceptions
- **`common/views/legacy_crud_helpers.py`** — `paginate_list_response()`, `validation_error_response()`
- **`common/cache/reference_cache.py`** — Redis-backed session + permission cache
- **`core/permissions/legacy_privilege.py`** — `HasLegacyPrivilege` RBAC guard

### RBAC

Legacy schema: `permission_group` → `permission_category` → `roles_permissions`.

Views declare `legacy_module_short_code` + `legacy_permission_category`. See `docs/RBAC.md`.

## Frontend (`frontend/src/`)

| Layer | Location | Role |
|-------|----------|------|
| **Routes** | `routes/admin-routes.tsx` | Lazy-loaded page routes |
| **Features** | `features/<domain>/` | Page + local components |
| **Hooks** | `hooks/` | React Query wrappers |
| **Services** | `services/api/` | Axios API clients |
| **Types** | `types/` (import as `@app-types`) | Shared TypeScript types |
| **Constants** | `constants/` | Routes, nav, API endpoints, query keys |

### Conventions

- Path aliases: `@app-types`, `@hooks`, `@components`, `@services`, `@constants`, `@utils`
- Reference data hooks use `REFERENCE_DATA_STALE_TIME` (30 min) from `constants/query-stale-times.ts`
- List pages follow `ModuleListPack` + `PermissionButton` + `ConfirmDialog` pattern
- API list extraction via `utils/api-response.ts` (`extractList`, `extractCount`)

## Deployment

- **Docker Compose** — `docker-compose.yml` (backend, frontend, nginx, redis, mysql)
- **nginx** — `nginx/nginx.staging.conf`, `nginx/nginx.prod.conf` (gzip enabled)
- **CI** — GitHub Actions (backend lint/test, frontend lint/typecheck)

## Adding a new CRUD module

1. Backend: model (if new table) → selector → service → serializer → view → urls → RBAC category in seed
2. Frontend: types → service → hooks → page → route → nav item → `implemented-paths.ts`
3. Tests: service unit tests (mocked), hook error handling with `getApiErrorMessage`
