# Academics Domain — Mismatch Report

Comparison of assumptions vs `db_current` introspection.

---

## Corrected assumptions

| Assumption | db_current reality | Resolution |
|------------|-------------------|------------|
| Django model name `Class` | Table is `classes` | Model `Classes`, `db_table='classes'` |
| Column `class` as Python attr | `class` is reserved keyword | `class_field` with `db_column='class'` |
| `is_active` boolean | `varchar(255)` default `'no'` | `CharField` on all 5 tables |
| `updated_at` datetime | `date` nullable | `DateField` on all 5 tables |
| `sessions` is Django session store | **Academic year** table (14 school years) | Documented; not `django.contrib.sessions` |
| `subjects.linked_class` FK | `text` (serialized class ids) | `TextField`, not FK |
| `class_sections` optional FKs | `class_id`, `section_id` nullable with CASCADE FK | `IntegerField` nullable + `db_index` |

---

## Verified matches (no mismatch)

| Table | Columns | FK constraints |
|-------|---------|----------------|
| `sessions` | 5 | None |
| `classes` | 7 | None |
| `sections` | 5 | None |
| `class_sections` | 6 | → `classes`, `sections` CASCADE |
| `subjects` | 8 | None |

All models generated from `SHOW CREATE TABLE` / `DESCRIBE` output in `academics_domain_inventory.json`.

---

## Naming collisions (documentation only)

| Item | Risk | Mitigation |
|------|------|------------|
| `sessions` table vs Django sessions | Confusion in imports | Always use `apps.academics.models.sessions.Sessions` |
| `classes` table vs Python `class` | Syntax error | `class_field` attribute |
| `Classes` model vs `class_sections.class_id` | None — integer FK only | — |

---

## Out of scope (by design)

- No migrations created
- No schema alterations
- No Django infrastructure tables
- Extended academics tables (`homework`, `lesson`, etc.) deferred to next phase

---

## Student domain linkage

`student_session` depends on all 5 core academics tables:

```
student_session.session_id  → sessions.id
student_session.class_id    → classes.id
student_session.section_id  → sections.id
```

Enrollment is per **session + class + section**; `class_sections` is the valid combination lookup table (94 rows).
