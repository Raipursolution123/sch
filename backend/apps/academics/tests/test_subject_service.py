from unittest.mock import MagicMock, patch

import pytest

from apps.academics.domain.subject_exceptions import (
    SubjectInUseError,
    SubjectNotFoundError,
    SubjectValidationError,
)
from apps.academics.services.subject_service import SubjectService


@pytest.fixture
def service():
    return SubjectService()


def test_create_subject_normalizes_code(service):
    with patch("apps.academics.services.subject_service.Subjects") as model:
        model.objects.filter.return_value.exists.return_value = False
        created = MagicMock(
            id=1,
            name="Math",
            code="MATH",
            type="theory",
            is_active="yes",
            linked_class=None,
            created_at=None,
            updated_at=None,
        )
        model.objects.create.return_value = created
        with patch(
            "apps.academics.services.subject_service.selectors.subject_to_dict",
            return_value={"id": 1, "code": "MATH", "type": "theory"},
        ):
            result = service.create_subject(
                {
                    "name": " Math ",
                    "code": "math",
                    "type": "theory",
                    "linked_class_ids": [],
                }
            )
    assert result["code"] == "MATH"
    assert model.objects.create.call_args.kwargs["code"] == "MATH"
    assert model.objects.create.call_args.kwargs["type"] == "theory"


def test_create_subject_rejects_invalid_type(service):
    with pytest.raises(SubjectValidationError):
        service.create_subject(
            {"name": "Math", "code": "MATH", "type": "lab", "linked_class_ids": []}
        )


def test_create_subject_duplicate_code(service):
    with patch("apps.academics.services.subject_service.Subjects") as model:
        model.objects.filter.return_value.exists.return_value = True
        with pytest.raises(SubjectValidationError):
            service.create_subject(
                {
                    "name": "Math",
                    "code": "MATH",
                    "type": "theory",
                    "linked_class_ids": [],
                }
            )


def test_get_subject_not_found(service):
    with patch(
        "apps.academics.services.subject_service.selectors.get_subject_by_id",
        return_value=None,
    ):
        with pytest.raises(SubjectNotFoundError):
            service.get_subject(99)


def test_deactivate_soft(service):
    subject = MagicMock(id=5, name="Math", is_active="yes")
    with patch(
        "apps.academics.services.subject_service.selectors.get_subject_by_id",
        return_value=subject,
    ):
        with patch(
            "apps.academics.services.subject_service.subject_is_in_use",
            return_value=False,
        ):
            service.deactivate_subject(5)
    assert subject.is_active == "no"
    subject.save.assert_called_once()


def test_deactivate_blocked_when_in_use(service):
    subject = MagicMock(id=5, name="Math", is_active="yes")
    with patch(
        "apps.academics.services.subject_service.selectors.get_subject_by_id",
        return_value=subject,
    ):
        with patch(
            "apps.academics.services.subject_service.subject_is_in_use",
            return_value=True,
        ):
            with pytest.raises(SubjectInUseError):
                service.deactivate_subject(5)
