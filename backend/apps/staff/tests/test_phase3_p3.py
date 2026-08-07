"""Phase 3 unit coverage: apply leave, disabled staff, payroll increment."""

from unittest.mock import MagicMock, patch

import pytest

from apps.staff.domain.staff_exceptions import StaffNotFoundError, StaffValidationError
from apps.staff.services.staff_leave_request_service import StaffLeaveRequestService
from apps.staff.services.staff_payroll_increment_service import (
    StaffPayrollIncrementService,
)


class TestStaffLeaveApply:
    def test_apply_requires_staff_profile(self):
        user = MagicMock(user_id=99, pk=99)
        with patch.object(
            StaffLeaveRequestService, "_staff_for_user", return_value=None
        ):
            with pytest.raises(StaffValidationError, match="staff profile"):
                StaffLeaveRequestService().apply_request({}, user)

    @patch.object(StaffLeaveRequestService, "create_request")
    @patch.object(StaffLeaveRequestService, "_staff_for_user")
    def test_apply_sets_staff_and_applied_by(self, mock_staff_for_user, mock_create):
        staff = MagicMock(id=7)
        mock_staff_for_user.return_value = staff
        mock_create.return_value = {"id": 1}
        user = MagicMock(user_id=12, pk=12)
        result = StaffLeaveRequestService().apply_request(
            {
                "leave_type_id": 1,
                "leave_from": "2026-08-01",
                "leave_to": "2026-08-02",
            },
            user,
        )
        assert result == {"id": 1}
        mock_create.assert_called_once()
        payload = mock_create.call_args.args[0]
        assert payload["staff_id"] == 7
        assert payload["applied_by"] == 12


class TestStaffPayrollIncrementService:
    def test_create_requires_staff(self):
        with pytest.raises(StaffValidationError, match="Staff is required"):
            StaffPayrollIncrementService().create_request({}, entry_by=1)

    def test_create_requires_positive_increment(self):
        with patch(
            "apps.staff.services.staff_payroll_increment_service.Staff"
        ) as mock_staff:
            mock_staff.objects.filter.return_value.first.return_value = MagicMock(
                id=1, basic_salary=1000
            )
            with pytest.raises(StaffValidationError, match="greater than zero"):
                StaffPayrollIncrementService().create_request(
                    {"staff_id": 1, "increment": 0}, entry_by=1
                )

    @patch(
        "apps.staff.services.staff_payroll_increment_service.CycStaffPayrollIncrement"
    )
    def test_approve_not_found(self, mock_model):
        mock_model.objects.filter.return_value.first.return_value = None
        with pytest.raises(StaffNotFoundError, match="not found"):
            StaffPayrollIncrementService().approve(99, action_by=1)

    @patch("apps.staff.services.staff_payroll_increment_service.Staff")
    @patch(
        "apps.staff.services.staff_payroll_increment_service.CycStaffPayrollIncrement"
    )
    def test_approve_pending_only(self, mock_model, mock_staff):
        row = MagicMock(
            pi_id=1,
            staff_id=2,
            status="approved",
            increment=100,
            month="August",
            year="2026",
            basic_salary=1000,
            date=None,
            entry_by=1,
            action_by=0,
            action_date=None,
        )
        mock_model.objects.filter.return_value.first.return_value = row
        with pytest.raises(StaffValidationError, match="pending"):
            StaffPayrollIncrementService().approve(1, action_by=1)
