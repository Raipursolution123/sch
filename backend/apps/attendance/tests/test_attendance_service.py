import pytest

from apps.attendance.domain.attendance_exceptions import AttendanceValidationError
from apps.attendance.services.attendance_service import AttendanceService


def test_get_roster_requires_params():
    with pytest.raises(AttendanceValidationError, match="required"):
        AttendanceService().get_roster(None, None, None)


def test_get_report_requires_dates():
    with pytest.raises(AttendanceValidationError, match="required"):
        AttendanceService().get_report({})
