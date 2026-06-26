# Attendance Domain — Model Mapping Plan

**App:** `apps.attendance`  
**Status:** Complete (1/1 tables mapped)  
**All models:** `managed = False`

| Table | Model class | Model file | Rows | Status |
|-------|-------------|------------|------|--------|
| `attendence_type` | `AttendenceType` | `models/attendence_type.py` | 6 | Mapped |

## Excluded (mapped in other apps)

| Table | App | Rows | Notes |
|-------|-----|------|-------|
| `student_attendences` | students | 1,028,060 | FK → `attendence_type`, `student_session` |
| `student_attendences_hostel` | students | 6 | FK → `attendence_type`, `student_session` |
| `student_attendences_transport` | students | 0 | FK → `attendence_type`, `student_session` |
| `student_subject_attendances` | students | 0 | FK → `attendence_type`, `student_session`, `subject_timetable` |
| `staff_attendance` | staff | 0 | Uses `staff_attendance_type` (staff app) |
| `staff_attendance_type` | staff | 5 | Separate lookup from student `attendence_type` |
| `cyc_ptm_attendance` | — | 0 | Unclassified cyc extension; not mapped |

## Dependencies

`attendence_type` has **no outbound FKs** — it is the root lookup table for student attendance.

## Cross-domain references

| Consumer | Column | Domain | FK enforced |
|----------|--------|--------|-------------|
| `student_attendences` | `attendence_type_id` | students | Yes |
| `student_attendences_hostel` | `attendence_type_id` | students | Yes |
| `student_attendences_transport` | `attendence_type_id` | students | Yes |
| `student_subject_attendances` | `attendence_type_id` | students | Yes |

Student models currently use `IntegerField` for `attendence_type_id`. Optional future wiring:

```python
# apps.students.models — deferred
attendence_type_id = models.ForeignKey(
    "attendance.AttendenceType",
    on_delete=models.CASCADE,
    db_column="attendence_type_id",
)
```

## Regeneration

```bash
cd backend
python scripts/introspect_attendance_domain.py
python scripts/generate_attendance_models.py
```
