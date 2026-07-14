from unittest.mock import MagicMock, patch

import pytest

from apps.examinations.domain.examination_exceptions import (
    ExaminationConflictError,
    ExaminationNotFoundError,
    ExaminationValidationError,
)
from apps.examinations.services.exam_group_service import ExamGroupService
from apps.examinations.services.exam_schedule_service import ExamScheduleService
from apps.examinations.services.exam_service import ExamService


@pytest.fixture
def group_service():
    return ExamGroupService()


@pytest.fixture
def exam_service():
    return ExamService()


@pytest.fixture
def schedule_service():
    return ExamScheduleService()


def test_create_group_requires_name(group_service):
    with pytest.raises(ExaminationValidationError, match="name is required"):
        group_service.create_group({})


def test_get_group_not_found(group_service):
    with patch(
        "apps.examinations.services.exam_group_service.selectors.get_exam_group",
        return_value=None,
    ):
        with pytest.raises(ExaminationNotFoundError):
            group_service.get_group(999)


def test_create_exam_requires_name(exam_service):
    with pytest.raises(ExaminationValidationError, match="Exam name is required"):
        exam_service.create_exam({"exam_group_id": 1, "session_id": 1})


def test_create_exam_requires_group(exam_service):
    with pytest.raises(ExaminationValidationError, match="Exam group is required"):
        exam_service.create_exam({"name": "Unit Test 1", "session_id": 1})


def test_create_schedule_requires_exam(schedule_service):
    with pytest.raises(ExaminationValidationError, match="Exam is required"):
        schedule_service.create_schedule({"subject_id": 1})


def test_create_schedule_rejects_duplicate(schedule_service):
    exam = MagicMock(id=1, is_active=1)
    with patch(
        "apps.examinations.services.exam_schedule_service.selectors.get_exam",
        return_value=exam,
    ):
        with patch(
            "apps.examinations.services.exam_schedule_service."
            "ExamGroupClassBatchExamSubjects.objects.filter"
        ) as filter_mock:
            filter_mock.return_value.exists.return_value = True
            with pytest.raises(ExaminationConflictError, match="already exists"):
                schedule_service.create_schedule({"exam_id": 1, "subject_id": 2})


def test_delete_schedule_requires_inactive(schedule_service):
    schedule = MagicMock(is_active=1)
    with patch(
        "apps.examinations.services.exam_schedule_service.selectors.get_schedule",
        return_value=schedule,
    ):
        with pytest.raises(ExaminationValidationError, match="Deactivate"):
            schedule_service.delete_schedule(1)
