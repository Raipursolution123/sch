# Examinations Domain — Mismatch Report

Comparison of naming assumptions vs `db_current` introspection.

---

## Table name mismatches (assumptions vs reality)

| Assumed name | Actual table | Resolution |
|--------------|--------------|------------|
| `exam_marks` | **`cbse_student_subject_marks`** | Model `CbseStudentSubjectMarks` |
| `exam_results` | **`exam_group_exam_results`** (+ `cbse_student_subject_result`) | Two result models |
| `exam_rank` | **`cbse_student_exam_ranks`**, `cbse_exam_student_subject_rank`, `cbse_student_template_rank` | Three rank tables |
| `exam_types` | No such table | Use `cbse_exam_assessment_types`, `feetype` is fees |
| `online_exam` | **`onlineexam`** (no underscore) | Model `Onlineexam` |

---

## Legacy naming

| Item | Notes |
|------|-------|
| `exams.sesion_id` | Misspelled session FK column (not `session_id`) |
| `exam_group_exam_results.attendence` | Misspelled attendance column |
| `cbse_exam_timetable_grade.tg_id` | Non-standard PK name (not `id`) |
| `cbse_template.gradeexam_id` / `remarkexam_id` | Reference `cbse_exams.id` |

---

## Non-standard types

| Table | Column | MySQL type | Django field |
|-------|--------|------------|--------------|
| `cbse_exams` | `description` | `mediumtext` | `TextField` |
| `cbse_exams` | `is_publish`, `is_active` | `int(1)` | `IntegerField` |
| `cbse_student_subject_marks` | `marks` | `float(10,2)` | `FloatField` |
| `onlineexam` | `time_from`, `time_to` | `time` | `TimeField` |
| `cbse_exam_timetable` | `time_from`, `time_to` | `time` | `TimeField` |
| `exam_group_class_batch_exam_subjects` | `time_from` | `time` | `TimeField` |

---

## Nullable / flag quirks

| Column | Notes |
|--------|-------|
| `cbse_exam_students.delete_student_id` | `int NOT NULL` — legacy soft-delete marker |
| `cbse_exam_students.staff_id` | No DB FK to `staff` |
| `cbse_exams.cbse_term_group_id` | No DB FK |
| `feetype.feecategory_id` | N/A here; `cbse_template` has similar loose ints |
| `onlineexam.is_active` | `varchar(1)` default `0` |

---

## Columns without DB FK (logical only)

| Table | Column | Likely target |
|-------|--------|---------------|
| `cbse_exam_students` | `staff_id` | `staff` |
| `exam_group_class_batch_exams` | `class_id`, `section_id` | `classes`, `sections` |
| `exam_schedules` | `teacher_subject_id` | teacher-subject junction (unmapped) |
| `onlineexam_questions` | `question_id` | `questions` (unmapped) |
| `fee_receipt_no` | N/A | — |

---

## Subsystem overlap

| Area | Primary tables | Notes |
|------|----------------|-------|
| CBSE exams | `cbse_*` (27 tables) | Active data (100k+ mark rows) |
| Legacy groups | `exam_group_*`, `exams` | Mostly empty except 111 batch students |
| Online | `onlineexam_*` | Schema present, 0 rows |

---

## Generator fixes applied

| Issue | Fix |
|-------|-----|
| `int(1)` mapped to `TextField` | `parse_type` now matches `int(\d+)` |
| `time` columns | Added `TimeField` mapping |

---

## Actions taken

- [x] 41 examination tables mapped
- [x] `managed=False`, no migrations
- [x] Business flow documented from schema only
- [ ] Cross-app ForeignKey wiring (deferred)
- [ ] `questions`, `teacher_subject` tables (external dependencies)
