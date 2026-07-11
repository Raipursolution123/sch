# Design: Class Timetable

**Status:** IMPLEMENTED  

**Slice:** Session-scoped weekly class timetable (period CRUD)  
**Module:** `academics`  
**Legacy screen:** `admin/timetable/classreport`  
**Legacy permission:** `class_timetable` (module `academics`)  
**Route (new):** `/academics/timetable`  
**API base (new):** `/api/v1/academics/timetable/`

---

## 1. Executive summary

Class Timetable has **no API or UI** in the new ERP yet. Nav link exists (`ROUTES.academics.timetable`); route is still a placeholder.

This slice adds **admin class-section weekly scheduling** using the frozen `subject_timetable` table (~4,953 rows in live DB). It follows the same layered pattern as Sessions / Subject Groups.

**Depends on (done):** Sessions, Classes, Sections, Class Sections, Subjects, Subject Groups.

**Out of scope:** Teacher personal timetable (`teachers_time_table` / `admin/timetable/mytimetable`), copy timetable across sessions, GMeet/Zoom, subject attendance marking UI, exam timetable (`cbse_exam_timetable`).

---

## 2. Current state (as-is)

### What exists

| Area | Status |
|------|--------|
| Model | `SubjectTimetable` — `managed=False` in `apps/academics/models/subject_timetable.py` |
| Nav | Admin nav item → `/academics/timetable`, permission `class_timetable` |
| Upstream data | Sessions, class-sections, subject groups with assignments |

### What is missing

| Gap | Risk |
|-----|------|
| No backend endpoints | Cannot build UI |
| No FE page/route wiring | Placeholder only |
| No RBAC on timetable APIs | Would repeat legacy `AllowAny` anti-pattern |
| No guards for attendance FK | Deleting periods breaks `student_subject_attendances` |

### Table (frozen) — `subject_timetable`

| Column | Type | Role |
|--------|------|------|
| `session_id` | int FK → `sessions` | Academic year scope |
| `class_id` | int FK → `classes` | Class |
| `section_id` | int FK → `sections` | Section |
| `subject_group_id` | int FK → `subject_groups` | Denormalized group ref |
| `subject_group_subject_id` | int FK → `subject_group_subjects` | **Canonical subject slot** |
| `staff_id` | int FK → `staff` | Assigned teacher |
| `day` | varchar(20) | Weekday label |
| `time_from` / `time_to` | varchar(20) | Legacy display strings |
| `start_time` / `end_time` | time | Canonical time range |
| `room_no` | varchar(20) | Room |
| `created_at` | timestamp | Audit |

**No `is_active`** — periods are hard-deleted when removed.

### Downstream readers (guards only)

| Table | FK column |
|-------|-----------|
| `student_subject_attendances` | `subject_timetable_id` |

---

## 3. Scope

### In scope

1. Layered backend: domain exceptions, dependency checks, selectors, service, API views.
2. Legacy RBAC: `HasLegacyPrivilege` with `class_timetable` under `academics`.
3. CRUD for individual timetable periods.
4. List/filter API for a **class + section + session** grid.
5. FE: session / class / section filters + weekly grid + period form dialog.
6. Fine-grained FE permissions `timetable.*`.
7. Unit tests + `apps/academics` lint coverage (already in CI).

### Out of scope

| Item | Later slice |
|------|-------------|
| Teacher timetable read view | Separate (`teachers_time_table`) |
| Bulk copy week / session | Enhancement |
| Student portal timetable | Portal slice |
| Subject attendance UI | Attendance slice |
| `class_teacher`, promote students | Separate |

---

## 4. Permissions

### Legacy

| Entity | `permission_category.short_code` | Module |
|--------|----------------------------------|--------|
| Class timetable | `class_timetable` | `academics` |

Method → action: GET `can_view`, POST `can_add`, PUT/PATCH `can_edit`, DELETE `can_delete`.

### Frontend (recommended)

```ts
'timetable.view' | 'timetable.create' | 'timetable.edit' | 'timetable.delete'
```

Map: `timetable.*` → `['class_timetable']`

---

## 5. API contract

Base: `/api/v1/academics/timetable/`

### List / filter (grid)

| Method | Path | Privilege |
|--------|------|-----------|
| GET | `timetable/` | view |

**Required query params:** `session_id`, `class_id`, `section_id`  
**Optional:** pagination (default returns full week grid for class-section; paginate only if row count is large)

**Response shape:**

```json
{
  "periods": [
    {
      "id": 1,
      "session_id": 5,
      "class_id": 4,
      "section_id": 2,
      "class_name": "Class 5",
      "section_name": "A",
      "subject_group_id": 12,
      "subject_group_subject_id": 88,
      "subject_id": 3,
      "subject_name": "Mathematics",
      "subject_code": "MATH",
      "staff_id": 7,
      "staff_name": "John Smith",
      "day": "Monday",
      "start_time": "09:00:00",
      "end_time": "09:45:00",
      "time_from": "09:00 AM",
      "time_to": "09:45 AM",
      "room_no": "101",
      "created_at": "2024-06-01 10:00:00"
    }
  ]
}
```

### Create period

| Method | Path | Privilege |
|--------|------|-----------|
| POST | `timetable/` | add |

**Body:**

```json
{
  "session_id": 5,
  "class_id": 4,
  "section_id": 2,
  "subject_group_subject_id": 88,
  "staff_id": 7,
  "day": "Monday",
  "start_time": "09:00",
  "end_time": "09:45",
  "room_no": "101"
}
```

Server derives and stores `subject_group_id` from `subject_group_subject_id`. Server writes both `start_time`/`end_time` **and** legacy `time_from`/`time_to` display strings.

### Detail / update / delete

| Method | Path | Privilege |
|--------|------|-----------|
| GET | `timetable/<id>/` | view |
| PATCH/PUT | `timetable/<id>/` | edit |
| DELETE | `timetable/<id>/` | delete |

**Update body:** same fields as create (except `session_id` / class / section immutable after create — recommend **yes**).

All responses use `APIResponse` envelope.

---

## 6. Business rules

### Validation

1. `session_id`, `class_id`, `section_id`, `subject_group_subject_id`, `staff_id`, `day`, `start_time`, `end_time` required on create.
2. `day` ∈ `{Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday}` (match legacy labels).
3. `end_time` must be after `start_time`.
4. `class_id` + `section_id` must have an **active** `class_sections` row.
5. `subject_group_subject_id` must belong to a `subject_group` that:
   - matches `session_id`, and
   - is linked to the class-section via active `subject_group_class_sections` (`is_active=1`).
6. `staff_id` must reference an existing `staff` row (active staff filter if column available).
7. **No overlapping period** for the same `session_id + class_id + section_id + day` (time ranges must not intersect).
8. **Staff clash:** same `staff_id + session_id + day` must not overlap with another period (block, not warn).

### Writes

1. On create/update: set `subject_group_id` from the parent of `subject_group_subject_id`.
2. Populate `time_from` / `time_to` from `start_time` / `end_time` using 12-hour display (legacy parity).
3. `created_at` = now on insert.

### Delete

1. Hard delete row (no soft flag on table).
2. **Block** if `student_subject_attendances` references `subject_timetable_id`.

### Subject picker (FE helper)

Optional read-only endpoint or embedded in list response:

- `GET /academics/timetable/subject-options/?session_id=&class_id=&section_id=`  
  Returns assignable `subject_group_subject` rows for that class-section in the session.

*(Can be folded into service selector used by create form; separate endpoint optional.)*

---

## 7. Backend layout

```
apps/academics/
  domain/timetable_exceptions.py
  checks/timetable_dependencies.py
  selectors/timetable_selectors.py      # enrich subject/staff/class names
  services/timetable_service.py
  api/serializers/timetable.py
  api/views/timetable.py
  tests/test_timetable_service.py
```

Wire in `apps/academics/urls.py`; no monolithic `views.py` addition.

---

## 8. Frontend layout

```
features/academics/timetable/
  pages/TimetablePage.tsx           # filters + grid
  components/TimetableGrid.tsx      # Mon–Sun columns, rows by time
  components/TimetablePeriodDialog.tsx
  schemas/timetable.schema.ts
types/academics/timetable.ts
services/api/timetable.service.ts
hooks/useTimetable.ts
```

### UX (recommended)

1. **Filters:** Session (default current), Class, Section — same pattern as Subject Groups.
2. **Grid:** Weekly view; each cell shows subject + teacher + room; click to add/edit.
3. **Form:** Subject (from group options), teacher dropdown, day, start/end time, room.
4. **Delete:** Confirm dialog; disabled messaging if attendance exists (API error surfaced).

Register route in `admin-routes.tsx` under `/academics/timetable`.

---

## 9. Implementation order (after approval)

1. Domain + checks + selectors + unit tests  
2. Service + API + URLs  
3. FE types, service, hooks, page  
4. Permissions + route wiring  
5. Smoke test with live DB sample class-section  
6. Commit (stack with pending academics slices or separate PR)

---

## 10. Decisions (approved)

| # | Decision | Locked |
|---|----------|--------|
| **A** | Fine-grained FE `timetable.*` | **Yes** |
| **B** | Admin class-section weekly grid first | **Yes** |
| **C** | Teacher timetable read view in same PR | **No** |
| **D** | `start_time`/`end_time` canonical; auto `time_from`/`time_to` | **Yes** |
| **E** | Days fixed enum Mon–Sun | **Yes** |
| **F** | Block staff time clashes | **Yes** |
| **G** | Immutable session/class/section after create | **Yes** |
| **H** | Subject-options helper endpoint | **Yes** |

---

## 11. Approval checklist

Approved and implemented:

- [x] Build layered timetable CRUD on frozen `subject_timetable`
- [x] Use `HasLegacyPrivilege` + `class_timetable`
- [x] Validate subject group ↔ class-section ↔ session chain
- [x] Block delete when subject attendance exists
- [x] Ship class-section grid UI at `/academics/timetable`
- [x] Keep teacher timetable out of this PR
