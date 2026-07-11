# Design: Class Teacher

**Status:** IMPLEMENTED  

**Slice:** Assign class in-charge (class teacher) per session + class + section  
**Module:** `academics`  
**Legacy screen:** `admin/teacher/assign_class_teacher`  
**Legacy permission:** `assign_class_teacher` (module `academics`)  
**Route (new):** `/academics/class-teacher`  
**API base (new):** `/api/v1/academics/class-teachers/`

---

## 1. Executive summary

Class Teacher assignment has **no API or UI** in the new ERP yet. Admin nav link exists (`ROUTES.academics.classTeacher`); route is not wired.

This slice assigns **one active staff member** as class in-charge for each **session + class + section** using the frozen `class_teacher` table (~267 rows in live DB). It follows the same layered pattern as Sessions / Timetable.

**Depends on (done):** Sessions, Classes, Sections, Class Sections, Staff list API.

**Out of scope:** Teacher timetable, homework approval workflows, attendance marking UI, bulk assign across sessions, `sch_settings.class_teacher` toggle UI (setting already exists in General Settings — we only **read** it to show/hide or warn).

---

## 2. Current state (as-is)

### What exists

| Area | Status |
|------|--------|
| Model | `ClassTeacher` — `managed=False` in `apps/academics/models/class_teacher.py` |
| Nav | Admin nav item → `/academics/class-teacher`, permission `assign_class_teacher` |
| Session guard | `session_dependencies` lists `ClassTeacher` rows when deleting sessions |
| Settings flag | `sch_settings.class_teacher` = `enabled` \| `disabled` (General Settings slice) |

### What is missing

| Gap | Risk |
|-----|------|
| No backend endpoints | Cannot build UI |
| No FE page/route wiring | Nav link goes nowhere |
| No RBAC on APIs | Would repeat legacy `AllowAny` anti-pattern |
| No validation of class-section chain | Orphan assignments |

### Table (frozen) — `class_teacher`

| Column | Type | Role |
|--------|------|------|
| `session_id` | int FK → `sessions` | Academic year scope |
| `class_id` | int FK → `classes` | Class |
| `section_id` | int FK → `sections` | Section |
| `staff_id` | int FK → `staff` | Assigned class teacher |

**No `is_active`, no timestamps** — rows are hard-deleted when removed.  
**No unique index** on `(session_id, class_id, section_id)` in DB; enforce in service layer.

### Downstream readers

`referenced_by`: **none** in domain inventory — safe to update or delete assignments without dependency guards beyond FK existence.

---

## 3. Scope

### In scope

1. Layered backend: domain exceptions, selectors, service, API views.
2. Legacy RBAC: `HasLegacyPrivilege` with `assign_class_teacher` under `academics`.
3. CRUD for class-teacher assignments.
4. List/filter API by `session_id` (optional `class_id`, `section_id`).
5. FE: session filter + table of class-section rows with assigned teacher + assign/edit/remove dialog.
6. Fine-grained FE permissions `class_teacher.*`.
7. Unit tests + `apps/academics` lint coverage (already in CI).

### Out of scope

| Item | Later slice |
|------|-------------|
| Promote students | Separate (`promote_student`) |
| Teacher personal timetable | Separate (`teachers_time_table`) |
| Bulk copy assignments across sessions | Enhancement |
| Student/parent portal “my class teacher” | Portal slice |
| Editing `sch_settings.class_teacher` toggle | General Settings (done) |

---

## 4. Permissions

### Legacy

| Entity | `permission_category.short_code` | Module |
|--------|----------------------------------|--------|
| Assign class teacher | `assign_class_teacher` | `academics` |

Method → action: GET `can_view`, POST `can_add`, PUT/PATCH `can_edit`, DELETE `can_delete`.

### Frontend (recommended)

```ts
'class_teacher.view' | 'class_teacher.create' | 'class_teacher.edit' | 'class_teacher.delete'
```

Map: `class_teacher.*` → `['assign_class_teacher']`

---

## 5. API contract

Base: `/api/v1/academics/class-teachers/`

### List

`GET /academics/class-teachers/?session_id=<required>&class_id=&section_id=`

**Response** (`APIResponse` list wrapper):

```json
{
  "assignments": [
    {
      "id": 1,
      "session_id": 3,
      "class_id": 5,
      "section_id": 2,
      "staff_id": 12,
      "session_label": "2025-26",
      "class_name": "Class 10",
      "section_name": "A",
      "staff_name": "Jane Doe",
      "staff_employee_id": "EMP001"
    }
  ]
}
```

Enrichment via selectors (join labels from sessions, classes, sections, staff).

### Create

`POST /academics/class-teachers/`

```json
{
  "session_id": 3,
  "class_id": 5,
  "section_id": 2,
  "staff_id": 12
}
```

**Upsert rule:** If a row already exists for `(session_id, class_id, section_id)`, **update `staff_id`** instead of inserting a duplicate (legacy `update_class_teacher` behaviour).

### Detail

`GET /academics/class-teachers/<id>/`

### Update

`PATCH /academics/class-teachers/<id/>`

```json
{ "staff_id": 15 }
```

Only `staff_id` is mutable after create (session/class/section immutable).

### Delete

`DELETE /academics/class-teachers/<id>/` — hard delete row.

---

## 6. Business rules

1. **Session** must exist.
2. **Class** and **section** must exist and be active (`is_active = 'yes'`).
3. **Class-section mapping** must exist and be active (`class_sections.is_active = 'yes'`).
4. **Staff** must exist and be active (`staff.is_active = 1`).
5. **At most one** assignment per `(session_id, class_id, section_id)` — enforced on create via upsert.
6. **Immutable keys** after create: `session_id`, `class_id`, `section_id` cannot change on PATCH.
7. **No soft delete** — DELETE removes the row.
8. **Settings flag (read-only):** If `sch_settings.class_teacher = 'disabled'`, API still works for admins with privilege; FE may show a banner that the feature is disabled school-wide (matches legacy gating pattern).

---

## 7. Backend layout

```
apps/academics/
  domain/class_teacher_exceptions.py
  selectors/class_teacher_selectors.py
  services/class_teacher_service.py
  api/serializers/class_teacher.py
  api/views/class_teacher.py
  tests/test_class_teacher_service.py
```

**urls.py** additions:

- `GET/POST` `/academics/class-teachers/`
- `GET/PATCH/DELETE` `/academics/class-teachers/<id>/`

---

## 8. Frontend layout

```
frontend/src/
  types/academics/class-teacher.ts
  services/api/class-teachers.service.ts
  hooks/useClassTeachers.ts
  features/academics/class-teacher/
    pages/ClassTeacherPage.tsx
    components/ClassTeachersTable.tsx
    components/ClassTeacherFormDialog.tsx
    schemas/class-teacher.schema.ts
```

**UX:**

- Session filter (default: current session).
- Table: Class | Section | Class Teacher | Actions.
- Rows sourced from **active class-section mappings** for the session context, merged with existing assignments (unassigned rows show “—” with Assign action).
- Dialog: staff select (active staff only).
- Route: lazy `ClassTeacherPage` at `/academics/class-teacher`.

---

## 9. Decisions (approved)

| # | Decision | Locked |
|---|----------|--------|
| **A** | Fine-grained FE `class_teacher.*` | **Yes** |
| **B** | Upsert on duplicate `(session, class, section)` | **Yes** |
| **C** | List shows all active class-sections (assigned + unassigned) | **Yes** |
| **D** | Immutable session/class/section after create | **Yes** |
| **E** | Hard delete (no soft deactivate) | **Yes** |
| **F** | Show banner when `sch_settings.class_teacher = disabled` | **Yes** |

---

## 10. Approval checklist

Approved and implemented:

- [x] Build layered class-teacher CRUD on frozen `class_teacher`
- [x] Use `HasLegacyPrivilege` + `assign_class_teacher`
- [x] Validate session / class / section / staff / active class-section mapping
- [x] Upsert one teacher per class-section per session
- [x] Ship assignment UI at `/academics/class-teacher`
- [x] Keep promote students out of this PR
