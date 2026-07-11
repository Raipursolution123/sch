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
