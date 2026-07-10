# Design: Promote Students (Session Transfer)

**Status:** DRAFT — awaiting approval before implementation  

**Slice:** Bulk promote / transfer enrollments from one session + class-section to another  
**Module:** `academics` (UI + API route); **data owner:** `students` (`student_session`)  
**Legacy screen:** `admin/stdtransfer`  
**Legacy permission:** `promote_student` (module `academics`) — legacy seed grants **view only**; we map **create** action to `can_add` if present else `can_view`  
**Route (new):** `/academics/promote`  
**API base (new):** `/api/v1/academics/promote/`

---

## 1. Executive summary

Promote Students is the **last Academics nav item** without implementation. Nav stub exists (`ROUTES.academics.promote`); no API or UI.

Legacy **session transfer** creates new `student_session` rows for a **target academic year** while retiring enrollments in the **source session**. This is how schools move Class 5-A (2025-26) → Class 6-A (2026-27) in bulk.

**Depends on (done):** Sessions, Classes, Sections, Class Sections, Subject Groups (optional assignment), Students list API.

**Out of scope:** Fee carry-forward / auto-assign, exam promotion rules, alumni module, transport/hostel reassignment UI, individual student edit (Students profile), multi-class enrollment (`multi_class_student`).

---

## 2. Current state (as-is)

### What exists

| Area | Status |
|------|--------|
| Model | `StudentSession` — `managed=False` in `apps/students/models/student_session.py` (~8,648 rows) |
| Nav | Admin nav → `/academics/promote`, permission `promote_student` |
| Admission flow | `students/views.py` creates/updates **current** session enrollment on admit/edit |
| Session guards | `session_dependencies` blocks session delete when `student_session` rows exist |

### What is missing

| Gap | Risk |
|-----|------|
| No promote/transfer API | Cannot build UI |
| No bulk validation | Duplicate enrollments, wrong class-section |
| No FE wizard | Admins cannot run year-end promotion |

### Table (frozen) — `student_session` (promotion-relevant columns)

| Column | Type | Role |
|--------|------|------|
| `session_id` | int FK → `sessions` | Academic year |
| `student_id` | int FK → `students` | Student |
| `class_id` | int FK → `classes` | Class |
| `section_id` | int FK → `sections` | Section |
| `subject_group_id` | int | Optional group for target year |
| `is_active` | varchar (`yes`/`no`) | Active enrollment flag |
| `is_alumni` | int | Alumni marker on old row |
| `default_login` | int | Portal login session (0/1) |
| `transport_fees`, `fees_discount`, `vehroute_id`, … | various | Copied or reset (see rules) |
| `created_at`, `updated_at` | datetime/date | Audit |

**No unique index** on `(session_id, student_id)` in DB; enforce in service.

### Downstream readers (inform guards / copy policy)

`student_session` is referenced by attendance, fees, exams, homework, etc. **Promotion does not migrate child rows** — it creates a **new** enrollment id for the target session. Historical attendance/fees stay on the old `student_session_id`.

| Concern | Policy (recommended) |
|---------|------------------------|
| Old attendance / fees / exam marks | Stay on source `student_session_id` |
| Active fees on source | **Warn** in preview; block or allow per decision |
| Duplicate target enrollment | **Block** if student already has row in target session |

---

## 3. Scope

### In scope

1. Layered backend in **students** app (owns `StudentSession`) with API mounted under **academics** URLs.
2. Legacy RBAC: `HasLegacyPrivilege` + `promote_student` under `academics`.
3. **Preview** endpoint (counts + student list + blockers).
4. **Execute** bulk promote for filtered source cohort → target session/class/section.
5. FE wizard at `/academics/promote`: source filters → target mapping → preview → confirm.
6. Fine-grained FE permission `promote_students.create` (legacy create-only screen).
7. Unit tests for validation + happy-path promote (mocked ORM).

### Out of scope

| Item | Later slice |
|------|-------------|
| Per-student promote from profile | Students module |
| Fee master auto-copy | Fees slice |
| Subject group auto-map by rules | Enhancement |
| Alumni graduation workflow | Alumni slice |
| Undo / rollback promote batch | Enhancement |
| Transport / hostel reassignment | Transport / Hostel slices |

---

## 4. Permissions

### Legacy

| Entity | `permission_category.short_code` | Module |
|--------|----------------------------------|--------|
| Promote student | `promote_student` | `academics` |

Legacy sidemenu uses `can_view`; screen action is **Create** only. Map:

| HTTP | Legacy action |
|------|----------------|
| GET preview | `can_view` |
| POST execute | `can_add` if role has it, else `can_view` (match legacy single permission) |

### Frontend (recommended)

```ts
'promote_students.view' | 'promote_students.create'
```

Map: `promote_students.*` → `['promote_student']`

---

## 5. API contract

Base: `/api/v1/academics/promote/`

### Preview

`GET /academics/promote/preview/?from_session_id=&from_class_id=&from_section_id=&to_session_id=&to_class_id=&to_section_id=`

**Response:**

```json
{
  "eligible_count": 42,
  "already_in_target_count": 3,
  "inactive_skipped_count": 1,
  "students": [
    {
      "student_id": 101,
      "admission_no": "ADM001",
      "name": "Rahul Sharma",
      "current_class_name": "Class 5",
      "current_section_name": "A",
      "blockers": []
    }
  ],
  "warnings": ["3 students already enrolled in target session will be skipped."]
}
```

### Execute

`POST /academics/promote/`

```json
{
  "from_session_id": 28,
  "from_class_id": 23,
  "from_section_id": 19,
  "to_session_id": 29,
  "to_class_id": 24,
  "to_section_id": 19,
  "to_subject_group_id": 5,
  "student_ids": [101, 102],
  "deactivate_source": true,
  "mark_alumni": false
}
```

- `student_ids` optional — omit to promote **all eligible** from preview filter.
- **Response:** `{ promoted_count, skipped_count, promoted: [{ student_id, new_student_session_id }] }`

---

## 6. Business rules

### Source cohort

1. `student_session` where `session_id = from`, `class_id = from`, `section_id = from`.
2. Include only rows with `is_active = 'yes'` (configurable skip for inactive).
3. Student `students.is_active` should be `yes` (skip disabled students).

### Target validation

4. Target session, class, section must exist and be active.
5. Target **class-section mapping** must exist (`class_sections.is_active = 'yes'`).
6. `from_session_id` ≠ `to_session_id` (must be a real session change).
7. Optional `to_subject_group_id` must belong to `to_session_id` and be linked to target class-section.

### Execute (per student)

8. If target enrollment already exists for `(to_session_id, student_id)` → **skip** (do not duplicate).
9. **Create** new `student_session` row:
   - `session_id`, `class_id`, `section_id` = target
   - `student_id` = source student
   - `subject_group_id` = payload or null
   - `is_active = 'yes'`, `is_alumni = 0`, `default_login = 0`
   - Copy transport/hostel fields from source **or** reset to defaults (decision E)
   - `created_at` = now
10. If `deactivate_source` (default **true**): set source row `is_active = 'no'`, `default_login = 0`.
11. If `mark_alumni` (default **false**): set source `is_alumni = 1` when deactivating (final-year graduates).
12. If promoted student had `default_login = 1` on source, move to target row when target session is **current** school session.

### Transaction

13. Entire batch in **one atomic transaction**; partial failure rolls back all.

### Guards (preview warnings, not hard block v1)

14. Warn if source rows have unpaid fee masters (query `student_fees_master` for source `student_session_id`).
15. Do **not** delete source rows — deactivate only (preserves FK history).

---

## 7. Backend layout

```
apps/students/
  domain/promotion_exceptions.py
  selectors/promotion_selectors.py
  services/promotion_service.py
  tests/test_promotion_service.py

apps/academics/api/
  views/promote.py          # thin — delegates to PromotionService
  serializers/promote.py
```

**urls.py** (academics):

- `GET /academics/promote/preview/`
- `POST /academics/promote/`

---

## 8. Frontend layout

```
frontend/src/
  types/academics/promote.ts
  services/api/promote.service.ts
  hooks/usePromoteStudents.ts
  features/academics/promote/
    pages/PromoteStudentsPage.tsx
    components/PromoteWizard.tsx
    components/PromotePreviewTable.tsx
    schemas/promote.schema.ts
```

**UX (wizard steps):**

1. **Source** — session + class + section (enrolled students count).
2. **Target** — session + class + section + optional subject group.
3. **Preview** — table with checkboxes (all eligible selected by default); show skip reasons.
4. **Confirm** — summary + execute; toast with promoted/skipped counts.

---

## 9. Open decisions (need your call)

| # | Decision | Recommendation |
|---|----------|----------------|
| **A** | Fine-grained FE `promote_students.view/create`? | **Yes** |
| **B** | API under `/academics/promote/` (not `/students/`) | **Yes** (matches nav) |
| **C** | Service lives in `apps/students` | **Yes** (owns `student_session`) |
| **D** | Deactivate source row (not delete) | **Yes** |
| **E** | Copy transport/hostel fields to target row | **Yes** (legacy parity) |
| **F** | Block execute if any selected student has target duplicate | **No** — skip duplicates, promote rest |
| **G** | Optional `mark_alumni` flag on source rows | **Yes** (final-year) |
| **H** | Fee warnings in preview only (no auto fee copy) | **Yes** |

---

## 10. Approval checklist

Approve if you agree we will:

- [ ] Build preview + execute promote on frozen `student_session`
- [ ] Use `HasLegacyPrivilege` + `promote_student`
- [ ] Validate source/target session and class-section chain
- [ ] Create target enrollments; deactivate source (optional alumni flag)
- [ ] Ship wizard UI at `/academics/promote`
- [ ] Keep fee copy and undo out of this PR

**No code until you approve (confirm A–H, or say approve all).**
