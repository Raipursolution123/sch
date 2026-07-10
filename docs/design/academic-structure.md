# Design: Academic Structure — Classes, Sections, Class Sections

**Status:** IMPLEMENTED  

**Slice:** Session-parity hardening of existing academic structure APIs/UI  
**Module (permission_group):** `academics` (confirm against live `permission_group.short_code`)  
**Legacy screens:** `classes/index`, `sections/index` (+ class↔section assignment)  
**Routes (unchanged):** `/academics/classes`, `/academics/sections`, `/academics/class-sections`  
**API base (unchanged):** `/api/v1/academics/`

---

## 1. Executive summary

Classes, Sections, and Class Sections already have working UIs and large monolithic views in `apps/academics/views.py`. This design is a **Session / General Settings–parity refactor**, not a greenfield build.

**Goal:** Extract layered services for the three related entities, wire legacy RBAC, preserve frozen-schema write semantics, and keep frontend routes/UX stable.

**Implement as one approved design, three ordered backend packages** (Sections → Classes → Class Sections), one PR preferred (or stacked PRs if review prefers).

**Out of scope:** Subjects, Subject Groups, Timetable, Class Teacher, Sessions (already done).

---

## 2. Current state (as-is)

### What works

| Area | Status |
|------|--------|
| Models | `Classes`, `Sections`, `ClassSections` — `managed=False` |
| Frontend | `features/academics/{classes,sections,class-sections}/` |
| APIs | List/create/detail + bulk assign + class-assigned-sections |
| Guards | StudentSession blocks removing mapped sections with active students |
| Soft deactivate | Sections DELETE → `is_active='no'` |

### What is wrong (must fix)

| Issue | Risk |
|-------|------|
| `permission_classes = [AllowAny]` + string role checks | Same anti-pattern Session removed |
| ~1,300+ lines of class/section logic still in `views.py` | Untestable, inconsistent responses |
| Mixed response shapes (`APIResponse` vs raw `Response`) | Client fragility |
| Classes `POST` appears to skip admin gate after auth | Privilege hole |
| Coarse FE permission `academics.manage` | Not Session-style fine-grained |
| Classes DELETE hard-deletes inactive class + mappings | Dangerous vs soft-delete elsewhere |
| Duplicate `except Exception` blocks in Classes update | Dead / noisy code |
| No unit tests for class/section services | Regressions likely |
| Inconsistent payload keys (`section` vs `section_name` on update response) | FE bugs |

### Tables (frozen)

| Table | Model | Key columns |
|-------|-------|-------------|
| `classes` | `Classes` | `class` → `class_field`, `sort_order`, `is_hedu_program`, `is_active` |
| `sections` | `Sections` | `section`, `is_active` |
| `class_sections` | `ClassSections` | `class_id`, `section_id`, `is_active` |

Related (read for guards only): `student_session` (`StudentSession`).

---

## 3. Scope

### In scope

1. Refactor **Sections** CRUD into layered API (Session pattern).
2. Refactor **Classes** CRUD (+ nested section ids on create/update) into layered API.
3. Refactor **Class Sections** list/create/detail + **bulk assign** + **assigned-sections-by-class**.
4. Legacy RBAC: `class` and `section` categories under academics module.
5. Fine-grained FE permissions (Session-style).
6. Dependency / student-enrollment guards preserved and tested.
7. Normalize API response envelopes to `APIResponse`.
8. Unit tests + extend CI Black/isort/flake8 to cover new academics packages (already partially covered via Session).

### Out of scope

| Item | Later |
|------|--------|
| Subjects | Separate slice |
| Subject groups / timetable / class teacher | Separate |
| Changing `sessions` | Done |
| Hard schema / migrations | Forbidden |

---

## 4. Permissions

### Legacy

| Entity | `permission_category.short_code` | Module |
|--------|----------------------------------|--------|
| Classes (+ class↔section assignment) | `class` | `academics` |
| Sections | `section` | `academics` |

**Class Sections** screens use the **`class`** privilege (legacy treats mapping as part of class setup). Confirm on live RBAC; if a dedicated category exists, map to it — default assumption: `class`.

### View attributes

```python
# Sections
legacy_module_short_code = "academics"
legacy_permission_category = "section"

# Classes + ClassSections + bulk assign
legacy_module_short_code = "academics"
legacy_permission_category = "class"
```

Method → action: GET `can_view`, POST `can_add`, PUT/PATCH `can_edit`, DELETE `can_delete` (same as Session).

### Frontend (recommended)

```ts
'classes.view' | 'classes.create' | 'classes.edit' | 'classes.delete'
'sections.view' | 'sections.create' | 'sections.edit' | 'sections.delete'
```

Map:

- `classes.*` → `['class']`
- `sections.*` → `['section']`
- Class Sections UI actions → `classes.*` (same legacy `class` key)

Keep `academics.manage` for Subjects until that module is refactored.

---

## 5. API contract

Base: `/api/v1/academics/`

### Sections

| Method | Path | Privilege |
|--------|------|-----------|
| GET | `sections/` | `section` / view |
| POST | `sections/` | `section` / add |
| GET | `sections/<id>/` | `section` / view |
| PATCH/PUT | `sections/<id>/` | `section` / edit |
| DELETE | `sections/<id>/` | `section` / delete → **soft deactivate** |

**Create body:** `{ "section_name": "A" }`  
**Update body:** `{ "section_name"?, "is_active"? }` (`yes`/`no`)  
**List query:** `?active_only=true|false`, pagination  

**Response fields:** `id`, `section_name`, `is_active`, `created_at`, `updated_at`  
(Always use `section_name` — fix current update response that returns `section`.)

### Classes

| Method | Path | Privilege |
|--------|------|-----------|
| GET | `classes/` | `class` / view |
| POST | `classes/` | `class` / add |
| GET | `classes/<id>/` | `class` / view |
| PATCH/PUT | `classes/<id>/` | `class` / edit |
| DELETE | `classes/<id>/` | `class` / delete |

**Create/Update body:**

```json
{
  "class_name": "Class 1",
  "sort_order": 1,
  "is_hedu_program": false,
  "sections": [1, 2]
}
```

- `sections`: optional list of section ids; on create → insert `class_sections` active rows  
- on update → sync mappings (activate listed, deactivate removed) with StudentSession guards  

**List includes** nested active `sections: [{ id, section_name }]`.

**DELETE behavior (decision E):** see open decisions — recommend **soft deactivate** (`is_active='no'`) with guards, not hard delete.

### Class Sections

| Method | Path | Privilege |
|--------|------|-----------|
| GET | `class-sections/` | `class` / view |
| POST | `class-sections/` | `class` / add (single mapping) |
| GET | `class-sections/<id>/` | `class` / view |
| PATCH/PUT | `class-sections/<id>/` | `class` / edit |
| DELETE | `class-sections/<id>/` | `class` / delete → soft deactivate mapping |
| POST | `class-sections/assign/` | `class` / edit (bulk sync) |
| GET | `classes/<class_id>/sections/` | `class` / view (assigned sections for a class) |

**Bulk assign body:** `{ "class_id": 1, "section_ids": [1,2,3] }`  
Semantics (preserve current):

1. Activate or create mappings for each id in `section_ids`
2. Soft-deactivate mappings not in list
3. Block deactivate if `StudentSession` has `is_active='yes'` for that class+section

---

## 6. Business rules

### Sections

1. Name required; unique case-insensitive on `sections.section`.
2. Create defaults `is_active='yes'`.
3. DELETE = soft deactivate (`is_active='no'`), not hard delete.
4. Cannot deactivate if any **active** `class_sections` reference this section.
5. Optional later: block if active `student_session` references section (recommend **yes** — decision C).

### Classes

1. Name required; unique case-insensitive on `classes.class` (`class_field`).
2. `sort_order` integer, default `9999`.
3. `is_hedu_program` stored as `'yes'`/`'no'`; API exposes boolean.
4. Create defaults `is_active='yes'`.
5. Nested `sections` must all exist.
6. Syncing section mappings must not remove a mapping with active students.
7. DELETE: see decision E (prefer soft deactivate + block if active mappings / students).

### Class Sections

1. Unique logical pair `(class_id, section_id)` — create fails if exists (or reactivate if soft-inactive — decision D).
2. Soft deactivate preferred over hard delete.
3. Cannot deactivate mapping with active `StudentSession` for that class+section.
4. Bulk assign is the primary UX path for “assign sections to class”.

### Cross-cutting

- No new tables / migrations.
- `updated_at` = `date.today()` on updates.
- Transactions on multi-row writes (create class+mappings, bulk assign, sync on class update).
- Auth: `IsAuthenticated` + `HasLegacyPrivilege`; module must be active.

---

## 7. Architecture

```
backend/apps/academics/
├── api/views/
│   ├── session.py                 # existing
│   ├── section.py                 # NEW
│   ├── class_.py                  # NEW (avoid keyword `class`)
│   └── class_section.py           # NEW
├── api/serializers/
│   ├── section.py
│   ├── class_.py
│   └── class_section.py
├── domain/
│   ├── section_*.py
│   ├── class_*.py
│   └── class_section_*.py
├── selectors/
│   ├── section_selectors.py
│   ├── class_selectors.py
│   └── class_section_selectors.py
├── services/
│   ├── section_service.py
│   ├── class_service.py
│   └── class_section_service.py
├── checks/
│   ├── session_dependencies.py    # existing
│   └── academic_structure_dependencies.py  # NEW (StudentSession + mapping checks)
├── views.py                       # REMOVE class/section/class_section views only
│                                  # keep Subjects* until Subjects slice
└── urls.py                        # wire new views
```

### Service sketch

```text
SectionService: list, get, create, update, deactivate
ClassService: list (with nested sections), get, create(+mappings), update(+sync), deactivate|delete
ClassSectionService: list, get, create, update, deactivate, bulk_assign, list_for_class
```

---

## 8. Frontend changes

### Keep

- Routes and feature folders under `features/academics/{classes,sections,class-sections}`
- Existing dialogs / tables / ModuleListPack UX
- Service paths (`/academics/classes/` etc.)

### Change

| Item | Change |
|------|--------|
| Permissions | Fine-grained `classes.*` / `sections.*`; Class Sections uses `classes.*` |
| PermissionButton | Replace `academics.manage` on these three features |
| permission-resolver | Map new keys → `class` / `section` |
| Types | Align `section_name` everywhere; document nested `sections` on class list |
| Hooks | Optional relocate under feature folders + re-export (Session pattern) |
| Response parsing | Ensure services tolerate only `APIResponse` shape after backend cleanup |

### Do not change

- Subjects UI permissions (still `academics.manage`)
- Nav paths

---

## 9. Validation

| Field | Rule |
|-------|------|
| `section_name` / `class_name` | Required on create; trim; max 60; unique iexact |
| `sort_order` | int ≥ 0 (or any int; default 9999) |
| `is_hedu_program` | bool → `'yes'`/`'no'` |
| `is_active` | `'yes'` \| `'no'` when present |
| `sections` / `section_ids` | list of ints; all must exist |
| `class_id` / `section_id` | required ints; must exist |

---

## 10. Test plan

### Unit (mocked)

- Section create uniqueness; deactivate blocked by active mapping
- Class create with sections creates mappings
- Class update cannot remove section with active StudentSession
- Bulk assign activate/create/deactivate paths
- Privilege not tested in unit (covered by HasLegacyPrivilege elsewhere)

### Manual smoke

1. `/academics/sections` — create, edit, deactivate  
2. `/academics/classes` — create with sections, edit, deactivate/delete per decision E  
3. `/academics/class-sections` — create mapping, bulk assign, deactivate  
4. Attempt remove section from class with enrolled student → blocked  
5. User without `class` / `section` privilege → 403 / hidden buttons  

### CI

- Academics new packages already under `apps/academics` — ensure Black/isort/flake8 include `apps/academics` in CI (today CI lints `apps/accounts` + `apps/settings` only). **Recommend adding `apps/academics` to backend-lint** in this PR (decision F).

---

## 11. Implementation order (after approval)

1. Domain exceptions + validators + dependency checks + tests  
2. Sections service/API → swap URLs → remove old section views  
3. Classes service/API → swap URLs → remove old class views  
4. Class Sections + bulk assign + assigned-sections → swap URLs  
5. Frontend permissions + response key alignment  
6. CI path update for `apps/academics`  
7. Smoke + push  

**Do not start Subjects in the same PR.**

---

## 12. Decisions (approved)

| # | Decision | Locked |
|---|----------|--------|
| **A** | Fine-grained FE perms `classes.*` / `sections.*` | **Yes** |
| **B** | Class Sections UI uses `classes.*` (legacy `class`) | **Yes** |
| **C** | Block section deactivate if any active `student_session` uses it | **Yes** |
| **D** | Re-create mapping if soft-inactive pair exists → reactivate | **Yes** |
| **E** | Classes DELETE: soft deactivate | **Yes** |
| **F** | Add `apps/academics` to CI Black/isort/flake8 | **Yes** |

---

## 13. Approval checklist

Approved and implemented:

- [x] Refactor Sections, Classes, Class Sections to Session-style layers  
- [x] Use `HasLegacyPrivilege` with `section` / `class`  
- [x] Preserve StudentSession guards on mapping removal  
- [x] Soft-deactivate sections (and classes per decision E)  
- [x] Keep Subjects out of this PR  
- [x] Ship tests + CI academics lint path  

**No code until you approve (and confirm A–F, or say approve all).**
