from unittest.mock import MagicMock, patch

import pytest

from apps.students.domain.student_exceptions import (
    StudentNotFoundError,
    StudentValidationError,
)
from apps.students.domain.student_fee_exceptions import (
    StudentEnrollmentError,
    StudentFeeValidationError,
)
from apps.students.services.student_fee_service import StudentFeeService


@pytest.fixture
def service():
    return StudentFeeService()


def test_get_fee_summary_student_not_found(service):
    with patch(
        "apps.students.services.student_fee_service.selectors.get_student_by_id",
        return_value=None,
    ):
        with pytest.raises(StudentNotFoundError):
            service.get_fee_summary(999)


def test_get_fee_summary_requires_active_session(service):
    student = MagicMock(id=1)
    with patch(
        "apps.students.services.student_fee_service.selectors.get_student_by_id",
        return_value=student,
    ):
        with patch(
            "apps.students.services.student_fee_service.selectors.get_active_session",
            return_value=None,
        ):
            with pytest.raises(StudentValidationError, match="active academic session"):
                service.get_fee_summary(1)


def test_get_fee_summary_requires_enrollment(service):
    student = MagicMock(id=1)
    session = MagicMock(id=10, session="2025-26")
    with patch(
        "apps.students.services.student_fee_service.selectors.get_student_by_id",
        return_value=student,
    ):
        with patch(
            "apps.students.services.student_fee_service.selectors.get_active_session",
            return_value=session,
        ):
            with patch(
                "apps.students.services.student_fee_service.fee_selectors."
                "get_active_student_session",
                return_value=None,
            ):
                with pytest.raises(StudentEnrollmentError):
                    service.get_fee_summary(1)


def test_record_payment_requires_amount_and_feetype(service):
    with pytest.raises(StudentFeeValidationError, match="Amount and fee type"):
        service.record_payment(1, {}, collected_by="Admin(1)")


def test_record_payment_student_not_found(service):
    with patch(
        "apps.students.services.student_fee_service.selectors.get_student_by_id",
        return_value=None,
    ):
        with pytest.raises(StudentNotFoundError):
            service.record_payment(
                999,
                {"amount": 100, "feetype_id": 1},
                collected_by="Admin(1)",
            )


def test_record_payment_rejects_amount_above_balance(service):
    student = MagicMock(id=1)
    session = MagicMock(id=10, session="2025-26")
    student_session = MagicMock(id=20, class_id=3, section_id=1, session_id=10)

    with patch(
        "apps.students.services.student_fee_service.selectors.get_student_by_id",
        return_value=student,
    ):
        with patch(
            "apps.students.services.student_fee_service.selectors.get_active_session",
            return_value=session,
        ):
            with patch(
                "apps.students.services.student_fee_service.fee_selectors."
                "get_active_student_session",
                return_value=student_session,
            ):
                with patch(
                    "apps.students.services.student_fee_service.fee_selectors."
                    "resolve_fee_master_for_payment",
                    return_value=(5, 2, None),
                ):
                    with patch(
                        "apps.students.services.student_fee_service.fee_selectors."
                        "fetch_assigned_fee_lines",
                        return_value=[],
                    ):
                        with patch(
                            "apps.students.services.student_fee_service.fee_selectors."
                            "fetch_deposite_payments",
                            return_value=[],
                        ):
                            with patch(
                                "apps.students.services.student_fee_service.fee_selectors."
                                "build_fee_lines",
                                return_value=[
                                    {
                                        "feetype_id": 1,
                                        "balance": 500.0,
                                    }
                                ],
                            ):
                                with pytest.raises(
                                    StudentFeeValidationError,
                                    match="cannot exceed outstanding balance",
                                ):
                                    service.record_payment(
                                        1,
                                        {"amount": 600, "feetype_id": 1},
                                        collected_by="Admin(1)",
                                    )


def test_revert_fee_student_not_found(service):
    with patch(
        "apps.students.services.student_fee_service.selectors.get_student_by_id",
        return_value=None,
    ):
        with pytest.raises(StudentNotFoundError):
            service.revert_fee(999, 1)
