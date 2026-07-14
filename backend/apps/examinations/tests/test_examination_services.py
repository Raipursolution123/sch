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


def test_create_grade_requires_name():
    from apps.examinations.services.grade_service import GradeService

    with pytest.raises(ExaminationValidationError, match="Grade name is required"):
        GradeService().create_grade(
            {
                "exam_type": "General Pass",
                "point": 5,
                "mark_from": 90,
                "mark_upto": 100,
            }
        )


def test_create_grade_rejects_inverted_range():
    from apps.examinations.services.grade_service import GradeService

    with pytest.raises(ExaminationValidationError, match="Mark from cannot"):
        GradeService().create_grade(
            {
                "name": "A+",
                "exam_type": "General Pass",
                "point": 5,
                "mark_from": 100,
                "mark_upto": 90,
            }
        )


def test_delete_grade_requires_inactive():
    from apps.examinations.services.grade_service import GradeService

    grade = MagicMock(is_active="yes")
    with patch(
        "apps.examinations.services.grade_service.Grades.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = grade
        with pytest.raises(ExaminationValidationError, match="Deactivate"):
            GradeService().delete_grade(1)


def test_results_roster_requires_matching_schedule():
    from apps.examinations.services.exam_result_service import ExamResultService

    exam = MagicMock(id=1, exam="Midterm", exam_group_id=2, session_id=3)
    schedule = MagicMock(id=9, exam_group_class_batch_exams_id=99)
    with patch(
        "apps.examinations.services.exam_result_service.selectors.get_exam",
        return_value=exam,
    ):
        with patch(
            "apps.examinations.services.exam_result_service.selectors.get_schedule",
            return_value=schedule,
        ):
            with pytest.raises(ExaminationValidationError, match="does not belong"):
                ExamResultService().get_roster(1, 9)


def test_save_results_requires_entries():
    from apps.examinations.services.exam_result_service import ExamResultService

    with pytest.raises(ExaminationValidationError, match="At least one"):
        ExamResultService().save_results(
            {"exam_id": 1, "schedule_id": 2, "entries": []}
        )


def test_save_results_rejects_marks_over_full():
    from apps.examinations.services.exam_result_service import ExamResultService

    exam = MagicMock(id=1)
    schedule = MagicMock(id=2, exam_group_class_batch_exams_id=1, max_marks=100)
    enrollment = MagicMock(id=50)
    with patch(
        "apps.examinations.services.exam_result_service.selectors.get_exam",
        return_value=exam,
    ):
        with patch(
            "apps.examinations.services.exam_result_service.selectors.get_schedule",
            return_value=schedule,
        ):
            with patch(
                "apps.examinations.services.exam_result_service."
                "ExamGroupClassBatchExamStudents.objects.filter"
            ) as filter_mock:
                filter_mock.return_value = [enrollment]
                with pytest.raises(ExaminationValidationError, match="cannot exceed"):
                    ExamResultService().save_results(
                        {
                            "exam_id": 1,
                            "schedule_id": 2,
                            "entries": [
                                {
                                    "exam_group_class_batch_exam_student_id": 50,
                                    "get_marks": 120,
                                    "attendence": "present",
                                }
                            ],
                        }
                    )


def test_enroll_requires_students():
    from apps.examinations.services.exam_enrollment_service import ExamEnrollmentService

    with pytest.raises(ExaminationValidationError, match="at least one student"):
        ExamEnrollmentService().enroll(exam_id=1, student_session_ids=[])


def test_enroll_requires_active_exam():
    from apps.examinations.services.exam_enrollment_service import ExamEnrollmentService

    exam = MagicMock(id=1, is_active=0, session_id=10)
    with patch(
        "apps.examinations.services.exam_enrollment_service.selectors.get_exam",
        return_value=exam,
    ):
        with pytest.raises(ExaminationValidationError, match="not active"):
            ExamEnrollmentService().enroll(exam_id=1, student_session_ids=[101])


def test_unenroll_not_found():
    from apps.examinations.services.exam_enrollment_service import ExamEnrollmentService

    with patch(
        "apps.examinations.services.exam_enrollment_service."
        "ExamGroupClassBatchExamStudents.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = None
        with pytest.raises(ExaminationNotFoundError):
            ExamEnrollmentService().unenroll(999)


def test_create_division_requires_name():
    from apps.examinations.services.mark_division_service import MarkDivisionService

    with pytest.raises(ExaminationValidationError, match="Division name is required"):
        MarkDivisionService().create_division(
            {"percentage_from": 60, "percentage_to": 100}
        )


def test_create_division_rejects_inverted_range():
    from apps.examinations.services.mark_division_service import MarkDivisionService

    with pytest.raises(ExaminationValidationError, match="Percentage from cannot"):
        MarkDivisionService().create_division(
            {"name": "First", "percentage_from": 80, "percentage_to": 60}
        )


def test_delete_division_requires_inactive():
    from apps.examinations.services.mark_division_service import MarkDivisionService

    division = MagicMock(is_active=1)
    with patch(
        "apps.examinations.services.mark_division_service.MarkDivisions.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = division
        with pytest.raises(ExaminationValidationError, match="Deactivate"):
            MarkDivisionService().delete_division(1)
