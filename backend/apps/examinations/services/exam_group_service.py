import logging
from typing import Any

from apps.examinations.domain.examination_exceptions import (
    ExaminationNotFoundError,
    ExaminationValidationError,
)
from apps.examinations.models.exam_groups import ExamGroups
from apps.examinations.selectors import examination_selectors as selectors

logger = logging.getLogger(__name__)


class ExamGroupService:
    def list_groups(self):
        return selectors.list_exam_groups()

    def get_group(self, group_id: int) -> dict[str, Any]:
        group = selectors.get_exam_group(group_id)
        if group is None:
            raise ExaminationNotFoundError("Exam group not found.")
        return selectors.exam_group_to_dict(group)

    def create_group(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name") or "").strip()
        if not name:
            raise ExaminationValidationError("Exam group name is required.")

        group = ExamGroups.objects.create(
            name=name,
            exam_type=payload.get("exam_type"),
            description=payload.get("description"),
            is_active=selectors.parse_is_active(payload.get("is_active"), default=1),
            created_at=selectors.now_datetime(),
            updated_at=selectors.today_date(),
        )
        logger.info("Created exam group id=%s name=%s", group.id, group.name)
        return selectors.exam_group_to_dict(group)

    def update_group(self, group_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        group = selectors.get_exam_group(group_id)
        if group is None:
            raise ExaminationNotFoundError("Exam group not found.")

        if "name" in payload:
            name = str(payload.get("name") or "").strip()
            if not name:
                raise ExaminationValidationError("Exam group name cannot be empty.")
            group.name = name
        if "exam_type" in payload:
            group.exam_type = payload["exam_type"]
        if "description" in payload:
            group.description = payload["description"]
        if "is_active" in payload:
            group.is_active = selectors.parse_is_active(payload["is_active"])

        group.updated_at = selectors.today_date()
        group.save()
        return selectors.exam_group_to_dict(group)

    def delete_group(self, group_id: int) -> None:
        group = selectors.get_exam_group(group_id)
        if group is None:
            raise ExaminationNotFoundError("Exam group not found.")
        group.delete()
        logger.info("Deleted exam group id=%s", group_id)
