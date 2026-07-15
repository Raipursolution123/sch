from unittest.mock import MagicMock, patch

import pytest

from apps.staff.domain.staff_exceptions import (
    StaffConflictError,
    StaffNotFoundError,
    StaffValidationError,
)
from apps.staff.services.staff_service import StaffService


@pytest.fixture
def service():
    return StaffService()


def test_create_requires_employee_id(service):
    with pytest.raises(StaffValidationError, match="Employee ID"):
        service.create_staff({"name": "Jane"})


def test_create_requires_name(service):
    with pytest.raises(StaffValidationError, match="Name"):
        service.create_staff({"employee_id": "EMP-001"})


def test_create_rejects_duplicate_employee_id(service):
    with patch("apps.staff.services.staff_service.Staff.objects.filter") as filter_mock:
        filter_mock.return_value.exists.return_value = True
        with pytest.raises(StaffConflictError, match="employee ID"):
            service.create_staff({"employee_id": "EMP-001", "name": "Jane"})


def test_get_staff_not_found(service):
    with patch(
        "apps.staff.services.staff_service.selectors.get_staff_by_id",
        return_value=None,
    ):
        with pytest.raises(StaffNotFoundError):
            service.get_staff(999)


def test_create_leave_type_requires_name():
    from apps.staff.services.leave_type_service import LeaveTypeService

    with pytest.raises(StaffValidationError, match="Leave type name is required"):
        LeaveTypeService().create_type({})


def test_delete_leave_type_requires_inactive():
    from apps.staff.services.leave_type_service import LeaveTypeService

    row = MagicMock(is_active="yes")
    with patch(
        "apps.staff.services.leave_type_service.LeaveTypes.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = row
        with pytest.raises(StaffValidationError, match="Deactivate"):
            LeaveTypeService().delete_type(1)


def test_create_leave_request_requires_staff():
    from apps.staff.services.staff_leave_request_service import StaffLeaveRequestService

    with pytest.raises(StaffValidationError, match="Staff is required"):
        StaffLeaveRequestService().create_request(
            {
                "leave_type_id": 1,
                "leave_from": "2026-07-01",
                "leave_to": "2026-07-02",
            }
        )


def test_update_leave_status_requires_pending():
    from apps.staff.services.staff_leave_request_service import StaffLeaveRequestService

    row = MagicMock(status="1", admin_remark="")
    with patch(
        "apps.staff.services.staff_leave_request_service."
        "StaffLeaveRequest.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = row
        with pytest.raises(StaffValidationError, match="Only pending"):
            StaffLeaveRequestService().update_status(1, {"status": "approved"})


def test_upsert_allotment_requires_staff():
    from apps.staff.services.staff_leave_allotment_service import (
        StaffLeaveAllotmentService,
    )

    with pytest.raises(StaffValidationError, match="Staff is required"):
        StaffLeaveAllotmentService().upsert_allotment(
            {"leave_type_id": 1, "alloted_leave": "10"}
        )


def test_upsert_allotment_rejects_negative():
    from apps.staff.services.staff_leave_allotment_service import (
        StaffLeaveAllotmentService,
    )

    with (
        patch(
            "apps.staff.services.staff_leave_allotment_service.Staff.objects.filter"
        ) as staff_filter,
        patch(
            "apps.staff.services.staff_leave_allotment_service."
            "LeaveTypes.objects.filter"
        ) as type_filter,
    ):
        staff_filter.return_value.exists.return_value = True
        type_filter.return_value.exists.return_value = True
        with pytest.raises(StaffValidationError, match="cannot be negative"):
            StaffLeaveAllotmentService().upsert_allotment(
                {"staff_id": 1, "leave_type_id": 2, "alloted_leave": "-1"}
            )


def test_create_leave_rejects_insufficient_balance():
    from apps.staff.services.staff_leave_request_service import StaffLeaveRequestService

    allotment = MagicMock(alloted_leave="2")
    leave_type = MagicMock(id=2, is_active="yes")
    existing = MagicMock(leave_days=2, status="0")

    with (
        patch(
            "apps.staff.services.staff_leave_request_service.Staff.objects.filter"
        ) as staff_filter,
        patch(
            "apps.staff.services.staff_leave_request_service.LeaveTypes.objects.filter"
        ) as type_filter,
        patch(
            "apps.staff.services.staff_leave_request_service."
            "StaffLeaveDetails.objects.filter"
        ) as detail_filter,
        patch(
            "apps.staff.services.staff_leave_request_service."
            "StaffLeaveRequest.objects.filter"
        ) as request_filter,
    ):
        staff_filter.return_value.exists.return_value = True
        type_filter.return_value.first.return_value = leave_type
        detail_filter.return_value.first.return_value = allotment
        request_filter.return_value = [existing]
        with pytest.raises(StaffValidationError, match="Insufficient leave balance"):
            StaffLeaveRequestService().create_request(
                {
                    "staff_id": 1,
                    "leave_type_id": 2,
                    "leave_from": "2026-07-01",
                    "leave_to": "2026-07-01",
                    "leave_days": 1,
                }
            )


def test_delete_staff_not_found(service):
    with patch(
        "apps.staff.services.staff_service.selectors.get_staff_by_id",
        return_value=None,
    ):
        with pytest.raises(StaffNotFoundError):
            service.delete_staff(999)


def test_update_rejects_empty_employee_id(service):
    staff = MagicMock()
    with patch(
        "apps.staff.services.staff_service.selectors.get_staff_by_id",
        return_value=staff,
    ):
        with pytest.raises(StaffValidationError, match="Employee ID"):
            service.update_staff(1, {"employee_id": "  "})
