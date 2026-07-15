import logging
from typing import Any

from apps.examinations.domain.examination_exceptions import (
    ExaminationNotFoundError,
    ExaminationValidationError,
)
from apps.examinations.models.mark_divisions import MarkDivisions
from apps.examinations.selectors import examination_selectors as selectors

logger = logging.getLogger(__name__)


class MarkDivisionService:
    def list_divisions(self):
        return MarkDivisions.objects.all().order_by("percentage_from", "name")

    def get_division(self, division_id: int) -> dict[str, Any]:
        division = MarkDivisions.objects.filter(id=division_id).first()
        if division is None:
            raise ExaminationNotFoundError("Mark division not found.")
        return self._to_dict(division)

    def create_division(self, payload: dict[str, Any]) -> dict[str, Any]:
        cleaned = self._validate_payload(payload)
        division = MarkDivisions.objects.create(
            name=cleaned["name"],
            percentage_from=cleaned["percentage_from"],
            percentage_to=cleaned["percentage_to"],
            is_active=cleaned["is_active"],
            created_at=selectors.now_datetime(),
        )
        logger.info("Created mark division id=%s name=%s", division.id, division.name)
        return self._to_dict(division)

    def update_division(
        self, division_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        division = MarkDivisions.objects.filter(id=division_id).first()
        if division is None:
            raise ExaminationNotFoundError("Mark division not found.")

        current = {
            "name": division.name,
            "percentage_from": division.percentage_from,
            "percentage_to": division.percentage_to,
            "is_active": selectors.active_flag(division.is_active),
        }
        merged = {**current, **payload}
        cleaned = self._validate_payload(merged)

        division.name = cleaned["name"]
        division.percentage_from = cleaned["percentage_from"]
        division.percentage_to = cleaned["percentage_to"]
        division.is_active = cleaned["is_active"]
        division.save()
        return self._to_dict(division)

    def delete_division(self, division_id: int) -> None:
        division = MarkDivisions.objects.filter(id=division_id).first()
        if division is None:
            raise ExaminationNotFoundError("Mark division not found.")
        if division.is_active == 1:
            raise ExaminationValidationError(
                "Deactivate the mark division before deleting."
            )
        division.delete()
        logger.info("Deleted mark division id=%s", division_id)

    def enrich_list(self, rows) -> list[dict[str, Any]]:
        return [self._to_dict(row) for row in rows]

    def _to_dict(self, division: MarkDivisions) -> dict[str, Any]:
        return {
            "id": division.id,
            "name": division.name,
            "percentage_from": division.percentage_from,
            "percentage_to": division.percentage_to,
            "is_active": selectors.active_flag(division.is_active),
            "created_at": selectors.safe_date_str(
                division.created_at, "%Y-%m-%d %H:%M:%S"
            ),
        }

    def _validate_payload(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name") or "").strip()
        if not name:
            raise ExaminationValidationError("Division name is required.")

        percentage_from = self._require_float(
            payload.get("percentage_from"), "Percentage from"
        )
        percentage_to = self._require_float(
            payload.get("percentage_to"), "Percentage to"
        )
        if percentage_from > percentage_to:
            raise ExaminationValidationError(
                "Percentage from cannot be greater than percentage to."
            )
        if percentage_from < 0 or percentage_to > 100:
            raise ExaminationValidationError(
                "Percentage range must be between 0 and 100."
            )

        return {
            "name": name,
            "percentage_from": percentage_from,
            "percentage_to": percentage_to,
            "is_active": selectors.parse_is_active(payload.get("is_active"), default=1),
        }

    def _require_float(self, value: Any, label: str) -> float:
        if value in (None, ""):
            raise ExaminationValidationError(f"{label} is required.")
        try:
            return float(value)
        except (TypeError, ValueError) as exc:
            raise ExaminationValidationError(f"{label} must be a number.") from exc
