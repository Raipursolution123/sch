from unittest.mock import patch, MagicMock
import pytest

from apps.staff.domain.staff_exceptions import StaffNotFoundError, StaffValidationError
from apps.staff.services.staff_payroll_increment_service import StaffPayrollIncrementService


def test_create_increment_requires_month_year():
    with patch("apps.staff.services.staff_payroll_increment_service.Staff.objects") as staff_objects:
        mock_staff = MagicMock()
        mock_staff.basic_salary = 1000
        staff_objects.filter.return_value.first.return_value = mock_staff

        with pytest.raises(StaffValidationError, match="month and year"):
            StaffPayrollIncrementService().create(
                {"staff_id": 1, "month": "", "year": "2026", "increment": 200},
                entry_by=1
            )


def test_create_increment_invalid_increment():
    with patch("apps.staff.services.staff_payroll_increment_service.Staff.objects") as staff_objects:
        mock_staff = MagicMock()
        mock_staff.basic_salary = 1000
        staff_objects.filter.return_value.first.return_value = mock_staff

        with pytest.raises(StaffValidationError, match="Increment must be greater than zero"):
            StaffPayrollIncrementService().create(
                {"staff_id": 1, "month": "July", "year": "2026", "increment": 0},
                entry_by=1
            )


def test_approve_increment_staff_not_found():
    with patch("apps.staff.services.staff_payroll_increment_service.CycStaffPayrollIncrement.objects") as inc_objects:
        mock_inc = MagicMock()
        mock_inc.status = "pending"
        mock_inc.staff_id = 999
        mock_inc.increment = 200
        inc_objects.filter.return_value.first.return_value = mock_inc

        with patch("apps.staff.services.staff_payroll_increment_service.Staff.objects") as staff_objects:
            staff_objects.filter.return_value.first.return_value = None

            with pytest.raises(StaffNotFoundError, match="Associated staff not found"):
                StaffPayrollIncrementService().approve(1, action_by=1)


def test_reject_increment_changes_status():
    with patch("apps.staff.services.staff_payroll_increment_service.CycStaffPayrollIncrement.objects") as inc_objects:
        mock_inc = MagicMock()
        mock_inc.status = "pending"
        mock_inc.staff_id = 1
        inc_objects.filter.return_value.first.return_value = mock_inc

        res = StaffPayrollIncrementService().reject(1, action_by=1)
        assert res["message"] == "Payroll increment request rejected successfully."
        assert mock_inc.status == "rejected"
