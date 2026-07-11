# Design: Subjects

**Status:** IMPLEMENTED  
**Slice:** Session-parity hardening of Subjects master  
**Module:** `academics`  
**Legacy screen:** `admin/subject`  
**Routes (unchanged):** `/academics/subjects`  
**API base (unchanged):** `/api/v1/academics/subjects/`

---

## 1. Executive summary

Subjects already has a working UI and monolithic views in `apps/academics/views.py`. This is a **Session / Academic Structure–parity refactor**.

**Out of scope:** Subject Groups, Timetable, Class Teacher, Promote Students.

---

## 2. Decisions (approved)

| # | Decision | Locked |
|---|----------|--------|
| **A** | Fine-grained FE `subjects.*` | **Yes** |
| **B** | DELETE = soft deactivate | **Yes** |
| **C** | Block deactivate if used in subject groups / homework / timetable chain | **Yes** |
| **D** | API accepts/returns `linked_class_ids` (store CSV in `linked_class`) | **Yes** |
| **E** | Restrict `type` to `theory` \| `practical` | **Yes** |

---

## 3. Permissions

- Legacy: `academics` / `subject`
- FE: `subjects.view|create|edit|delete` → `['subject']`
- Remove Subjects usage of `academics.manage` (key may remain unused or for future coarse nav)

---

## 4. API

| Method | Path | Privilege |
|--------|------|-----------|
| GET | `subjects/` | view |
| POST | `subjects/` | add |
| GET | `subjects/<id>/` | view |
| PATCH/PUT | `subjects/<id>/` | edit |
| DELETE | `subjects/<id>/` | delete → soft deactivate |

**Body:** `{ name, code, type, is_active?, linked_class_ids? }`  
**Response:** includes `linked_class`, `linked_class_ids`, `linked_class_labels`.

---

## 5. Business rules

1. Name required (≤100); code required, normalized upper, unique case-insensitive.
2. `type` ∈ `{theory, practical}`.
3. `linked_class_ids` → validated class IDs → CSV in `linked_class` (empty = all classes).
4. Create defaults `is_active='yes'` if omitted.
5. DELETE / deactivate blocked if:
   - any `subject_group_subjects.subject_id`
   - any `homework.subject_id`
   - any timetable row via `subject_group_subject_id` belonging to this subject

---

## 6. Implementation checklist

- [x] Layered backend + HasLegacyPrivilege
- [x] Soft deactivate + dependency guards
- [x] FE fine-grained permissions
- [x] Tests
