# Design: Subject Groups

**Status:** IMPLEMENTED  
**Slice:** Session-scoped subject group master + assignments  
**Module:** `academics`  
**Legacy:** `admin/subjectgroup` — permission `subject_group`  
**Route:** `/academics/subject-groups`  
**API:** `/api/v1/academics/subject-groups/`

---

## Decisions (senior defaults)

| # | Decision | Choice |
|---|----------|--------|
| A | Fine-grained `subject_groups.*` | Yes |
| B | `session_id` required on create | Yes |
| C | Group DELETE = hard delete when safe; mapping rows cleaned | Yes |
| D | Block delete if `student_session` or `subject_timetable` references group | Yes |
| E | Tabbed edit UI (details / subjects / class-sections) | Yes |
| F | `subject_group_class_sections.is_active` as int 1/0 | Yes (legacy) |
| G | `parent_subject_group_id` / `subject_groups1` | Out of scope |

---

## Tables

| Table | Purpose |
|-------|---------|
| `subject_groups` | Group header (`name`, `session_id`, `description`) |
| `subject_group_subjects` | Subjects in group |
| `subject_group_class_sections` | Class-section mappings (`class_section_id`, `is_active` 1/0) |

---

## API

| Method | Path | Action |
|--------|------|--------|
| GET | `subject-groups/?session_id=` | List |
| POST | `subject-groups/` | Create |
| GET | `subject-groups/<id>/` | Detail + assignments |
| PATCH | `subject-groups/<id>/` | Update name/description |
| DELETE | `subject-groups/<id>/` | Delete if safe |
| PUT | `subject-groups/<id>/subjects/` | Sync `subject_ids` |
| PUT | `subject-groups/<id>/class-sections/` | Sync `class_section_ids` |
