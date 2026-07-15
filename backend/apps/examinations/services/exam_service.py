import logging
from typing import Any

from apps.examinations.domain.examination_exceptions import (
    ExaminationNotFoundError,
    ExaminationValidationError,
)
from apps.examinations.models.exam_group_class_batch_exams import (
    ExamGroupClassBatchExams,
)
from apps.examinations.selectors import examination_selectors as selectors

logger = logging.getLogger(__name__)


class ExamService:
    def list_exams(self):
        return selectors.list_exams()

    def get_exam(self, exam_id: int) -> dict[str, Any]:
        exam = selectors.get_exam(exam_id)
        if exam is None:
            raise ExaminationNotFoundError("Exam not found.")
        return selectors.exam_to_dict(exam)

    def create_exam(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name") or "").strip()
        if not name:
            raise ExaminationValidationError("Exam name is required.")

        exam_group_id = payload.get("exam_group_id")
        session_id = payload.get("session_id")
        if not exam_group_id:
            raise ExaminationValidationError("Exam group is required.")
        if not session_id:
            raise ExaminationValidationError("Session is required.")

        if selectors.get_exam_group(int(exam_group_id)) is None:
            raise ExaminationValidationError("Selected exam group was not found.")

        exam = ExamGroupClassBatchExams.objects.create(
            exam=name,
            exam_group_id=exam_group_id,
            session_id=session_id,
            date_from=payload.get("date_from"),
            date_to=payload.get("date_to"),
            passing_percentage=payload.get("passing_percentage"),
            is_publish=1 if payload.get("is_published") else 0,
            description=payload.get("description"),
            is_active=selectors.parse_is_active(payload.get("is_active"), default=1),
            created_at=selectors.now_datetime(),
            updated_at=selectors.today_date(),
        )
        logger.info("Created exam id=%s name=%s", exam.id, exam.exam)
        return selectors.exam_to_dict(exam)

    def update_exam(self, exam_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        exam = selectors.get_exam(exam_id)
        if exam is None:
            raise ExaminationNotFoundError("Exam not found.")

        if "name" in payload:
            name = str(payload.get("name") or "").strip()
            if not name:
                raise ExaminationValidationError("Exam name cannot be empty.")
            exam.exam = name
        if "exam_group_id" in payload:
            exam_group_id = payload["exam_group_id"]
            if not exam_group_id:
                raise ExaminationValidationError("Exam group is required.")
            if selectors.get_exam_group(int(exam_group_id)) is None:
                raise ExaminationValidationError("Selected exam group was not found.")
            exam.exam_group_id = exam_group_id
        if "session_id" in payload:
            if not payload["session_id"]:
                raise ExaminationValidationError("Session is required.")
            exam.session_id = payload["session_id"]
        if "date_from" in payload:
            exam.date_from = payload["date_from"]
        if "date_to" in payload:
            exam.date_to = payload["date_to"]
        if "passing_percentage" in payload:
            exam.passing_percentage = payload["passing_percentage"]
        if "is_published" in payload:
            exam.is_publish = 1 if payload["is_published"] else 0
        if "description" in payload:
            exam.description = payload["description"]
        if "is_active" in payload:
            exam.is_active = selectors.parse_is_active(payload["is_active"])

        exam.updated_at = selectors.today_date()
        exam.save()
        return selectors.exam_to_dict(exam)

    def delete_exam(self, exam_id: int) -> None:
        exam = selectors.get_exam(exam_id)
        if exam is None:
            raise ExaminationNotFoundError("Exam not found.")
        exam.delete()
        logger.info("Deleted exam id=%s", exam_id)
