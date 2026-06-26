# Cross-App ForeignKey Enhancement Report

**Purpose:** Document `IntegerField` columns that can be upgraded to Django `ForeignKey` for ORM ergonomics.  
**Scope:** All mapped domains as of Fees completion (accounts, students, academics, staff, attendance, fees).  
**Policy:** `managed=False` remains required. Wiring `ForeignKey` does **not** require migrations when `db_column` is preserved and `managed=False` — Django will not ALTER the database.

**This report does not modify any models.**

---

## Summary

| Category | Count | Description |
|----------|-------|-------------|
| **Tier 1 — Safe now** | 38 | DB FK exists; target model mapped |
| **Tier 2 — Same-app safe** | 12 | DB FK exists; both models in same app |
| **Tier 3 — Logical only** | 8 | No DB FK; target mapped — use with caution |
| **Blocked** | 15+ | Target table not yet mapped |

---

## Tier 1 — Cross-app, DB FK enforced (recommended first)

These have `information_schema` foreign keys and both sides have Django models.

### `apps.students` → `apps.fees`

| Model | Column | Target model | Target app | DB FK |
|-------|--------|--------------|------------|-------|
| `StudentFees` | `feemaster_id` | `Feemasters` | fees | Yes |
| `StudentFeesMaster` | `fee_session_group_id` | `FeeSessionGroups` | fees | Yes |
| `StudentFeesDeposite` | `fee_groups_feetype_id` | `FeeGroupsFeetype` | fees | Yes |
| `StudentFeesProcessing` | `fee_groups_feetype_id` | `FeeGroupsFeetype` | fees | Yes |
| `StudentFeesDiscounts` | `fees_discount_id` | `FeesDiscounts` | fees | Yes |

Suggested pattern:

```python
feemaster = models.ForeignKey(
    "fees.Feemasters",
    on_delete=models.CASCADE,
    db_column="feemaster_id",
    blank=True,
    null=True,
    related_name="+",
)
```

### `apps.students` → `apps.attendance`

| Model | Column | Target model | DB FK |
|-------|--------|--------------|-------|
| `StudentAttendences` | `attendence_type_id` | `AttendenceType` | Yes |
| `StudentAttendencesHostel` | `attendence_type_id` | `AttendenceType` | Yes |
| `StudentAttendencesTransport` | `attendence_type_id` | `AttendenceType` | Yes |
| `StudentSubjectAttendances` | `attendence_type_id` | `AttendenceType` | Yes |

### `apps.students` → `apps.academics`

| Model | Column | Target model | DB FK |
|-------|--------|--------------|-------|
| `StudentSession` | `session_id` | `Sessions` | Yes |
| `StudentSession` | `class_id` | `Classes` | Yes |
| `StudentSession` | `section_id` | `Sections` | Yes |

### `apps.students` → `apps.students` (intra-app, high value)

| Model | Column | Target model | DB FK |
|-------|--------|--------------|-------|
| `StudentFees` | `student_session_id` | `StudentSession` | Yes |
| `StudentFeesMaster` | `student_session_id` | `StudentSession` | Yes |
| `StudentFeesDeposite` | `student_fees_master_id` | `StudentFeesMaster` | Yes |
| `StudentFeesProcessing` | `student_fees_master_id` | `StudentFeesMaster` | Yes |
| `StudentFeesDiscounts` | `student_session_id` | `StudentSession` | Yes |
| `StudentAttendences*` | `student_session_id` | `StudentSession` | Yes |
| `StudentTimeline` | `student_id` | `Students` | Yes |
| `StudentApplyleave` | `student_session_id` | `StudentSession` | Yes |

### `apps.fees` → `apps.academics`

| Model | Column | Target model | DB FK |
|-------|--------|--------------|-------|
| `FeeSessionGroups` | `session_id` | `Sessions` | Yes |
| `FeeGroupsFeetype` | `session_id` | `Sessions` | Yes |
| `Feemasters` | `session_id` | `Sessions` | Yes |
| `Feemasters` | `class_id` | `Classes` | Yes |
| `FeesDiscounts` | `session_id` | `Sessions` | Yes |

### `apps.accounts` → `apps.staff`

| Model | Column | Target model | DB FK |
|-------|--------|--------------|-------|
| `StaffRole` | `staff_id` | `Staff` | Yes |

Note: `StaffRole.role` is **already** a `ForeignKey` to `Role`.

---

## Tier 2 — Same-app, DB FK enforced

### `apps.fees` (internal)

| Model | Column | Target model | DB FK |
|-------|--------|--------------|-------|
| `FeeSessionGroups` | `fee_groups_id` | `FeeGroups` | Yes |
| `FeeGroupsFeetype` | `fee_session_group_id` | `FeeSessionGroups` | Yes |
| `FeeGroupsFeetype` | `fee_groups_id` | `FeeGroups` | Yes |
| `FeeGroupsFeetype` | `feetype_id` | `Feetype` | Yes |
| `Feemasters` | `feetype_id` | `Feetype` | Yes |

### `apps.staff` (internal)

| Model | Column | Target model | DB FK |
|-------|--------|--------------|-------|
| `Staff` | `department` | `Department` | Yes |
| `Staff` | `designation` | `StaffDesignation` | Yes |
| `StaffAttendance` | `staff_id` | `Staff` | Yes |
| `StaffAttendance` | `staff_attendance_type_id` | `StaffAttendanceType` | Yes |
| `StaffLeaveDetails` | `staff_id` | `Staff` | Yes |
| `StaffLeaveRequest` | `staff_id` | `Staff` | Yes |
| `StaffLeaveRequest` | `applied_by` | `Staff` | Yes (self-ref) |
| `StaffPayslip` | `staff_id` | `Staff` | Yes |
| `StaffRating` | `staff_id` | `Staff` | Yes |
| `StaffTimeline` | `staff_id` | `Staff` | Yes |
| `ConferenceStaff` | `staff_id` | `Staff` | Yes |
| `GmeetStaff` | `staff_id` | `Staff` | Yes |

### `apps.academics` (internal)

| Model | Column | Target model | DB FK |
|-------|--------|--------------|-------|
| `ClassSections` | `class_id` | `Classes` | Yes |
| `ClassSections` | `section_id` | `Sections` | Yes |

---

## Tier 3 — Logical reference only (no DB FK)

Upgrade only if application-level integrity is acceptable. DB will not enforce.

| Model | App | Column | Likely target | Risk |
|-------|-----|--------|---------------|------|
| `Staff` | staff | `user_id` | `accounts.User` | No DB FK; login coupling |
| `Staff` | staff | `direct_manager` | `Staff` | Self-ref, no FK |
| `FeeGroupsFeetype` | fees | `class_id` | `academics.Classes` | Denormalized scope |
| `FeeSessionGroups` | fees | `class_id` | `academics.Classes` | No DB FK |
| `FeeGroupsFeetype` | fees | `parent_id` | `FeeGroupsFeetype` | Tree, no FK |
| `Feetype` | fees | `feecategory_id` | `categories` (unmapped) | Blocked until settings |
| `FeeReceiptNo` | fees | `payment` | counter value | Not a row reference |
| `StudentApplyleave` | students | `approve_by` | `Staff` or `User` | No DB FK |

---

## Blocked — target not yet mapped

Do **not** wire `ForeignKey` until target domain is mapped.

| Model | App | Column | Missing target |
|-------|-----|--------|----------------|
| `StudentSession` | students | `hostel_room_id` | `hostel_rooms` (hostel) |
| `StudentSession` | students | `vehroute_id` | `vehicle_routes` (transport) |
| `StudentSession` | students | `route_pickup_point_id` | `route_pickup_point` (transport) |
| `StudentTransportFees` | students | `transport_feemaster_id` | `transport_feemaster` (transport) |
| `StudentTransportFees` | students | `route_pickup_point_id` | `route_pickup_point` (transport) |
| `StudentFeesDeposite` | students | `student_transport_fee_id` | `StudentTransportFees` (intra — optional) |
| `StudentFeesProcessing` | students | `gateway_ins_id` | `gateway_ins` (fees extension) |
| `StudentFeesProcessing` | students | `student_transport_fee_id` | `StudentTransportFees` |
| `StudentSubjectAttendances` | students | `subject_timetable_id` | `subject_timetable` (academics extended) |
| `StaffLeaveDetails` | staff | `leave_type_id` | `leave_types` (settings) |
| `StaffLeaveRequest` | staff | `leave_type_id` | `leave_types` (settings) |
| `ConferenceStaff` | staff | `conference_id` | `conferences` (communications) |
| `GmeetStaff` | staff | `gmeet_id` | `gmeet` (communications) |
| `StudentQuizStatus` | students | `course_quiz_id` | `online_course_quiz` (lms) |
| `StudentIncidents` | students | `incident_id` | `incidents` (unmapped) |

---

## Implementation guidelines (when approved)

1. **Keep `managed = False`** on all models.
2. **Always set `db_column`** to the original column name.
3. Use **`related_name='+'`** on cross-app FKs to avoid reverse accessor clutter.
4. Match **`on_delete`** to MySQL constraint (`CASCADE` where DB uses `ON DELETE CASCADE`).
5. **Do not run `makemigrations`** for business tables — ORM-only change.
6. Wire in phases: same-app first, then students→fees/attendance/academics, then accounts→staff.
7. Add `select_related` / `prefetch_related` in querysets after wiring — no schema impact.

---

## Recommended wiring order

1. **fees internal** — `FeeGroupsFeetype`, `FeeSessionGroups`, `Feemasters`
2. **fees → academics** — `session_id`, `class_id` on fee models
3. **students → fees** — all `student_fees*` fee references
4. **students → attendance** — `attendence_type_id`
5. **students → academics** — `StudentSession` session/class/section
6. **students intra** — `student_session_id` chains
7. **staff internal** — department, designation, attendance, leave, payslip
8. **accounts → staff** — `StaffRole.staff_id`

---

## Domains completed that enable this report

| Domain | Tables | Enables FK wiring to |
|--------|--------|----------------------|
| accounts | 11 | staff (partial — `StaffRole`) |
| academics | 5 | students, fees |
| students | 21 | fees, attendance (as consumer) |
| staff | 16 | accounts (consumer) |
| attendance | 1 | students (consumer) |
| fees | 8 | students (consumer), academics |

**Next domain (Examinations)** will add ~36 more blocked references in student/exam tables — do not wire exam FKs until that domain is mapped.

---

*Generated after Fees domain mapping. No models were modified.*
