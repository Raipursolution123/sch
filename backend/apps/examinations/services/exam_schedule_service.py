import logging
from typing import Any

from apps.examinations.domain.examination_exceptions import (
    ExaminationConflictError,
    ExaminationNotFoundError,
    ExaminationValidationError,
)
from apps.examinations.models.exam_group_class_batch_exam_subjects import (
    ExamGroupClassBatchExamSubjects,
)
from apps.examinations.selectors import examination_selectors as selectors

logger = logging.getLogger(__name__)


class ExamScheduleService:
    def list_schedules(self) -> list[dict[str, Any]]:
        return [selectors.schedule_to_dict(row) for row in selectors.list_schedules()]

    def get_schedule(self, schedule_id: int) -> dict[str, Any]:
        schedule = selectors.get_schedule(schedule_id)
        if schedule is None:
            raise ExaminationNotFoundError("Exam schedule not found.")
        return selectors.schedule_to_dict(schedule)

    def create_schedule(self, payload: dict[str, Any]) -> dict[str, Any]:
        exam_id = payload.get("exam_id")
        subject_id = payload.get("subject_id")
        if not exam_id:
            raise ExaminationValidationError("Exam is required.")
        if not subject_id:
            raise ExaminationValidationError("Subject is required.")

        exam = selectors.get_exam(int(exam_id))
        if exam is None:
            raise ExaminationValidationError("Selected exam was not found.")
        if exam.is_active != 1:
            raise ExaminationValidationError("Selected exam is not available.")

        duplicate = ExamGroupClassBatchExamSubjects.objects.filter(
            exam_group_class_batch_exams_id=exam_id,
            subject_id=subject_id,
        ).exists()
        if duplicate:
            raise ExaminationConflictError(
                "A schedule for this exam and subject already exists."
            )

        schedule = ExamGroupClassBatchExamSubjects.objects.create(
            exam_group_class_batch_exams_id=exam_id,
            subject_id=subject_id,
            date_from=payload.get("date_of_exam") or selectors.today_date(),
            time_from=payload.get("start_time") or "09:00",
            duration=payload.get("end_time") or "12:00",
            room_no=payload.get("room_no"),
            max_marks=payload.get("full_marks"),
            min_marks=payload.get("passing_marks"),
            is_active=selectors.parse_is_active(payload.get("is_active"), default=1),
            created_at=selectors.now_datetime(),
            updated_at=selectors.today_date(),
        )
        logger.info(
            "Created exam schedule id=%s exam_id=%s subject_id=%s",
            schedule.id,
            exam_id,
            subject_id,
        )
        return selectors.schedule_to_dict(schedule)

    def update_schedule(
        self, schedule_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        schedule = selectors.get_schedule(schedule_id)
        if schedule is None:
            raise ExaminationNotFoundError("Exam schedule not found.")

        exam_id = payload.get("exam_id", schedule.exam_group_class_batch_exams_id)
        subject_id = payload.get("subject_id", schedule.subject_id)

        if "exam_id" in payload:
            if not exam_id:
                raise ExaminationValidationError("Exam is required.")
            exam = selectors.get_exam(int(exam_id))
            if exam is None:
                raise ExaminationValidationError("Selected exam was not found.")
            schedule.exam_group_class_batch_exams_id = exam_id

        if "subject_id" in payload:
            if not subject_id:
                raise ExaminationValidationError("Subject is required.")
            schedule.subject_id = subject_id

        duplicate = (
            ExamGroupClassBatchExamSubjects.objects.exclude(id=schedule_id)
            .filter(
                exam_group_class_batch_exams_id=exam_id,
                subject_id=subject_id,
            )
            .exists()
        )
        if duplicate:
            raise ExaminationConflictError(
                "A schedule for this exam and subject already exists."
            )

        if "date_of_exam" in payload:
            schedule.date_from = payload["date_of_exam"] or selectors.today_date()
        if "start_time" in payload:
            schedule.time_from = payload["start_time"]
        if "end_time" in payload:
            schedule.duration = payload["end_time"]
        if "room_no" in payload:
            schedule.room_no = payload["room_no"]
        if "full_marks" in payload:
            schedule.max_marks = payload["full_marks"]
        if "passing_marks" in payload:
            schedule.min_marks = payload["passing_marks"]
        if "is_active" in payload:
            schedule.is_active = selectors.parse_is_active(payload["is_active"])

        schedule.updated_at = selectors.today_date()
        schedule.save()
        return selectors.schedule_to_dict(schedule)

    def delete_schedule(self, schedule_id: int) -> None:
        schedule = selectors.get_schedule(schedule_id)
        if schedule is None:
            raise ExaminationNotFoundError("Exam schedule not found.")
        if schedule.is_active == 1:
            raise ExaminationValidationError("Deactivate the schedule before deleting.")
        schedule.delete()
        logger.info("Deleted exam schedule id=%s", schedule_id)
