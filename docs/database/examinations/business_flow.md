# Examinations Domain — Business Flow

**Source:** `db_current` table relationships, foreign keys, and column names only.  
**No invented workflows** — this document describes data paths implied by the schema.

---

## Subsystems (41 tables)

| Subsystem | Tables | Row volume (indicative) |
|-----------|--------|-------------------------|
| CBSE exam core | `cbse_exams`, `cbse_exam_class_sections`, `cbse_exam_students`, `cbse_exam_timetable*` | 108 exams; 23k+ exam students; 170k+ marks |
| CBSE config | `cbse_terms`, `cbse_exam_grades*`, `cbse_exam_assessments*`, `cbse_exam_observations` | Lookup / grading config |
| CBSE marksheet template | `cbse_template*`, `cbse_marksheet_type` | Template → class section → term → exam linkage |
| CBSE marks & ranks | `cbse_student_subject_marks`, `cbse_student_exam_ranks`, `cbse_exam_student_subject_rank`, `cbse_student_template_rank` | Marks storage and rank outputs |
| CBSE observations | `cbse_observation_*` | Co-scholastic / observation parameters |
| Legacy exam groups | `exam_groups`, `exam_group_*`, `exams`, `exam_schedules` | Alternate exam-group model (low row counts) |
| Online exam | `onlineexam`, `onlineexam_*` | Digital exam (0 rows in db_current) |

**Note:** There is no table named `exam_marks`, `exam_results`, or `exam_rank`. Marks live in `cbse_student_subject_marks`; results in `exam_group_exam_results` and `cbse_student_subject_result`; ranks in `cbse_student_exam_ranks`, `cbse_exam_student_subject_rank`, `cbse_student_template_rank`.

---

## 1. Exam creation flow (CBSE — primary path)

Schema chain for creating a CBSE exam instance:

```
sessions (academics)
    └── cbse_exams
            ├── cbse_terms          (FK: cbse_term_id)
            ├── cbse_exam_grades    (FK: cbse_exam_grade_id)
            ├── cbse_exam_assessments (FK: cbse_exam_assessment_id)
            └── session_id          (FK → sessions)
```

`cbse_exams` columns involved in definition:

| Column | Role (from schema) |
|--------|-------------------|
| `name`, `exam_code`, `description` | Exam identity |
| `session_id` | Academic year |
| `cbse_term_id`, `cbse_term_group_id` | Term grouping |
| `cbse_exam_assessment_id`, `cbse_exam_grade_id` | Assessment and grading scheme |
| `total_working_days`, `combined_ew` | Attendance/weighting inputs |
| `is_publish`, `is_active` | Publish/active flags (`int(1)`) |
| `use_exam_roll_no` | Roll number mode flag |
| `promote_class` | Promotion target label |

Downstream tables reference `cbse_exams.id`:

- `cbse_exam_class_sections` — class/section assignment
- `cbse_exam_students` — enrolled students
- `cbse_exam_timetable` — subject schedule
- `cbse_student_exam_ranks` — overall ranks
- `cbse_template` — marksheet templates (`gradeexam_id`, `remarkexam_id`)
- `cbse_template_term_exams` — template term exam mapping

---

## 2. Class / section linkage

```
cbse_exams
    └── cbse_exam_class_sections
            ├── cbse_exam_id      → cbse_exams.id
            └── class_section_id  → class_sections.id (academics)
```

676 rows link exams to `class_sections` (class + section pairs).

Parallel template path:

```
cbse_template
    └── cbse_template_class_sections
            └── class_section_id → class_sections.id
```

`cbse_observation_class_section` exists (0 rows) for observation-to-section mapping without FK constraints in DB.

---

## 3. Student linkage

### CBSE path

```
cbse_exams
    └── cbse_exam_students
            ├── cbse_exam_id        → cbse_exams.id
            ├── student_session_id  → student_session.id (students)
            ├── staff_id            (int, no DB FK)
            ├── roll_no, room_number
            ├── total_present_days
            └── remark
```

23,305 rows connect exam instances to `student_session` records.

Marks and ranks reference the same student session or exam-student row:

| Table | Student link column | FK target |
|-------|---------------------|-----------|
| `cbse_student_subject_marks` | `cbse_exam_student_id` | `cbse_exam_students.id` |
| `cbse_student_exam_ranks` | `student_session_id` | `student_session.id` |
| `cbse_exam_student_subject_rank` | `student_session_id` | `student_session.id` |
| `cbse_student_template_rank` | `student_session_id` | `student_session.id` |
| `cbse_observation_term_student_subparameter` | `student_session_id` | `student_session.id` |

### Legacy exam-group path

```
exam_groups
    └── exam_group_students
            ├── exam_group_id
            ├── student_id        → students.id
            └── student_session_id → student_session.id

exam_group_class_batch_exams
    └── exam_group_class_batch_exam_students
            ├── exam_group_class_batch_exam_id
            ├── student_id
            └── student_session_id
```

---

## 4. Subject linkage

```
cbse_exams
    └── cbse_exam_timetable
            ├── cbse_exam_id → cbse_exams.id
            └── subject_id   → subjects.id (academics)
```

Timetable extensions:

```
cbse_exam_timetable
    ├── cbse_exam_timetable_assessment_types (assessment type per timetable row)
    └── cbse_exam_timetable_grade (grade bands per subject; PK: tg_id)
```

Legacy path:

```
exam_group_class_batch_exams
    └── exam_group_class_batch_exam_subjects
            └── subject_id → subjects.id
```

`exam_schedules` links `session_id`, `exam_id` → `exams.id`, and `teacher_subject_id` (no FK in schema to a teacher-subject table).

---

## 5. Marks flow

Primary marks table: **`cbse_student_subject_marks`** (169,901 rows).

```
cbse_exam_timetable_assessment_types
cbse_exam_timetable ────────────────┐
cbse_exam_students ─────────────────┼──► cbse_student_subject_marks
cbse_exam_assessment_types ─────────┘
```

| Column | FK / meaning |
|--------|----------------|
| `cbse_exam_timetable_assessment_type_id` | Required FK → timetable assessment junction |
| `cbse_exam_timetable_id` | FK → subject timetable row |
| `cbse_exam_student_id` | FK → exam student enrollment |
| `cbse_exam_assessment_type_id` | FK → assessment type |
| `marks` | `float(10,2)`, default 0.00 |
| `marks_grade` | `varchar(44)` grade label |
| `is_absent` | `int(1)` absence flag |
| `note` | Text note |

Alternate result storage:

- `cbse_student_subject_result` — 4 columns, 0 rows (aggregate result per student/subject)
- `exam_group_exam_results` — links `exam_group_student_id`, `exam_group_class_batch_exam_subject_id`, `attendence` (legacy spelling), `get_marks`, `note`

---

## 6. Ranking flow

Three rank tables with different scopes:

### Overall exam rank

```
cbse_exams
    └── cbse_student_exam_ranks
            ├── cbse_exam_id
            ├── student_session_id
            ├── rank
            └── rank_percentage
```

240 rows; indexes on `rank` and `rank_percentage`.

### Per-subject rank (template-scoped)

```
cbse_template
    └── cbse_exam_student_subject_rank
            ├── cbse_template_id
            ├── student_session_id
            ├── subject_id → subjects.id
            ├── rank
            └── rank_percentage
```

0 rows in db_current.

### Template rank

```
cbse_template
    └── cbse_student_template_rank
            ├── cbse_template_id
            └── student_session_id
```

0 rows in db_current.

`onlineexam.is_rank_generated` flag exists for online exam rank generation (0 exam rows).

---

## 7. CBSE-specific flow (template & observations)

### Marksheet template assembly

```
cbse_template (session_id → sessions; gradeexam_id/remarkexam_id → cbse_exams)
    ├── cbse_template_class_sections → class_sections
    ├── cbse_template_terms → cbse_terms
    └── cbse_template_term_exams → cbse_exams
```

Templates bind an academic session, class sections, terms, and linked exams for report generation.

### Observations (co-scholastic)

```
cbse_observation_parameters
    └── cbse_observation_subparameter
            └── cbse_observation_terms (session_id, cbse_template_id, cbse_term_id)
                    └── cbse_observation_term_student_subparameter
                            ├── student_session_id
                            └── cbse_observation_subparameter_id
```

17,809 observation mark rows at subparameter level.

### Grading configuration

```
cbse_exam_grades
    └── cbse_exam_grades_range (percentage bands)

cbse_exam_assessments
    └── cbse_exam_assessment_types (per assessment; maximum_marks, pass_percentage)
```

---

## 8. Legacy exam group flow

```
exam_groups (root)
    ├── exam_group_students
    ├── exam_group_exam_connections (exam_group_id, exam_id → exams.id)
    └── exam_group_class_batch_exams
            ├── exam_group_id
            ├── session_id → sessions
            ├── class_id, section_id (no DB FK)
            ├── exam_group_class_batch_exam_subjects → subjects
            └── exam_group_class_batch_exam_students → students / student_session
                    └── exam_group_exam_results (marks per student per subject)
```

`exams` table (legacy name) links to `sessions` via **`sesion_id`** (typo preserved) — 0 rows.

---

## 9. Online exam flow

```
onlineexam (session_id → sessions)
    ├── onlineexam_students (student_session_id)
    ├── onlineexam_questions (links to questions table — external)
    ├── onlineexam_attempts
    └── onlineexam_student_results
```

All online exam tables have 0 rows in db_current. Schema supports quiz mode (`is_quiz`), scheduling (`exam_from`/`exam_to`, `time_from`/`time_to`), and rank generation flag (`is_rank_generated`).

---

## External dependencies (mapped in other apps)

| External table | Referenced by |
|----------------|---------------|
| `sessions` | `cbse_exams`, `cbse_template`, `exam_schedules`, `exam_group_class_batch_exams`, `onlineexam`, `cbse_observation_terms` |
| `class_sections` | `cbse_exam_class_sections`, `cbse_template_class_sections` |
| `subjects` | `cbse_exam_timetable`, `cbse_exam_student_subject_rank`, `exam_group_class_batch_exam_subjects` |
| `student_session` | All student-facing exam/enrollment/rank tables |
| `students` | `exam_group_students`, `exam_group_class_batch_exam_students` |
| `staff` | `cbse_exam_students.staff_id` (no DB FK) |

---

*Derived from `examinations_domain_inventory.json`. Application-layer step ordering is not specified in the database.*
