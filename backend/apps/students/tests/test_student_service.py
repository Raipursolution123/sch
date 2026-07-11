from unittest.mock import MagicMock, patch

import pytest

from apps.students.domain.student_exceptions import (
    StudentConflictError,
    StudentNotFoundError,
    StudentValidationError,
)
from apps.students.services.student_service import StudentService


@pytest.fixture
def service():
    return StudentService()


def test_admit_requires_admission_number(service):
    with pytest.raises(StudentValidationError, match="Admission number"):
        service.admit_student({"firstname": "A", "lastname": "B"})


def test_admit_rejects_duplicate_admission_no(service):
    with patch(
        "apps.students.services.student_service.Students.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.exists.return_value = True
        with pytest.raises(StudentConflictError, match="admission number"):
            service.admit_student({"admission_no": "ADM-001"})


def test_admit_requires_active_session(service):
    with patch(
        "apps.students.services.student_service.Students.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.exists.return_value = False
        with patch(
            "apps.students.services.student_service.selectors.get_active_session",
            return_value=None,
        ):
            with pytest.raises(StudentValidationError, match="active academic session"):
                service.admit_student({"admission_no": "ADM-001"})


def test_admit_requires_class_section_mapping(service):
    session = MagicMock(id=1)
    school_class = MagicMock(id=10, class_field="Class 5")
    section = MagicMock(id=20, section="A")

    with patch(
        "apps.students.services.student_service.Students.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.exists.return_value = False
        with patch(
            "apps.students.services.student_service.selectors.get_active_session",
            return_value=session,
        ):
            with patch.object(
                service, "_resolve_class_section", return_value=(school_class, section)
            ):
                with patch(
                    "apps.students.services.student_service.selectors."
                    "class_section_mapping_active",
                    return_value=False,
                ):
                    with pytest.raises(StudentValidationError, match="not assigned"):
                        service.admit_student(
                            {
                                "admission_no": "ADM-001",
                                "class_id": 10,
                                "section_id": 20,
                            }
                        )


def test_get_student_not_found(service):
    with patch(
        "apps.students.services.student_service.selectors.get_student_by_id",
        return_value=None,
    ):
        with pytest.raises(StudentNotFoundError):
            service.get_student(999)


def test_delete_student_not_found(service):
    with patch(
        "apps.students.services.student_service.selectors.get_student_by_id",
        return_value=None,
    ):
        with pytest.raises(StudentNotFoundError):
            service.delete_student(999)
