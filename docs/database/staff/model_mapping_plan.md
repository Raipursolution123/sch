# Staff Domain — Model Mapping Plan

**App:** `apps.staff`  
**Status:** Complete (16/16 tables mapped)  
**All models:** `managed = False`

| Table | Model class | Model file | Rows | Status |
|-------|-------------|------------|------|--------|
| `department` | `Department` | `models/department.py` | 21 | Mapped |
| `staff_designation` | `StaffDesignation` | `models/staff_designation.py` | 19 | Mapped |
| `staff` | `Staff` | `models/staff.py` | 289 | Mapped |
| `staff_attendance_type` | `StaffAttendanceType` | `models/staff_attendance_type.py` | 5 | Mapped |
| `staff_attendance` | `StaffAttendance` | `models/staff_attendance.py` | 0 | Mapped |
| `staff_leave_details` | `StaffLeaveDetails` | `models/staff_leave_details.py` | 690 | Mapped |
| `staff_leave_request` | `StaffLeaveRequest` | `models/staff_leave_request.py` | 2 | Mapped |
| `staff_payroll` | `StaffPayroll` | `models/staff_payroll.py` | 0 | Mapped |
| `staff_payslip` | `StaffPayslip` | `models/staff_payslip.py` | 0 | Mapped |
| `staff_rating` | `StaffRating` | `models/staff_rating.py` | 78 | Mapped |
| `staff_timeline` | `StaffTimeline` | `models/staff_timeline.py` | 0 | Mapped |
| `staff_id_card` | `StaffIdCard` | `models/staff_id_card.py` | 2 | Mapped |
| `conference_staff` | `ConferenceStaff` | `models/conference_staff.py` | 0 | Mapped |
| `gmeet_staff` | `GmeetStaff` | `models/gmeet_staff.py` | 0 | Mapped |
| `cyc_staff_payroll` | `CycStaffPayroll` | `models/cyc_staff_payroll.py` | 4 | Mapped |
| `cyc_staff_payroll_increment` | `CycStaffPayrollIncrement` | `models/cyc_staff_payroll_increment.py` | 3 | Mapped |

## Excluded from `apps.staff`

| Table | App | Reason |
|-------|-----|--------|
| `staff_roles` | `apps.accounts` | RBAC junction (`staff_id` + `role_id`); belongs with auth domain |

## Dependency order (within staff app)

```
department ──┐
             ├──► staff ◄── staff_designation
staff_attendance_type ──► staff_attendance
staff ──► staff_leave_details / staff_leave_request / staff_payslip / staff_rating / staff_timeline
staff ──► conference_staff / gmeet_staff
```

`staff_payroll`, `staff_id_card`, `cyc_staff_payroll*`, and `staff_attendance_type` have no inbound FKs from other staff tables.

## Cross-domain references

| Staff table / column | External table | External domain | DB FK enforced |
|----------------------|----------------|-----------------|--------------|
| `staff.user_id` | `users.id` | accounts | No |
| `staff_roles.staff_id` | `staff.id` | accounts → staff | Yes (in accounts app) |
| `staff_leave_details.leave_type_id` | `leave_types.id` | settings / HR | Yes |
| `staff_leave_request.leave_type_id` | `leave_types.id` | settings / HR | Yes |
| `staff_leave_request.applied_by` | `staff.id` | staff (self) | Yes |
| `conference_staff.conference_id` | `conferences.id` | communications | Yes |
| `gmeet_staff.gmeet_id` | `gmeet.id` | communications | Yes |
| `cyc_staff_payroll.employee_id` | (logical `staff.employee_id`) | staff | No — `double`, no FK |

FK columns use `IntegerField` + `db_index` where MUL keys exist until cross-app `ForeignKey` wiring is approved.

## Tables referencing `staff` (external consumers)

| Consumer table | Column(s) | Domain |
|----------------|-----------|--------|
| `class_teacher` | `staff_id` | academics (future) |
| `homework` | `staff_id` | academics (future) |
| `daily_assignment` | `staff_id` | academics |
| `contents` | `staff_id` | cms |
| `chat_users` | `staff_id` | communications |
| `item_issue` | `staff_id` | inventory |
| `enquiry`, `follow_up` | `staff_id` | crm |
| `online_course_*` | various | lms |

## Regeneration

```bash
cd backend
python scripts/introspect_staff_domain.py
python scripts/generate_staff_models.py
```

## Special column mapping

| DB column | Django attribute | Notes |
|-----------|------------------|-------|
| `cyc_staff_payroll_increment.pi_id` | `pi_id` | Non-standard PK name; `AutoField(primary_key=True)` |
| `staff.department` | `department` | FK to `department.id`; interim `IntegerField` |
| `staff.designation` | `designation` | FK to `staff_designation.id`; interim `IntegerField` |
