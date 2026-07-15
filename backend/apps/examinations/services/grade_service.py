import logging
from typing import Any

from apps.examinations.domain.examination_exceptions import (
    ExaminationNotFoundError,
    ExaminationValidationError,
)
from apps.examinations.models.grades import Grades
from apps.examinations.selectors import examination_selectors as selectors

logger = logging.getLogger(__name__)


class GradeService:
    def list_grades(self):
        return Grades.objects.all().order_by("mark_from", "name")

    def get_grade(self, grade_id: int) -> dict[str, Any]:
        grade = Grades.objects.filter(id=grade_id).first()
        if grade is None:
            raise ExaminationNotFoundError("Grade not found.")
        return self._to_dict(grade)

    def create_grade(self, payload: dict[str, Any]) -> dict[str, Any]:
        cleaned = self._validate_payload(payload)
        grade = Grades.objects.create(
            exam_type=cleaned["exam_type"],
            name=cleaned["name"],
            point=cleaned["point"],
            mark_from=cleaned["mark_from"],
            mark_upto=cleaned["mark_upto"],
            description=cleaned.get("description"),
            is_active=cleaned["is_active"],
            created_at=selectors.now_datetime(),
            updated_at=selectors.today_date(),
        )
        logger.info("Created grade id=%s name=%s", grade.id, grade.name)
        return self._to_dict(grade)

    def update_grade(self, grade_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        grade = Grades.objects.filter(id=grade_id).first()
        if grade is None:
            raise ExaminationNotFoundError("Grade not found.")

        current = {
            "exam_type": grade.exam_type,
            "name": grade.name,
            "point": grade.point,
            "mark_from": grade.mark_from,
            "mark_upto": grade.mark_upto,
            "description": grade.description,
            "is_active": grade.is_active,
        }
        merged = {**current, **payload}
        cleaned = self._validate_payload(merged)

        grade.exam_type = cleaned["exam_type"]
        grade.name = cleaned["name"]
        grade.point = cleaned["point"]
        grade.mark_from = cleaned["mark_from"]
        grade.mark_upto = cleaned["mark_upto"]
        grade.description = cleaned.get("description")
        grade.is_active = cleaned["is_active"]
        grade.updated_at = selectors.today_date()
        grade.save()
        return self._to_dict(grade)

    def delete_grade(self, grade_id: int) -> None:
        grade = Grades.objects.filter(id=grade_id).first()
        if grade is None:
            raise ExaminationNotFoundError("Grade not found.")
        if grade.is_active == "yes":
            raise ExaminationValidationError("Deactivate the grade before deleting.")
        grade.delete()
        logger.info("Deleted grade id=%s", grade_id)

    def enrich_list(self, rows) -> list[dict[str, Any]]:
        return [self._to_dict(row) for row in rows]

    def _to_dict(self, grade: Grades) -> dict[str, Any]:
        return {
            "id": grade.id,
            "exam_type": grade.exam_type,
            "name": grade.name,
            "point": grade.point,
            "mark_from": grade.mark_from,
            "mark_upto": grade.mark_upto,
            "description": grade.description,
            "is_active": grade.is_active or "no",
            "created_at": selectors.safe_date_str(
                grade.created_at, "%Y-%m-%d %H:%M:%S"
            ),
            "updated_at": selectors.safe_date_str(grade.updated_at),
        }

    def _validate_payload(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name") or "").strip()
        exam_type = str(payload.get("exam_type") or "").strip()
        if not name:
            raise ExaminationValidationError("Grade name is required.")
        if not exam_type:
            raise ExaminationValidationError("Exam type is required.")

        point = self._require_float(payload.get("point"), "Point")
        mark_from = self._require_float(payload.get("mark_from"), "Mark from")
        mark_upto = self._require_float(payload.get("mark_upto"), "Mark upto")
        if mark_from > mark_upto:
            raise ExaminationValidationError(
                "Mark from cannot be greater than mark upto."
            )

        is_active = payload.get("is_active", "no")
        if isinstance(is_active, bool):
            is_active = "yes" if is_active else "no"
        is_active = str(is_active).strip().lower()
        if is_active not in {"yes", "no"}:
            raise ExaminationValidationError("is_active must be 'yes' or 'no'.")

        description = payload.get("description")
        return {
            "name": name,
            "exam_type": exam_type,
            "point": point,
            "mark_from": mark_from,
            "mark_upto": mark_upto,
            "description": (
                str(description).strip() if description not in (None, "") else None
            ),
            "is_active": is_active,
        }

    def _require_float(self, value: Any, label: str) -> float:
        if value in (None, ""):
            raise ExaminationValidationError(f"{label} is required.")
        try:
            return float(value)
        except (TypeError, ValueError) as exc:
            raise ExaminationValidationError(f"{label} must be a number.") from exc
