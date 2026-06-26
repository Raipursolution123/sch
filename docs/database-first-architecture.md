# Database-First Architecture

`db_current` is the **source of truth** for all business table schemas.

## Reference documents

| Document | Purpose |
|----------|---------|
| [db_current_inventory.md](database/db_current_inventory.md) | All 280 tables — PK, FKs, row counts, dependencies |
| [db_current_inventory.json](database/db_current_inventory.json) | Machine-readable full inventory |
| [domain_mapping.md](database/domain_mapping.md) | Table → Django app/domain mapping |
| [students/model_mapping_plan.md](database/students/model_mapping_plan.md) | Students domain — 21 tables mapped |
| [academics/model_mapping_plan.md](database/academics/model_mapping_plan.md) | Academics core — 5 tables mapped |
| [staff/model_mapping_plan.md](database/staff/model_mapping_plan.md) | Staff domain — 16 tables mapped |
| [staff/staff_domain_analysis.md](database/staff/staff_domain_analysis.md) | Staff inventory, ER diagram, FK analysis |
| [attendance/model_mapping_plan.md](database/attendance/model_mapping_plan.md) | Attendance domain — 1 table mapped |
| [fees/model_mapping_plan.md](database/fees/model_mapping_plan.md) | Fees domain — 8 tables mapped |
| [examinations/model_mapping_plan.md](database/examinations/model_mapping_plan.md) | Examinations domain — 41 tables mapped |
| [examinations/business_flow.md](database/examinations/business_flow.md) | Exam flows derived from schema |
| [cross_app_fk_enhancement_report.md](database/cross_app_fk_enhancement_report.md) | Future ForeignKey wiring (ORM-only) |
| [domain_dependency_report.md](database/domain_dependency_report.md) | Cross-domain FK dependencies & implementation order |
| [auth-architecture.md](database/auth-architecture.md) | Authentication & RBAC flow review |

Regenerate inventory:

```bash
cd backend
python scripts/generate_db_inventory.py
```

## Flow

```
db_current schema  →  Django models (managed=False)  →  API  →  Frontend
```

## Accounts domain mapping

| db_current table       | Django model          | Status |
|------------------------|-----------------------|--------|
| `users`                | `User`                | Aligned |
| `roles`                | `Role`                | Aligned |
| `roles_permissions`    | `RolePermission`      | Aligned |
| `staff_roles`          | `StaffRole`           | Aligned |
| `permission_group`     | `PermissionGroup`     | Aligned |
| `permission_category`  | `PermissionCategory`  | Aligned |
| `permission_student`   | `PermissionStudent`   | Aligned |
| `users_authentication` | `UserAuthentication`  | Aligned |
| `userlog`              | `UserLog`             | Aligned |

## Staff domain mapping

| db_current table | Django model | App | Status |
|------------------|--------------|-----|--------|
| `department` | `Department` | staff | Aligned |
| `staff_designation` | `StaffDesignation` | staff | Aligned |
| `staff` | `Staff` | staff | Aligned |
| `staff_attendance_type` | `StaffAttendanceType` | staff | Aligned |
| `staff_attendance` | `StaffAttendance` | staff | Aligned |
| `staff_leave_details` | `StaffLeaveDetails` | staff | Aligned |
| `staff_leave_request` | `StaffLeaveRequest` | staff | Aligned |
| `staff_payroll` | `StaffPayroll` | staff | Aligned |
| `staff_payslip` | `StaffPayslip` | staff | Aligned |
| `staff_rating` | `StaffRating` | staff | Aligned |
| `staff_timeline` | `StaffTimeline` | staff | Aligned |
| `staff_id_card` | `StaffIdCard` | staff | Aligned |
| `conference_staff` | `ConferenceStaff` | staff | Aligned |
| `gmeet_staff` | `GmeetStaff` | staff | Aligned |
| `cyc_staff_payroll` | `CycStaffPayroll` | staff | Aligned |
| `cyc_staff_payroll_increment` | `CycStaffPayrollIncrement` | staff | Aligned |
| `staff_roles` | `StaffRole` | **accounts** | Aligned (not in staff app) |

## Attendance domain mapping

| db_current table | Django model | App | Status |
|------------------|--------------|-----|--------|
| `attendence_type` | `AttendenceType` | attendance | Aligned |

Student attendance fact tables (`student_attendences*`, `student_subject_attendances`) remain in **students**. Staff attendance (`staff_attendance`, `staff_attendance_type`) remains in **staff**.

## Fees domain mapping

| db_current table | Django model | App | Status |
|------------------|--------------|-----|--------|
| `fee_groups` | `FeeGroups` | fees | Aligned |
| `feetype` | `Feetype` | fees | Aligned |
| `fee_session_groups` | `FeeSessionGroups` | fees | Aligned |
| `fee_groups_feetype` | `FeeGroupsFeetype` | fees | Aligned |
| `feemasters` | `Feemasters` | fees | Aligned |
| `fees_discounts` | `FeesDiscounts` | fees | Aligned |
| `fees_reminder` | `FeesReminder` | fees | Aligned |
| `fee_receipt_no` | `FeeReceiptNo` | fees | Aligned |

Student fee transaction tables (`student_fees*`) remain in **students**. Payment gateway tables (`gateway_ins*`, `offline_fees_payments`) deferred to fees extension phase.

## Examinations domain mapping

**41 tables** in `apps.examinations` — CBSE exam (`cbse_*`), legacy exam groups (`exam_group_*`, `exams`, `exam_schedules`), and online exam (`onlineexam_*`). See [examinations/model_mapping_plan.md](database/examinations/model_mapping_plan.md).

## Removed incorrect assumptions

The initial scaffold incorrectly assumed these tables existed:

| Assumed (wrong)   | Actual in db_current        |
|-------------------|-----------------------------|
| `permissions`     | `permission_category`, `permission_group`, `permission_student` |
| `role_permissions`| `roles_permissions`         |
| `user_roles`      | `staff_roles`               |
| UUID `users.id`   | `int(11)` auto increment    |
| `email` login     | `username` varchar(50)      |
| `is_superadmin` on users | `is_superadmin` on `roles` |

## Rules

1. All legacy models use `managed = False`.
2. Never run migrations that `CREATE` or `ALTER` db_current business tables.
3. Use `scripts/inspect_db_current.py` to refresh schema snapshots before model changes.
4. New Django-only infrastructure tables (admin, sessions, Celery beat) are **not** in `db_current` and require explicit approval before creation.

## Environment

Set in `.env`:

```env
DB_NAME=db_current
```

Use schema introspection scripts under `backend/scripts/` to verify compatibility after any model edit.
