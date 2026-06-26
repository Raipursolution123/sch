# Attendance Domain — Analysis

**Source:** `db_current` introspection  
**Inventory:** [attendance_domain_inventory.json](./attendance_domain_inventory.json)  
**Tables in `apps.attendance`:** 1

---

## Table inventory

| Table | PK | Rows | Cols | FKs | Depends On |
|-------|-----|------|------|-----|------------|
| `attendence_type` | `id` | 6 | 6 | 0 | — |

### Excluded (other apps)

| Table | App | Rows | FK to `attendence_type` |
|-------|-----|------|-------------------------|
| `student_attendences` | students | 1,028,060 | Yes |
| `student_attendences_hostel` | students | 6 | Yes |
| `student_attendences_transport` | students | 0 | Yes |
| `student_subject_attendances` | students | 0 | Yes |
| `staff_attendance` | staff | 0 | No (`staff_attendance_type`) |
| `staff_attendance_type` | staff | 5 | No |
| `cyc_ptm_attendance` | unclassified | 0 | No |

---

## Ownership mapping

| Table | Owner |
|-------|-------|
| `attendence_type` | **attendance** — shared lookup for all student attendance fact tables |
| `student_attendences*` | **students** — attendance transaction data |
| `staff_attendance*` | **staff** — separate staff attendance subsystem |

---

## ER relationship diagram

```mermaid
erDiagram
    attendence_type ||--o{ student_attendences : "attendence_type_id"
    attendence_type ||--o{ student_attendences_hostel : "attendence_type_id"
    attendence_type ||--o{ student_attendences_transport : "attendence_type_id"
    attendence_type ||--o{ student_subject_attendances : "attendence_type_id"

    student_session ||--o{ student_attendences : "student_session_id"
    student_session ||--o{ student_attendences_hostel : "student_session_id"
    student_session ||--o{ student_attendences_transport : "student_session_id"
    student_session ||--o{ student_subject_attendances : "student_session_id"

    subject_timetable ||--o{ student_subject_attendances : "subject_timetable_id"

    staff ||--o{ staff_attendance : "staff_id"
    staff_attendance_type ||--o{ staff_attendance : "staff_attendance_type_id"

    attendence_type {
        int id PK
        varchar type
        varchar key_value
        varchar is_active
        timestamp created_at
        date updated_at
    }

    student_attendences {
        int id PK
        int student_session_id FK
        int attendence_type_id FK
        date date
        int biometric_attendence
    }

    staff_attendance {
        int id PK
        int staff_id FK
        int staff_attendance_type_id FK
        date date
    }

    staff_attendance_type {
        int id PK
        varchar type
        varchar key_value
    }
```

**Legend:** Solid relationships to `attendence_type` are DB-enforced FKs from students app tables. Staff attendance uses a parallel type table (`staff_attendance_type`).

---

## Column detail — `attendence_type`

| Column | Type | Null | Default |
|--------|------|------|---------|
| `id` | int(11) | NO | auto_increment |
| `type` | varchar(50) | YES | NULL |
| `key_value` | varchar(50) | NO | — |
| `is_active` | varchar(255) | YES | `'no'` |
| `created_at` | timestamp | NO | CURRENT_TIMESTAMP ON UPDATE |
| `updated_at` | date | YES | NULL |

---

## Dependency graph

```
attendence_type (attendance app)
    └──► student_attendences* (students app — already mapped)
    └──► student_subject_attendances (students app — needs subject_timetable)

staff_attendance_type (staff app)
    └──► staff_attendance (staff app — already mapped)
```

---

## Related documents

| Document | Purpose |
|----------|---------|
| [model_mapping_plan.md](./model_mapping_plan.md) | Table → model mapping |
| [mismatch_report.md](./mismatch_report.md) | Legacy naming and type quirks |
