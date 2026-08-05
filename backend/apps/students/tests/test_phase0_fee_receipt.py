"""Phase 0 unit tests for fee receipt allocation and CBSE marks validation."""

from unittest.mock import MagicMock, patch

import pytest

from apps.examinations.domain.examination_exceptions import ExaminationValidationError
from apps.examinations.services.cbse_marks_service import CbseMarksService
from apps.students.services.student_fee_service import StudentFeeService


def test_allocate_receipt_no_creates_first_row():
    with patch(
        "apps.students.services.student_fee_service.FeeReceiptNo.objects"
    ) as mock_objects:
        mock_qs = MagicMock()
        mock_qs.select_for_update.return_value.order_by.return_value.first.return_value = (
            None
        )
        mock_objects.select_for_update.return_value.order_by.return_value.first.return_value = (
            None
        )
        mock_objects.create.return_value = MagicMock(payment=1)

        result = StudentFeeService._allocate_receipt_no()

        assert result == 1
        mock_objects.create.assert_called_once_with(payment=1)


def test_allocate_receipt_no_increments_existing():
    existing = MagicMock(payment=42)
    with patch(
        "apps.students.services.student_fee_service.FeeReceiptNo.objects"
    ) as mock_objects:
        mock_objects.select_for_update.return_value.order_by.return_value.first.return_value = (
            existing
        )

        result = StudentFeeService._allocate_receipt_no()

        assert result == 43
        assert existing.payment == 43
        existing.save.assert_called_once()


def test_cbse_save_marks_requires_entries():
    with pytest.raises(ExaminationValidationError, match="At least one marks entry"):
        CbseMarksService().save_marks(
            {"exam_id": 1, "timetable_id": 1, "entries": []}
        )


def test_cbse_save_marks_requires_exam():
    with pytest.raises(ExaminationValidationError, match="Exam is required"):
        CbseMarksService().save_marks({"timetable_id": 1, "entries": [{"cbse_exam_student_id": 1}]})
