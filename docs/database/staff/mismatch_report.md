# Staff Domain — Mismatch Report

Comparison of common ERP assumptions vs `db_current` introspection (`staff_domain_inventory.json`).

---

## Schema mismatches (assumptions vs reality)

| Assumption | db_current reality | Resolution |
|------------|-------------------|------------|
| Table `staff_department` | **`department`** (21 rows) | Model `Department`, `db_table='department'` |
| `staff_roles` in staff app | Junction in **`accounts`** domain | Mapped as `StaffRole` in `apps.accounts` |
| `staff.is_active` boolean | `int(11) NOT NULL` | `IntegerField()` |
| `department.is_active` boolean | `varchar(100) NOT NULL` | `CharField(max_length=100)` |
| `staff_designation.is_active` boolean | `varchar(100) NOT NULL` | `CharField(max_length=100)` |
| `staff_payroll.is_active` boolean | `varchar(50) NOT NULL` | `CharField(max_length=50)` |
| `staff_attendance_type.is_active` flag | `varchar(50) NOT NULL` | `CharField(max_length=50)` |
| `staff_leave_details.alloted_leave` numeric | `varchar(100) NOT NULL` | `CharField` (legacy spelling preserved) |
| `staff.user_id` FK to `users` | `int(11) NOT NULL`, **no FK constraint** | `IntegerField()` — link via service layer |
| `staff.password` hashed | `varchar(250) NOT NULL` plaintext | Exact mapping; auth uses `users` table |
| `staff_payroll` linked to `staff` | **No FK** — lookup table only (5 cols) | Standalone model |
| `cyc_staff_payroll.employee_id` | `double` with index, **no FK** | `FloatField` — may store numeric employee codes |
| `cyc_staff_payroll_increment.staff_id` | `int(11)` **no FK constraint** | `IntegerField()` |
| PK always named `id` | `cyc_staff_payroll_increment` uses **`pi_id`** | `AutoField(primary_key=True)` on `pi_id` |

---

## Legacy naming

| Item | Notes |
|------|-------|
| `biometric_attendence` | Misspelled column on `staff_attendance` (not `attendance`) — preserved |
| `alloted_leave` | Misspelled on `staff_leave_details` (not `allocated`) — preserved |
| `department` | Generic table name; not prefixed `staff_` |
| `pay_scale` vs `payscale` | `staff_payroll.pay_scale` vs `staff.payscale` — different columns |

---

## Non-standard types

| Table | Column | MySQL type | Django field |
|-------|--------|------------|--------------|
| `cyc_staff_payroll` | `employee_id` | `double` | `FloatField` |
| `cyc_staff_payroll` | `payroll_amount` | `double` | `FloatField` |
| `cyc_staff_payroll_increment` | `basic_salary`, `increment` | `double` | `FloatField` |
| `staff_attendance` | `biometric_device_data` | `text` | `TextField` |
| `staff_timeline` | `description` | `varchar(300)` | `CharField(max_length=300)` |

---

## Nullable / timestamp quirks

| Table | Column | Issue |
|-------|--------|-------|
| `staff_attendance_type` | `created_at` | `timestamp` with `ON UPDATE CURRENT_TIMESTAMP` |
| `staff_attendance_type` | `updated_at` | `date` nullable — mixed date/timestamp pattern |
| `staff_attendance` | `updated_at` | `date` nullable while `created_at` is `datetime` |
| `staff_attendance` | `biometric_attendence` | nullable `int` default `0` |
| `staff` | `currency_id` | nullable default `0` (not NULL sentinel) |
| `staff` | `date_of_joining`, `date_of_leaving` | nullable dates |
| `cyc_staff_payroll_increment` | `month`, `year` | `varchar(44)` nullable — not date types |

---

## Varchar boolean / status flags

| Table | Column | Type | Typical legacy values |
|-------|--------|------|----------------------|
| `department` | `is_active` | `varchar(100)` | active/inactive strings |
| `staff_designation` | `is_active` | `varchar(100)` | same pattern |
| `staff_payroll` | `is_active` | `varchar(50)` | same pattern |
| `staff_attendance_type` | `is_active` | `varchar(50)` | same pattern |
| `staff_leave_request` | `status` | `varchar(100)` | pending/approved/etc. |
| `cyc_staff_payroll_increment` | `status` | `varchar(44)` default `'pending'` | preserved default |

---

## Unusual constraints

| Table | Constraint | Notes |
|-------|------------|-------|
| `staff` | `UNIQUE(employee_id)` | Enforced in DB |
| `staff` | `ON DELETE CASCADE` on `department`, `designation` | Deleting dept/designation removes staff rows |
| `staff_leave_request` | `applied_by` → `staff.id` | Self-referential FK (approver is also staff) |
| `staff_payroll` | No FKs | Global pay-scale definitions, not per-employee |
| `staff_id_card` | No FKs | Template/config for ID card layout (22 columns) |
| `cyc_staff_payroll*` | No FKs | Custom extension tables; loose `employee_id` / `staff_id` linkage |

---

## Django ORM vs DB constraints

| Item | ORM | Database | Impact |
|------|-----|----------|--------|
| Intra-staff FKs | `IntegerField` + `db_index` | FK constraints exist | No migration impact (`managed=False`) |
| `staff.user_id` | `IntegerField` | No FK to `users` | Join in application layer |
| `cyc_staff_payroll_increment.staff_id` | `IntegerField` | No FK | Application must validate |
| `staff_roles` | In `apps.accounts` | FK to `staff`, `roles` | Cross-app reference point for RBAC |

---

## Domain boundary notes

| Table | Classifier | Approved placement |
|-------|------------|-------------------|
| `staff_roles` | `staff*` prefix | **accounts** |
| `conference_staff`, `gmeet_staff` | communications bridges | **staff** (colocated; FK to external comms tables) |
| `cyc_staff_payroll*` | `cyc_*` prefix | **staff** for now; may move to `cyc_extensions` later |
| `leave_types` | not in staff inventory | **settings** — required before leave APIs |

---

## Actions taken

- [x] 16 staff tables mapped with exact names and types
- [x] `managed=False` on all staff models
- [x] No migrations generated
- [x] `staff_roles` excluded — remains in `apps.accounts`
- [ ] Cross-app `ForeignKey` wiring (deferred until consumer domains mapped)
- [ ] `leave_types` model (settings domain — prerequisite for leave workflows)
