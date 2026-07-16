from unittest.mock import MagicMock, patch

import pytest

from apps.academics.domain.subject_group_exceptions import (
    SubjectGroupInUseError,
    SubjectGroupNotFoundError,
    SubjectGroupValidationError,
)
from apps.academics.services.subject_group_service import SubjectGroupService


@pytest.fixture
def service():
    return SubjectGroupService()


def test_create_group_requires_session(service):
    with pytest.raises(SubjectGroupValidationError):
        service.create_group({"name": "Science Group"})


@pytest.mark.django_db
def test_create_group_success(service):
    with patch("apps.academics.services.subject_group_service.SubjectGroups") as model:
        with patch(
            "apps.academics.services.subject_group_service.Sessions"
        ) as sessions_model:
            sessions_model.objects.filter.return_value.exists.return_value = True
            model.objects.filter.return_value.exists.return_value = False
            created = MagicMock(
                id=1,
                name="Science",
                session_id=5,
                description=None,
                created_at=None,
            )
            model.objects.create.return_value = created
            with patch(
                "apps.academics.services.subject_group_service.selectors.group_detail_dict",
                return_value={"id": 1, "name": "Science", "session_id": 5},
            ):
                result = service.create_group(
                    {"name": "Science", "session_id": 5, "description": ""}
                )
    assert result["name"] == "Science"


def test_get_group_not_found(service):
    with patch(
        "apps.academics.services.subject_group_service.selectors.get_group_by_id",
        return_value=None,
    ):
        with pytest.raises(SubjectGroupNotFoundError):
            service.get_group(99)


def test_delete_group_blocked_when_in_use(service):
    group = MagicMock(id=3, session_id=5)
    with patch(
        "apps.academics.services.subject_group_service.selectors.get_group_by_id",
        return_value=group,
    ):
        with patch(
            "apps.academics.services.subject_group_service.subject_group_is_in_use",
            return_value=True,
        ):
            with pytest.raises(SubjectGroupInUseError):
                service.delete_group(3)


def test_sync_subjects_adds_new_rows(service):
    group = MagicMock(id=2, session_id=5)
    with patch(
        "apps.academics.services.subject_group_service.selectors.get_group_by_id",
        return_value=group,
    ):
        with patch(
            "apps.academics.services.subject_group_service.Subjects"
        ) as subjects_model:
            subjects_model.objects.filter.return_value.count.return_value = 2
            with patch(
                "apps.academics.services.subject_group_service.SubjectGroupSubjects"
            ) as link_model:
                link_model.objects.filter.return_value = []
                with patch(
                    "apps.academics.services.subject_group_service.selectors.group_detail_dict",
                    return_value={"id": 2, "subject_ids": [2, 3]},
                ):
                    result = service.sync_subjects(2, [2, 3])
    assert link_model.objects.create.call_count == 2
    assert result["subject_ids"] == [2, 3]
