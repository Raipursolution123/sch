# Design: General Settings (School Settings)

**Status:** IMPLEMENTED — ready for review / smoke test  
**Decisions locked:** A yes · B fine-grained · C no currency sync · D CI includes apps/settings · E no auto-create  
**Module:** `system_settings`  
**Permission category:** `general_setting`  
**Primary table:** `sch_settings` (`managed=False`)  
**Legacy screen:** `schsettings/index` (+ hidden tabs: fees, attendance, maintenance, etc.)  
**Route (unchanged):** `/settings/general`  
**API base (unchanged):** `/api/v1/settings/general/`

---

## 1. Executive summary

General Settings already has a working **MVP UI** (5 tabs) and a monolithic `GeneralSettingsView`. This design is a **Session-parity refactor**, not a greenfield feature.

**Goal:** Harden the existing surface so it matches the Session module architecture:

- Layered backend (domain → selectors → service → API)
- Legacy RBAC (`HasLegacyPrivilege` + `general_setting`)
- Frozen-schema-safe reads/writes (`sch_settings` id=1 only; **never auto-create**)
- Explicit field allowlists and validation
- Clear ownership boundaries with Session / Currency / Languages

**Out of scope for this slice:** Languages, Currency CRUD, System Fields, logo upload, online admission, SMS/email/payment configs, Roles.

---

## 2. Current state (as-is)

### What works

| Layer | Status |
|-------|--------|
| Frontend page | `features/settings/general/` — 5 tabs via `ModuleSettingsPack` |
| Zod schemas | Per-tab validation present |
| API | `GET` + `PATCH /settings/general/` |
| Types | `types/settings/general.ts` — ~25 fields |
| Route / nav | `/settings/general`, permission key `general_setting` |

### What is wrong (must fix)

| Issue | Risk |
|-------|------|
| `permission_classes = [AllowAny]` + string role checks | Same anti-pattern Session removed |
| All logic in `views.py` (~160 lines for general alone) | Untestable, inconsistent with Session |
| `SchSettings.objects.first()` | Non-deterministic if multiple rows; Session already uses `id=1` |
| **Auto-create** `SchSettings(id=1)` when missing | Violates frozen schema; invents incomplete row with missing NOT NULL columns |
| No DRF serializers / domain validators | Invalid values can hit DB |
| PATCH accepts any of the 25 keys with no type coercion | Frontend Zod helps; API is open |
| `settings.manage` is a coarse FE permission | Maps to many legacy keys; Session already introduced fine-grained `sessions.*` |
| `session_id` not in API (good) but currency fields duplicate Currency module | Ownership unclear |
| No unit tests | Regressions likely |

### Database contract notes

- Table: `sch_settings` — **single-row school config** (legacy uses `id = 1`).
- Model: `apps.settings.models.sch_settings.SchSettings` — `managed=False`, ~160 columns.
- Session module already writes `session_id` via `update_sch_settings_session_id()`.
- This module **must not** create rows, delete rows, or mutate `session_id`.

---

## 3. Scope

### In scope (this implementation)

1. Refactor backend General Settings into layered architecture (mirror Session).
2. Wire `IsAuthenticated` + `HasLegacyPrivilege` (`general_setting`, module `system_settings`).
3. Read/update **only** the MVP field set (5 tabs) on `sch_settings` where `id=1`.
4. Harden validation (serializers + domain validators).
5. Align frontend permissions with legacy (`general_setting` → fine-grained FE keys).
6. Add unit tests for service + validators.
7. Keep UI tabs and UX largely as-is (polish only if needed for RBAC / error display).

### Explicitly out of scope

| Item | Owner / later |
|------|----------------|
| Languages CRUD | Separate settings screen (`language`) |
| Currency CRUD / activate | Separate settings screen (`currency`) |
| Logo / admin background uploads | Legacy `schsettings/logo` — media pipeline later |
| System Fields (student/staff form toggles) | `system_field` — dozens of int flags on same table |
| Online admission settings | `online_admission` |
| SMS / Email / Payment / Print header | Separate System Settings submenus |
| Changing `session_id` | **Session module only** |
| Creating / deleting `sch_settings` rows | Forbidden |

---

## 4. Field map (MVP allowlist)

Only these columns are readable/writable by General Settings API.

### Tab: School Profile

| API field | DB column | Type | Notes |
|-----------|-----------|------|-------|
| `name` | `name` | string ≤100 | Required (non-empty after trim) |
| `email` | `email` | string ≤100 | Email format when non-empty |
| `phone` | `phone` | string ≤50 | Optional |
| `address` | `address` | text | Optional |
| `dise_code` | `dise_code` | string ≤50 | Optional |

### Tab: Regional

| API field | DB column | Type | Allowed values |
|-----------|-----------|------|----------------|
| `timezone` | `timezone` | string | Allowlist (IST, UTC, Dubai, Singapore, London, NY) — extendable |
| `date_format` | `date_format` | string | `d-m-Y`, `m-d-Y`, `Y-m-d`, `d/m/Y`, `d.M.Y` |
| `time_format` | `time_format` | string | `12-hour`, `24-hour` |
| `start_month` | `start_month` | string | January–December |
| `start_week` | `start_week` | string | Monday–Sunday |
| `day_off` | `day_off` | string | Free text / weekday name (legacy flexible) |
| `is_rtl` | `is_rtl` | string | `enabled` \| `disabled` |

### Tab: Attendance

| API field | DB column | Type | Notes |
|-----------|-----------|------|-------|
| `attendence_type` | `attendence_type` | int | Legacy spelling preserved; 0–10 |
| `low_attendance_limit` | `low_attendance_limit` | float | 0–100 |
| `class_teacher` | `class_teacher` | string | `enabled` \| `disabled` |

### Tab: Fees (school-level fee *preferences*, not Currency master)

| API field | DB column | Type | Notes |
|-----------|-----------|------|-------|
| `currency` | `currency` | string | Code stored on sch_settings (legacy) |
| `currency_symbol` | `currency_symbol` | string | Display symbol |
| `currency_place` | `currency_place` | string | `before_number` \| `after_number` \| `before_with_space` \| `after_with_space` |
| `collect_back_date_fees` | `collect_back_date_fees` | int | 0 \| 1 |
| `fee_due_days` | `fee_due_days` | int | 0–365 |
| `is_duplicate_fees_invoice` | `is_duplicate_fees_invoice` | string | `"0"` \| `"1"` (legacy CharField) |

**Ownership note:** `currencies` table remains owned by Currency module. General Settings continues to store the *active display preferences* on `sch_settings` as legacy does. A later enhancement may sync from activated currency; **not in this slice**.

### Tab: Maintenance

| API field | DB column | Type | Notes |
|-----------|-----------|------|-------|
| `maintenance_mode` | `maintenance_mode` | int | 0 \| 1 |
| `lock_grace_period` | `lock_grace_period` | int | 0–365 |
| `student_panel_login` | `student_panel_login` | int | 0 \| 1 |
| `parent_panel_login` | `parent_panel_login` | int | 0 \| 1 |

### Response-only (read, never PATCH)

| Field | Source | Purpose |
|-------|--------|---------|
| `id` | `sch_settings.id` | Always 1 |
| `session_id` | `sch_settings.session_id` | **Read-only** in response for UI context (optional); never writable here |
| `updated_at` | `sch_settings.updated_at` | Audit |

**Recommendation:** Include `session_id` (and optionally resolved `session` label via selector) as **read-only** so Settings UI can show “Current session: 2026-27” without calling Session activate APIs. Do **not** allow PATCH of `session_id`.

---

## 5. API contract

### Endpoints

| Method | Path | Auth | Privilege | Purpose |
|--------|------|------|-----------|---------|
| `GET` | `/api/v1/settings/general/` | Authenticated | `general_setting` / `can_view` | Load settings |
| `PATCH` | `/api/v1/settings/general/` | Authenticated | `general_setting` / `can_edit` | Partial update (one tab or multi-field) |
| `PUT` | `/api/v1/settings/general/` | Authenticated | `general_setting` / `can_edit` | Same as PATCH (alias) |

No POST. No DELETE. No create.

### Permissions (view attributes)

```python
permission_classes = [IsAuthenticated, HasLegacyPrivilege]
legacy_module_short_code = "system_settings"
legacy_permission_category = "general_setting"
# GET → can_view, PATCH/PUT → can_edit (DEFAULT_METHOD_ACTIONS)
```

### Request (PATCH)

Partial body — only keys present are updated. Unknown keys → `400` with list of rejected fields (strict allowlist).

Example (School Profile tab save):

```json
{
  "name": "Demo Public School",
  "email": "admin@school.edu",
  "phone": "9876543210",
  "address": "Raipur",
  "dise_code": "CG-123"
}
```

### Response (200)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "...",
    "...all MVP fields...",
    "session_id": 5,
    "updated_at": "2026-07-10"
  },
  "message": "General settings retrieved successfully."
}
```

### Errors

| Condition | HTTP | Message |
|-----------|------|---------|
| Not authenticated | 401 | Standard |
| Missing privilege / module inactive | 403 | DRF permission denied |
| Row `id=1` missing | 404 | `School settings not configured.` — **do not create** |
| Unknown field in PATCH | 400 | `Unknown fields: ...` |
| Validation failure | 400 | Field-specific message |
| Attempt to PATCH `session_id` / `id` | 400 | `Field is read-only.` |

---

## 6. Architecture

Mirror Session module layout under `apps/settings`:

```
backend/apps/settings/
├── api/
│   ├── serializers/
│   │   └── general_settings.py      # GET shape + PATCH allowlist serializer
│   └── views/
│       └── general_settings.py      # GeneralSettingsView (thin)
├── domain/
│   ├── general_settings_exceptions.py
│   └── general_settings_validators.py
├── selectors/
│   └── general_settings_selectors.py  # get_sch_settings(), to_dict()
├── services/
│   └── general_settings_service.py    # get / update
├── models/sch_settings.py             # UNCHANGED (managed=False)
├── views.py                           # REMOVE GeneralSettingsView only
│                                      # (Languages/Currencies stay for now)
└── urls.py                            # Point general/ to new view
```

### Service responsibilities

```text
GeneralSettingsService.get()
  → selectors.get_sch_settings_or_raise()
  → selectors.settings_to_dict(settings)

GeneralSettingsService.update(payload: dict)
  → validate_unknown_keys(payload)
  → reject_readonly_keys(payload)
  → validate_and_normalize(payload)   # domain validators
  → apply fields on settings instance
  → settings.updated_at = today
  → settings.save(update_fields=[...only changed + updated_at])
  → return settings_to_dict(settings)
```

### Selector rules

```python
def get_sch_settings() -> SchSettings | None:
    return SchSettings.objects.filter(id=1).first()

def get_sch_settings_or_raise() -> SchSettings:
    settings = get_sch_settings()
    if settings is None:
        raise SchSettingsNotFoundError()
    return settings
```

**Never** `SchSettings.objects.create(...)`.  
**Never** `SchSettings.objects.first()` without `id=1`.

### Transaction

PATCH update wrapped in `transaction.atomic()` at the **view** layer (same pattern as Session activate/delete).

---

## 7. Business rules

1. **Single row:** Only `sch_settings.id = 1` is the school config.
2. **No invent:** Missing row → 404; ops/seed must provide it (legacy DB always has it).
3. **Partial update:** Only provided allowlisted keys change; others untouched.
4. **Session ownership:** `session_id` is read-only here; Session module owns activate.
5. **Strict allowlist:** Reject unknown keys (prevents accidental writes to System Field flags).
6. **Preserve legacy types:** Keep `attendence_type` spelling; keep `is_duplicate_fees_invoice` as string `"0"|"1"`.
7. **updated_at:** Set to `date.today()` on every successful PATCH (matches Session / legacy date field).
8. **Module gate:** `system_settings` must be active in `permission_group`.
9. **Superadmin bypass:** Via existing `legacy_rbac.is_superadmin_user`.

---

## 8. Validation rules

| Field | Rule |
|-------|------|
| `name` | Required if present; trim; length 1–100 |
| `email` | If non-empty, valid email; max 100 |
| `phone` | Max 50 |
| `address` | Max reasonable text (e.g. 5000) |
| `dise_code` | Max 50 |
| `timezone` | Must be in allowlist |
| `date_format` | Must be in allowlist |
| `time_format` | `12-hour` \| `24-hour` |
| `start_month` | January–December |
| `start_week` | Monday–Sunday |
| `is_rtl` | `enabled` \| `disabled` |
| `attendence_type` | int 0–10 |
| `low_attendance_limit` | number 0–100 |
| `class_teacher` | `enabled` \| `disabled` |
| `currency` / `currency_symbol` | Non-empty if present; max 50 |
| `currency_place` | Enum of 4 placements |
| `collect_back_date_fees` | 0 \| 1 |
| `fee_due_days` | int 0–365 |
| `is_duplicate_fees_invoice` | `"0"` \| `"1"` |
| `maintenance_mode`, panel logins | 0 \| 1 |
| `lock_grace_period` | int 0–365 |

Frontend Zod schemas already approximate this — keep them; align messages with backend.

---

## 9. Frontend changes

### Keep

- Route `/settings/general`
- Feature folder `features/settings/general/` (correct domain — unlike Sessions which moved to academics)
- 5-tab UX and `ModuleSettingsPack`
- Existing Zod schemas (minor alignment only)

### Change

| Item | Change |
|------|--------|
| Permissions | Add `general_settings.view` / `general_settings.edit` (or reuse `settings.manage` mapped **only** to `general_setting` for this page) |
| PermissionButton | Gate Save buttons with edit privilege |
| PermissionGate | Hide/disable tabs or show read-only if view-only |
| Hooks | Optionally relocate to `features/settings/general/hooks/`; keep `@hooks/useGeneralSettings` as re-export |
| Types | Add optional read-only `session_id`; document deprecated fields if any |
| permission-resolver | Ensure `general_settings.*` → `['general_setting']` |
| Error UX | Surface API validation messages on toast (already via `getApiErrorMessage`) |

**Recommended FE permission model (Session-style):**

```ts
'general_settings.view'
'general_settings.edit'
```

Map both to legacy `general_setting`. Deprecate using coarse `settings.manage` on this page only (Languages/Currency can keep `settings.manage` until those modules are refactored).

### Do not change

- Tab structure / labels
- Endpoint path
- Currency master data UI (separate page)

---

## 10. File structure (target)

### Backend (new)

```
backend/apps/settings/api/__init__.py
backend/apps/settings/api/serializers/__init__.py
backend/apps/settings/api/serializers/general_settings.py
backend/apps/settings/api/views/__init__.py
backend/apps/settings/api/views/general_settings.py
backend/apps/settings/domain/__init__.py
backend/apps/settings/domain/general_settings_exceptions.py
backend/apps/settings/domain/general_settings_validators.py
backend/apps/settings/selectors/__init__.py
backend/apps/settings/selectors/general_settings_selectors.py
backend/apps/settings/services/__init__.py
backend/apps/settings/services/general_settings_service.py
backend/apps/settings/tests/__init__.py
backend/apps/settings/tests/test_general_settings_service.py
backend/apps/settings/tests/test_general_settings_validators.py
```

### Backend (modified)

```
backend/apps/settings/urls.py          # wire new view
backend/apps/settings/views.py         # delete GeneralSettingsView only
```

### Frontend (modified)

```
frontend/src/constants/permissions.ts
frontend/src/types/permissions.ts
frontend/src/services/navigation/permission-resolver.ts
frontend/src/types/settings/general.ts
frontend/src/features/settings/general/components/*Tab.tsx  # PermissionButton keys
frontend/src/hooks/useGeneralSettings.ts                   # optional re-export
```

### Unchanged

```
backend/apps/settings/models/sch_settings.py
frontend/src/features/settings/general/pages/GeneralSettingsPage.tsx  # structure
frontend/src/routes/admin-routes.tsx                                  # path
```

---

## 11. Test plan

### Unit (pytest, mocked ORM — same style as Session)

| Test | Expectation |
|------|-------------|
| `get` when row exists | Returns dict with MVP fields |
| `get` when missing | Raises `SchSettingsNotFoundError` |
| `update` school profile | Saves only those fields |
| `update` rejects unknown key | Validation error |
| `update` rejects `session_id` | Read-only error |
| `update` invalid email | Validation error |
| `update` invalid timezone | Validation error |
| `update` sets `updated_at` | Called with today |
| `save(update_fields=...)` | Only changed columns |

### Manual smoke (Docker UI)

1. Open `/settings/general` — all 5 tabs load.
2. Save School Profile — toast success; reload persists.
3. Save Regional / Attendance / Fees / Maintenance — each persists.
4. User without `general_setting` edit — Save hidden/disabled; GET may 403.
5. Confirm Session page activate still updates `session_id`; General Settings shows read-only session if included.
6. Confirm no new `sch_settings` row created if id=1 missing (404).

### CI

- Black / isort on new settings packages (extend CI paths if needed — today CI only lints `apps/accounts`; **recommend adding `apps/settings` to backend-lint** in this PR).
- Frontend: lint, prettier, typecheck, `ds:audit`, build.
- Pytest for new tests.

---

## 12. Migration / rollout

- **No DB migrations.**
- **No API path change** — frontend keeps working during deploy.
- **Breaking (intentional):**
  - Auto-create of missing `sch_settings` removed → 404 if DB incomplete (correct for production legacy DBs).
  - Stricter validation may reject previously accepted junk values.
  - Auth: unauthenticated / wrong privilege → 401/403 (was soft-checked in view).

---

## 13. Implementation order (after approval)

1. Domain exceptions + validators + tests  
2. Selectors + service + tests  
3. Serializers + API views + URL wire  
4. Remove `GeneralSettingsView` from `views.py`  
5. Frontend permission keys + Save button gates  
6. Optional read-only `session_id` in response + small UI hint  
7. Extend CI backend-lint to `apps/settings`  
8. Local smoke + push  

**Do not start Languages or Currency in the same PR.**

---

## 14. Open decisions (need your call)

| # | Decision | Recommendation |
|---|----------|----------------|
| A | Include read-only `session_id` (+ label) in GET response? | **Yes** — cheap context; Session owns writes |
| B | Fine-grained FE perms `general_settings.view/edit` vs keep `settings.manage`? | **Fine-grained** — matches Session |
| C | Sync currency fields from Currency activate? | **No** this slice — document as follow-up |
| D | Extend CI Black/isort to `apps/settings`? | **Yes** — prevent format drift |
| E | Auto-create row if missing? | **No** — frozen schema; 404 |

---

## 15. Approval checklist

Approve this design if you agree that we will:

- [ ] Refactor General Settings backend to Session-style layers  
- [ ] Use `HasLegacyPrivilege` + `general_setting`  
- [ ] Never create/delete `sch_settings`; only update id=1  
- [ ] Never write `session_id` from this module  
- [ ] Keep MVP 5-tab field allowlist only  
- [ ] Leave Languages / Currency / System Fields for later  
- [ ] Ship tests + CI path update  

**No code until you approve (and confirm decisions A–E).**
