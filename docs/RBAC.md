# RBAC — Legacy Permission Model

School ERP uses the **legacy Smart School RBAC schema** (`permission_group`, `permission_category`, `roles_permissions`) for both API enforcement and SPA navigation.

## Backend

### Permission check (`HasLegacyPrivilege`)

API views declare:

```python
permission_classes = [IsAuthenticated, HasLegacyPrivilege]
legacy_module_short_code = "homework"  # permission_group.short_code
legacy_permission_category = "homework"  # permission_category.short_code
```

`HasLegacyPrivilege` resolves the HTTP method to an action:

| HTTP method | Action |
|-------------|--------|
| GET, HEAD, OPTIONS | `can_view` |
| POST | `can_add` |
| PUT, PATCH | `can_edit` |
| DELETE | `can_delete` |

Superadmin users (`users.is_superadmin` or role `is_superadmin`) bypass all checks.

### Auth payload

`POST /api/v1/auth/login/` and `GET /api/v1/auth/me/` return:

```json
{
  "legacy_permissions": {
    "homework": { "can_view": true, "can_add": true, "can_edit": true, "can_delete": false }
  },
  "permissions": ["homework", "student", "..."]
}
```

- `legacy_permissions` — full map keyed by `permission_category.short_code`
- `permissions` — categories where `can_view` is true (for nav filtering)

### Module reference

| Module (`permission_group.short_code`) | Categories (`permission_category.short_code`) | API prefix |
|----------------------------------------|-----------------------------------------------|------------|
| `homework` | `homework`, `homework_evaluation`, `daily_assignment` | `/api/v1/academics/homework/` |
| `lesson_plan` | `manage_syllabus_status`, `manage_lesson`, `manage_topic`, … | `/api/v1/academics/lesson-plan/` |
| `account_finance` | `accounts`, `entries`, `trialbalance` | `/api/v1/finance/` |
| `transport` | `routes`, `transport_fees`, … | `/api/v1/transport/` |
| `hostel` | `hostel`, `hostel_rooms`, `hostel_room_type` | `/api/v1/hostel/` |

Seed data: `backend/seeds/basic_seed.sql`.

### Registration lock

Set `ALLOW_REGISTRATION=false` in staging/production `.env`. Default in `config/settings/base.py` is `false`; local dev defaults to `true` in `config/settings/local.py`.

## Frontend

### Navigation

`ADMIN_NAV` items declare `permissionKeys` (legacy category short_codes). `useFilteredNav()` hides items the user cannot view.

### UI permissions (`PermissionButton`, `PermissionGate`)

Modern keys (`students.view`, `fees.manage`, …) map to legacy categories via `PERMISSION_TO_LEGACY` in `frontend/src/services/navigation/permission-resolver.ts`.

`usePermissions()` prefers `user.legacy_permissions` from the backend; falls back to static `ROLE_PERMISSIONS` only when legacy data is absent.

### Route guard

`RoutePermissionGuard` (in `DashboardLayout`) blocks direct URL access when the user lacks `can_view` on any required nav permission key. Dashboard (`/dashboard`) is always allowed for authenticated users. Superadmin bypasses all checks.

## Adding a new protected API

1. Find module + category short_codes in seed SQL or admin UI.
2. Add `HasLegacyPrivilege` + `legacy_module_short_code` + `legacy_permission_category` on the view.
3. Add `permissionKeys` to the matching nav item.
4. Add `PERMISSION_TO_LEGACY` entries for any new UI permission keys.

## Security notes

- Backend enforcement is authoritative; frontend gating is UX only.
- JWT refresh rotation + cache blacklist: `core/auth/jwt_blacklist.py`.
- CI does not yet lint all mounted apps — extend flake8 scope when stabilizing.
