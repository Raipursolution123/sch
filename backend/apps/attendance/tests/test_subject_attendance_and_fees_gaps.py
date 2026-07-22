from unittest.mock import patch

import pytest

from apps.attendance.domain.attendance_exceptions import AttendanceValidationError
from apps.attendance.services.subject_attendance_service import SubjectAttendanceService
from apps.fees.domain.fee_exceptions import FeeValidationError
from apps.fees.services.fee_carry_forward_service import FeeCarryForwardService
from apps.fees.services.fee_student_assign_service import FeeStudentAssignService


def test_subject_periods_require_filters():
    with pytest.raises(AttendanceValidationError, match="required"):
        SubjectAttendanceService().list_periods(class_id=0, section_id=1, date_str="")


def test_subject_roster_requires_period():
    with pytest.raises(AttendanceValidationError, match="required"):
        SubjectAttendanceService().get_roster(
            subject_timetable_id=0, date_str="2026-07-22"
        )


def test_subject_mark_requires_entries():
    with pytest.raises(AttendanceValidationError, match="entries"):
        SubjectAttendanceService().mark(
            {"subject_timetable_id": 1, "date": "2026-07-22", "entries": []}
        )


def test_student_assign_requires_fee_group():
    with pytest.raises(FeeValidationError, match="fee_session_group"):
        FeeStudentAssignService().save_assignments({"student_session_ids": [1]})


def test_carry_forward_requires_different_sessions():
    with pytest.raises(FeeValidationError, match="different"):
        FeeCarryForwardService().preview(
            from_session_id=1, to_session_id=1, class_id=1, section_id=1
        )


def test_carry_forward_requires_students():
    with patch(
        "apps.fees.services.fee_carry_forward_service.FeeCarryForwardService.preview"
    ) as preview:
        preview.return_value = {"students": []}
        with patch(
            "apps.fees.services.fee_carry_forward_service.FeeSessionGroups.objects"
        ) as objects:
            objects.filter.return_value.first.return_value = type(
                "Fsg", (), {"session_id": 2}
            )()
            with pytest.raises(FeeValidationError, match="student"):
                FeeCarryForwardService().carry_forward(
                    {
                        "from_session_id": 1,
                        "to_session_id": 2,
                        "class_id": 1,
                        "section_id": 1,
                        "fee_session_group_id": 9,
                        "student_ids": [],
                    }
                )
