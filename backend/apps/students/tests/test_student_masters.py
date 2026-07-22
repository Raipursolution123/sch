from unittest.mock import MagicMock, patch

import pytest

from apps.students.domain.student_exceptions import (
    StudentConflictError,
    StudentNotFoundError,
    StudentValidationError,
)
from apps.students.services.student_category_service import StudentCategoryService
from apps.students.services.student_house_service import StudentHouseService
from apps.students.services.student_import_service import StudentImportService


def test_category_requires_name():
    with pytest.raises(StudentValidationError, match="name"):
        StudentCategoryService().create({"name": "  "})


def test_category_conflict_on_duplicate_name():
    with patch("apps.students.services.student_category_service.connection") as conn:
        cursor = MagicMock()
        conn.cursor.return_value.__enter__.return_value = cursor
        cursor.fetchone.return_value = (1,)
        with pytest.raises(StudentConflictError, match="already exists"):
            StudentCategoryService().create({"name": "General"})


def test_house_requires_name():
    with pytest.raises(StudentValidationError, match="House name"):
        StudentHouseService().create({"house_name": ""})


def test_house_get_not_found():
    with patch(
        "apps.students.services.student_house_service.SchoolHouses.objects"
    ) as objects:
        objects.filter.return_value.first.return_value = None
        with pytest.raises(StudentNotFoundError, match="house"):
            StudentHouseService().get(99)


def test_import_requires_rows():
    with pytest.raises(StudentValidationError, match="At least one row"):
        StudentImportService().import_rows([])


def test_import_partial_success():
    service = StudentImportService()
    with patch(
        "apps.students.services.student_import_service.StudentService"
    ) as svc_cls:
        instance = svc_cls.return_value
        instance.admit_student.side_effect = [
            {"id": 1, "admission_no": "A1"},
            StudentValidationError("bad row"),
        ]
        result = service.import_rows(
            [
                {
                    "admission_no": "A1",
                    "firstname": "Ada",
                    "lastname": "L",
                    "class_id": 1,
                    "section_id": 2,
                },
                {
                    "admission_no": "A2",
                    "firstname": "Bad",
                    "lastname": "R",
                    "class_id": 1,
                    "section_id": 2,
                },
            ]
        )
    assert result["created_count"] == 1
    assert result["error_count"] == 1
    assert result["created"][0]["admission_no"] == "A1"
    assert result["errors"][0]["row"] == 2


def test_import_template_has_required_columns():
    data = StudentImportService().template()
    assert "admission_no" in data["columns"]
    assert "class_id" in data["required"]
