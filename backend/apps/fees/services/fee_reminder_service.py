import logging
from typing import Any

from django.utils import timezone

from apps.fees.domain.fee_exceptions import FeeNotFoundError, FeeValidationError
from apps.fees.models.fees_reminder import FeesReminder

logger = logging.getLogger(__name__)


class FeeReminderService:
    def list_reminders(self) -> list[dict[str, Any]]:
        rows = FeesReminder.objects.all().order_by("id")
        return [self._to_dict(row) for row in rows]

    def get_reminder(self, reminder_id: int) -> dict[str, Any]:
        reminder = FeesReminder.objects.filter(id=reminder_id).first()
        if reminder is None:
            raise FeeNotFoundError("Fee reminder not found.")
        return self._to_dict(reminder)

    def update_reminder(
        self, reminder_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        reminder = FeesReminder.objects.filter(id=reminder_id).first()
        if reminder is None:
            raise FeeNotFoundError("Fee reminder not found.")

        if "day" in payload:
            day = payload.get("day")
            if day in (None, ""):
                raise FeeValidationError("Day is required.")
            try:
                day_value = int(day)
            except (TypeError, ValueError) as exc:
                raise FeeValidationError("Day must be an integer.") from exc
            if day_value < 0:
                raise FeeValidationError("Day cannot be negative.")
            reminder.day = day_value

        if "is_active" in payload:
            reminder.is_active = self._parse_is_active(payload.get("is_active"))

        reminder.updated_at = timezone.now().date()
        reminder.save()
        logger.info("Updated fee reminder id=%s", reminder.id)
        return self._to_dict(reminder)

    def _parse_is_active(self, value: Any) -> int:
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"yes", "1", "true"}:
                return 1
            if normalized in {"no", "0", "false"}:
                return 0
            raise FeeValidationError("is_active must be yes/no or 1/0.")
        if isinstance(value, bool):
            return 1 if value else 0
        try:
            return 1 if int(value) else 0
        except (TypeError, ValueError) as exc:
            raise FeeValidationError("is_active must be yes/no or 1/0.") from exc

    def _to_dict(self, reminder: FeesReminder) -> dict[str, Any]:
        return {
            "id": reminder.id,
            "reminder_type": reminder.reminder_type,
            "day": reminder.day,
            "is_active": "yes" if reminder.is_active == 1 else "no",
            "created_at": reminder.created_at,
            "updated_at": reminder.updated_at,
        }
