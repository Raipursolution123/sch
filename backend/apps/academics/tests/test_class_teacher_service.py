from unittest.mock import MagicMock, patch

import pytest

from apps.academics.domain.class_teacher_exceptions import (
    ClassTeacherNotFoundError,
    ClassTeacherValidationError,
)
from apps.academics.services.class_teacher_service import ClassTeacherService


@pytest.fixture
def service():
    return ClassTeacherService()


def test_assign_requires_session(service):
    with pytest.raises(ClassTeacherValidationError):
        service.assign_teacher({"class_id": 1, "section_id": 2, "staff_id": 3})


def test_get_assignment_not_found(service):
    with patch(
        "apps.academics.services.class_teacher_service.selectors.get_assignment_by_id",
        return_value=None,
    ):
        with pytest.raises(ClassTeacherNotFoundError):
            service.get_assignment(99)


def test_assign_upserts_existing(service):
    with patch(
        "apps.academics.services.class_teacher_service.Sessions"
    ) as sessions_model:
        with patch(
            "apps.academics.services.class_teacher_service.Classes"
        ) as classes_model:
            with patch(
                "apps.academics.services.class_teacher_service.Sections"
            ) as sections_model:
                with patch(
                    "apps.academics.services.class_teacher_service.ClassSections"
                ) as cs_model:
                    with patch(
                        "apps.academics.services.class_teacher_service.Staff"
                    ) as staff_model:
                        with patch(
                            "apps.academics.services.class_teacher_service."
                            "selectors.get_assignment_by_scope"
                        ) as scope_mock:
                            session_exists = (
                                sessions_model.objects.filter.return_value.exists
                            )
                            session_exists.return_value = True
                            class_obj = MagicMock(is_active="yes")
                            class_first = (
                                classes_model.objects.filter.return_value.first
                            )
                            class_first.return_value = class_obj
                            section_obj = MagicMock(is_active="yes")
                            section_first = (
                                sections_model.objects.filter.return_value.first
                            )
                            section_first.return_value = section_obj
                            cs_exists = cs_model.objects.filter.return_value.exists
                            cs_exists.return_value = True
                            staff = MagicMock(is_active=1)
                            staff_first = staff_model.objects.filter.return_value.first
                            staff_first.return_value = staff
                            existing = MagicMock(
                                id=5,
                                session_id=1,
                                class_id=2,
                                section_id=3,
                                staff_id=4,
                            )
                            scope_mock.return_value = existing
                            with patch(
                                "apps.academics.services.class_teacher_service."
                                "selectors.assignment_to_dict",
                                return_value={"id": 5, "staff_id": 9},
                            ):
                                result = service.assign_teacher(
                                    {
                                        "session_id": 1,
                                        "class_id": 2,
                                        "section_id": 3,
                                        "staff_id": 9,
                                    }
                                )
    assert result["staff_id"] == 9
    assert existing.staff_id == 9
    existing.save.assert_called_once()


def test_update_rejects_scope_change(service):
    assignment = MagicMock(id=1, session_id=1, class_id=2, section_id=3, staff_id=4)
    with patch(
        "apps.academics.services.class_teacher_service.selectors.get_assignment_by_id",
        return_value=assignment,
    ):
        with pytest.raises(ClassTeacherValidationError):
            service.update_assignment(1, {"session_id": 2, "staff_id": 4})
