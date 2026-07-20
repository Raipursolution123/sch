from unittest.mock import MagicMock, patch

import pytest

from apps.students.services.student_service import StudentService


def test_enrich_list_page_batches_disable_reasons():
    student_a = MagicMock(
        id=1,
        dis_reason=10,
        admission_no="A1",
        roll_no=1,
        firstname="A",
        middlename=None,
        lastname="One",
        gender="Male",
        mobileno=None,
        email=None,
        dob=None,
        is_active="yes",
        admission_date=None,
        created_at=None,
        dis_note=None,
        disable_at=None,
    )
    student_b = MagicMock(
        id=2,
        dis_reason=20,
        admission_no="A2",
        roll_no=2,
        firstname="B",
        middlename=None,
        lastname="Two",
        gender="Female",
        mobileno=None,
        email=None,
        dob=None,
        is_active="no",
        admission_date=None,
        created_at=None,
        dis_note="Left",
        disable_at=None,
    )
    session = MagicMock(id=5)
    enrollment = MagicMock(class_id=1, section_id=2)

    with (
        patch(
            "apps.students.services.student_service.selectors.get_active_session",
            return_value=session,
        ),
        patch(
            "apps.students.services.student_service.selectors.enrollments_for_students",
            return_value={1: enrollment},
        ),
        patch(
            "apps.students.services.student_service.selectors.class_labels",
            return_value={1: "Class 5"},
        ),
        patch(
            "apps.students.services.student_service.selectors.section_labels",
            return_value={2: "A"},
        ),
        patch(
            "apps.students.services.student_service.selectors.disable_reason_labels",
            return_value={10: "Transfer", 20: "Dropout"},
        ) as disable_labels_mock,
    ):
        rows = StudentService.enrich_list_page([student_a, student_b])

    disable_labels_mock.assert_called_once_with([10, 20])
    assert rows[0]["disable_reason_name"] == "Transfer"
    assert rows[1]["disable_reason_name"] == "Dropout"
