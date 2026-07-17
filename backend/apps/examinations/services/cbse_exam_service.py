import logging
from typing import Any

from apps.examinations.domain.examination_exceptions import (
    ExaminationNotFoundError,
    ExaminationValidationError,
)
from apps.examinations.models.cbse_exams import CbseExams
from apps.examinations.selectors import examination_selectors as selectors

logger = logging.getLogger(__name__)


class CbseExamService:
    def list_exams(self):
        return CbseExams.objects.all().order_by("-id")

    def get_exam(self, exam_id: int) -> dict[str, Any]:
        exam = CbseExams.objects.filter(id=exam_id).first()
        if exam is None:
            raise ExaminationNotFoundError("CBSE exam not found.")
        return self._to_dict(exam)

    def create_exam(self, payload: dict[str, Any]) -> dict[str, Any]:
        cleaned = self._validate_create(payload)
        exam = CbseExams.objects.create(
            name=cleaned["name"],
            exam_code=cleaned.get("exam_code"),
            session_id=cleaned["session_id"],
            description=cleaned.get("description") or "",
            total_working_days=cleaned.get("total_working_days", 0),
            cbse_term_id=cleaned.get("cbse_term_id"),
            cbse_term_group_id=cleaned.get("cbse_term_group_id"),
            cbse_exam_assessment_id=cleaned.get("cbse_exam_assessment_id"),
            cbse_exam_grade_id=cleaned.get("cbse_exam_grade_id"),
            combined_ew=cleaned.get("combined_ew"),
            is_publish=cleaned.get("is_publish", 0),
            is_active=cleaned.get("is_active", 1),
            created_by=cleaned.get("created_by"),
            use_exam_roll_no=cleaned.get("use_exam_roll_no", 0),
            promote_class=cleaned.get("promote_class"),
            created_at=selectors.now_datetime(),
        )
        logger.info("Created CBSE exam id=%s name=%s", exam.id, exam.name)
        return self._to_dict(exam)

    def enrich_list(self, rows) -> list[dict[str, Any]]:
        return [self._to_dict(row) for row in rows]

    def _to_dict(self, exam: CbseExams) -> dict[str, Any]:
        return {
            "id": exam.id,
            "name": exam.name,
            "exam_code": exam.exam_code,
            "session_id": exam.session_id,
            "description": exam.description,
            "total_working_days": exam.total_working_days,
            "cbse_term_id": exam.cbse_term_id,
            "cbse_term_group_id": exam.cbse_term_group_id,
            "cbse_exam_assessment_id": exam.cbse_exam_assessment_id,
            "cbse_exam_grade_id": exam.cbse_exam_grade_id,
            "combined_ew": exam.combined_ew,
            "is_publish": exam.is_publish,
            "is_active": exam.is_active,
            "created_by": exam.created_by,
            "use_exam_roll_no": exam.use_exam_roll_no,
            "promote_class": exam.promote_class,
            "created_at": exam.created_at.isoformat() if exam.created_at else None,
        }

    def _validate_create(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = (payload.get("name") or "").strip()
        if not name:
            raise ExaminationValidationError("Name is required.")
        session_id = payload.get("session_id")
        if session_id is None:
            raise ExaminationValidationError("session_id is required.")
        try:
            session_id = int(session_id)
        except (TypeError, ValueError) as exc:
            raise ExaminationValidationError("session_id must be an integer.") from exc

        cleaned: dict[str, Any] = {
            "name": name,
            "session_id": session_id,
            "exam_code": (payload.get("exam_code") or None),
            "description": payload.get("description"),
            "total_working_days": payload.get("total_working_days", 0),
            "cbse_term_id": payload.get("cbse_term_id"),
            "cbse_term_group_id": payload.get("cbse_term_group_id"),
            "cbse_exam_assessment_id": payload.get("cbse_exam_assessment_id"),
            "cbse_exam_grade_id": payload.get("cbse_exam_grade_id"),
            "combined_ew": payload.get("combined_ew"),
            "is_publish": int(payload.get("is_publish", 0) or 0),
            "is_active": int(payload.get("is_active", 1) if payload.get("is_active") is not None else 1),
            "created_by": payload.get("created_by"),
            "use_exam_roll_no": int(payload.get("use_exam_roll_no", 0) or 0),
            "promote_class": payload.get("promote_class"),
        }
        if isinstance(cleaned["exam_code"], str):
            cleaned["exam_code"] = cleaned["exam_code"].strip() or None
        return cleaned
