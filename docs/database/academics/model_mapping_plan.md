# Academics Domain — Model Mapping Plan

**App:** `apps.academics`  
**Phase:** Core tables (5/5 mapped)  
**All models:** `managed = False`

| Table | Model class | Model file | Rows | Status |
|-------|-------------|------------|------|--------|
| `sessions` | `Sessions` | `models/sessions.py` | 14 | Mapped |
| `classes` | `Classes` | `models/classes.py` | 17 | Mapped |
| `sections` | `Sections` | `models/sections.py` | 15 | Mapped |
| `class_sections` | `ClassSections` | `models/class_sections.py` | 94 | Mapped |
| `subjects` | `Subjects` | `models/subjects.py` | 30 | Mapped |

## Future academics tables (not in this phase)

These remain in the global inventory under `academics` domain but are **not yet modeled**:

- `class_teacher`, `subject_groups`, `subject_group_*`, `subject_timetable`
- `lesson`, `topic`, `homework`, `department`, `batch`, etc.

## Cross-app references

| Consumer | FK columns → academics |
|----------|------------------------|
| `student_session` | `session_id`, `class_id`, `section_id` |
| `cbse_exams` | `session_id` |
| `homework` | `class_id`, `section_id` |
| `subject_timetable` | `class_id`, `section_id`, `subject_id` |

FK columns use `IntegerField` + `db_index` until cross-app `ForeignKey` wiring is approved.

## Regeneration

```bash
cd backend
python scripts/introspect_academics_domain.py
python scripts/generate_academics_models.py
```

## Special column mapping

| DB column | Django attribute | Notes |
|-----------|------------------|-------|
| `classes.class` | `class_field` | Python reserved word; `db_column='class'` |
