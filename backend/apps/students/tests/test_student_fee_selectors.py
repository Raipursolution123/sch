from unittest.mock import MagicMock, patch

from apps.students.selectors import student_fee_selectors as selectors


def test_fetch_assigned_fee_lines_returns_master_rows_when_present():
    master_lines = [{"line_id": 1, "amount": 5000}]
    with patch.object(
        selectors, "_fetch_student_fee_master_lines", return_value=master_lines
    ):
        with patch.object(selectors, "_fetch_class_fee_lines") as class_fetch:
            result = selectors.fetch_assigned_fee_lines(42)

    assert result == master_lines
    class_fetch.assert_not_called()


def test_fetch_assigned_fee_lines_falls_back_to_class_assignment():
    student_session = MagicMock(class_id=3, session_id=10)
    class_lines = [{"line_id": 2, "amount": 1200}]
    with patch.object(selectors, "_fetch_student_fee_master_lines", return_value=[]):
        with patch.object(selectors.StudentSession.objects, "filter") as session_filter:
            session_filter.return_value.first.return_value = student_session
            with patch.object(
                selectors, "_fetch_class_fee_lines", return_value=class_lines
            ) as class_fetch:
                result = selectors.fetch_assigned_fee_lines(42)

    class_fetch.assert_called_once_with(3, 10)
    assert result == class_lines


def test_fetch_assigned_fee_lines_returns_empty_without_enrollment_context():
    with patch.object(selectors, "_fetch_student_fee_master_lines", return_value=[]):
        with patch.object(selectors.StudentSession.objects, "filter") as session_filter:
            session_filter.return_value.first.return_value = None
            result = selectors.fetch_assigned_fee_lines(42)

    assert result == []


def test_build_fee_lines_allocates_payments_across_fee_lines():
    assigned = [
        {
            "assignment_id": 1,
            "line_id": 10,
            "feetype_id": 1,
            "feetype_code": "TUIT",
            "feetype_name": "Tuition",
            "fee_group_name": "Class 1 Fees",
            "amount": 5000,
            "due_date": "2026-08-01",
        },
        {
            "assignment_id": 1,
            "line_id": 11,
            "feetype_id": 2,
            "feetype_code": "EXAM",
            "feetype_name": "Exam",
            "fee_group_name": "Class 1 Fees",
            "amount": 1200,
            "due_date": "2026-07-15",
        },
    ]
    payments = [
        {
            "fgft_id": 10,
            "amount": 2000,
            "date": "2026-07-01",
            "payment_mode": "Cash",
            "description": "",
            "feetype_name": "Tuition",
            "id": "dep-1-1",
        }
    ]

    lines = selectors.build_fee_lines(assigned, payments)

    assert len(lines) == 2
    assert lines[0]["amount_paid"] == 2000
    assert lines[0]["balance"] == 3000
    assert lines[0]["status"] == "partial"
    assert lines[1]["amount_paid"] == 0
    assert lines[1]["balance"] == 1200
