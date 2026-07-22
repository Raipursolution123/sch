from unittest.mock import patch

import pytest

from apps.staff.domain.staff_exceptions import (
    StaffNotFoundError,
    StaffValidationError,
)
from apps.staff.services.department_designation_service import (
    DepartmentService,
    DesignationService,
)
from apps.staff.services.staff_attendance_service import StaffAttendanceService
from apps.staff.services.staff_payroll_service import StaffPayrollService


def test_department_requires_name():
    with pytest.raises(StaffValidationError, match="name"):
        DepartmentService().create({"department_name": "  "})


def test_designation_requires_name():
    with pytest.raises(StaffValidationError, match="name"):
        DesignationService().create({"designation": ""})


def test_attendance_roster_requires_date():
    with pytest.raises(StaffValidationError, match="date"):
        StaffAttendanceService().get_roster(date_str="")


def test_attendance_mark_requires_entries():
    with pytest.raises(StaffValidationError, match="entries"):
        StaffAttendanceService().mark({"date": "2026-07-22", "entries": []})


def test_payroll_scale_requires_pay_scale():
    with pytest.raises(StaffValidationError, match="Pay scale"):
        StaffPayrollService().create_scale({"basic_salary": 1000})


def test_payslip_requires_staff():
    with patch("apps.staff.services.staff_payroll_service.Staff.objects") as objects:
        objects.filter.return_value.first.return_value = None
        with pytest.raises(StaffNotFoundError, match="Staff"):
            StaffPayrollService().create_payslip(
                {"staff_id": 9, "month": "July", "year": "2026"},
                generated_by=1,
            )


def test_delete_scale_not_found():
    with patch(
        "apps.staff.services.staff_payroll_service.StaffPayroll.objects"
    ) as objects:
        objects.filter.return_value.first.return_value = None
        with pytest.raises(StaffNotFoundError, match="Pay scale"):
            StaffPayrollService().delete_scale(99)
