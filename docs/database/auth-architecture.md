# Authentication Architecture Review

**Database:** `db_current`  
**Status:** Accounts domain aligned to legacy schema  
**Date:** 2026-06-25

---

## 1. AUTH_USER_MODEL

```python
AUTH_USER_MODEL = "accounts.User"
```

| Property | Value |
|----------|-------|
| Django app label | `accounts` |
| Model class | `User` |
| Physical table | `users` |
| Primary key | `id` (`int(11)` auto increment) |
| Login field | `username` (`varchar(50)`, **not unique** in DB) |
| `managed` | `False` |

The model is a plain `models.Model` — **not** `AbstractBaseUser` / `PermissionsMixin` — to avoid Django adding columns (`last_login`, M2M permission tables) that do not exist in `db_current`.

---

## 2. Login Flow

```
Client POST /api/v1/auth/login/  { username, password }
        ↓
LoginSerializer validation
        ↓
django.contrib.auth.authenticate()
        ↓
UsernameBackend (apps.accounts.backends.UsernameBackend)
        ↓
User.objects.get(username=username)
        ↓
User.check_password() → legacy_password.verify_legacy_password()
        ↓
User.is_active_user  (is_active varchar: "yes"/"1"/"true")
        ↓
RefreshToken.for_user(user)  → JWT access + refresh tokens
        ↓
APIResponse { user, tokens }
```

**Endpoints:**

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/auth/login/` | Primary login (username + password → JWT) |
| POST | `/api/v1/auth/token/` | SimpleJWT token obtain (parallel path) |
| POST | `/api/v1/auth/token/refresh/` | Refresh access token |
| POST | `/api/v1/auth/logout/` | Client-side logout (no server blacklist) |
| GET | `/api/v1/auth/me/` | Current user profile |
| POST | `/api/v1/auth/register/` | **501** — legacy ERP workflow only |

**Authentication backend:**

```python
AUTHENTICATION_BACKENDS = [
    "apps.accounts.backends.UsernameBackend",
]
```

---

## 3. JWT Flow

| Setting | Value |
|---------|-------|
| Library | `djangorestframework-simplejwt` |
| DRF auth class | `JWTAuthentication` |
| Access token lifetime | 30 minutes (configurable) |
| Refresh token lifetime | 7 days (configurable) |
| `USER_ID_FIELD` | `id` (integer PK from `users`) |
| `USER_ID_CLAIM` | `user_id` |
| Token rotation | **Disabled** |
| Blacklist | **Disabled** (no `token_blacklist` tables in `db_current`) |

**Request authentication:**

```
Authorization: Bearer <access_token>
        ↓
JWTAuthentication validates token
        ↓
Resolves user via AUTH_USER_MODEL pk (users.id)
        ↓
request.user = User instance
```

**Legacy parallel:** `users_authentication` table stores legacy session tokens (`token`, `users_id`, `staff_id`, `expired_at`). This is **not yet integrated** with SimpleJWT — it remains available for backward compatibility during migration.

---

## 4. Role / Permission Flow

### Legacy schema (source of truth)

```
users.role          → varchar(30) role slug (e.g. "admin", "student", "parent")
roles               → role definitions (slug, is_superadmin, is_system)
roles_permissions   → role_id + perm_cat_id + can_view/add/edit/delete
permission_category → granular permission categories (linked to permission_group)
permission_group    → permission module groups
permission_student  → student/parent panel permissions
staff_roles         → staff_id + role_id mapping
```

### Django models (all `managed = False`)

| Table | Model |
|-------|-------|
| `users` | `User` |
| `roles` | `Role` |
| `roles_permissions` | `RolePermission` |
| `permission_category` | `PermissionCategory` |
| `permission_group` | `PermissionGroup` |
| `permission_student` | `PermissionStudent` |
| `staff_roles` | `StaffRole` |
| `users_authentication` | `UserAuthentication` |
| `userlog` | `UserLog` |

### Permission checks (API layer)

| Class | Logic |
|-------|-------|
| `IsSuperAdmin` | `Role.objects.filter(slug=user.role, is_superadmin=1).exists()` |
| `HasRolePermission` | Compares `user.role` slug against view's `required_role_slugs`; superadmin bypass |

**Note:** Fine-grained `roles_permissions` (can_view/can_add/can_edit/can_delete per `permission_category`) is modeled but **not yet wired** into DRF permission classes. That belongs in a future service layer.

---

## 5. Legacy Password Handling

**File:** `apps/accounts/services/legacy_password.py`

```python
verify_legacy_password(raw, stored):
    matches if stored equals:
      - raw password (plain text)
      - MD5(raw)
      - SHA1(raw)

hash_legacy_password(raw):
    returns MD5(raw)  # default for new passwords if ever needed
```

| Aspect | Detail |
|--------|--------|
| DB column | `users.password` varchar(50) |
| Django password hashers | **Not used** (would exceed 50 chars) |
| `User.set_password()` | Writes MD5 hash via legacy helper |
| `UserManager.create_user()` | **Raises NotImplementedError** — no API user creation |

**Action required:** Confirm exact hash algorithm used by the live ERP (likely MD5) against a test account before production cutover.

---

## 6. managed=False Policy

| Table origin | `managed` | Rationale |
|--------------|-----------|-----------|
| Existing `db_current` tables | `False` | Django must never CREATE/ALTER/DROP legacy tables |
| Future approved new tables | `True` | Only after explicit approval; Django migrations allowed |

**Current state:** All accounts models use `managed = False`. No `makemigrations` has been applied against business tables.

**Django infrastructure tables** (`django_*`, `auth_*`, Celery beat, JWT blacklist) **do not exist** in `db_current`. Creating them requires explicit approval and likely a separate meta database or approved schema extension.

---

## 7. Known Gaps / Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| `username` not unique in DB | Medium | `UsernameBackend` uses `.get()` — duplicates will raise `MultipleObjectsReturned` |
| Password algorithm unverified | High | Verify against live ERP before go-live |
| `users_authentication` not integrated with JWT | Low | Plan bridge during phased migration |
| `roles_permissions` not enforced in API | Medium | Build permission service before module APIs |
| `staff_roles` not in accounts app mapping | Low | Reclassify to `accounts` domain (currently auto-tagged `staff` by prefix) |
| No server-side logout / token revocation | Low | Accept for now; add approved table or Redis denylist later |

---

## 8. Recommendations Before Next Domain

1. **Confirm password hash** with one known test credential.
2. **Resolve `staff_roles` domain** — RBAC table, should live in `accounts` app.
3. **Reclassify `cbse_*` unclassified tables** → `examinations` (35+ tables mis-tagged).
4. **Create `cyc_*` custom domain** — 40+ school-specific extension tables.
5. **Do not run `migrate`** against `db_current` until Django infra table strategy is approved.
