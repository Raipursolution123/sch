from __future__ import annotations

import logging
from typing import Any

from django.db.models import Q

from apps.communications.models.notification_setting import NotificationSetting
from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.selectors.settings_selectors import now_datetime
from apps.settings.services.secret_utils import as_flag_str, as_int_flag

logger = logging.getLogger(__name__)


def _to_dict(row: NotificationSetting) -> dict[str, Any]:
    return {
        "id": row.id,
        "type": row.type or "",
        "is_mail": row.is_mail or "0",
        "is_sms": row.is_sms or "0",
        "is_notification": int(row.is_notification or 0),
        "display_notification": int(row.display_notification or 0),
        "display_sms": int(row.display_sms or 0),
        "is_student_recipient": row.is_student_recipient,
        "is_guardian_recipient": row.is_guardian_recipient,
        "is_staff_recipient": row.is_staff_recipient,
        "display_student_recipient": row.display_student_recipient,
        "display_guardian_recipient": row.display_guardian_recipient,
        "display_staff_recipient": row.display_staff_recipient,
        "subject": row.subject or "",
        "template_id": row.template_id or "",
        "template": row.template or "",
        "variables": row.variables or "",
        "created_at": (
            row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else None
        ),
    }


notification_setting_to_dict = _to_dict


class NotificationSettingService:
    def list_settings(self, *, search: str = ""):
        qs = NotificationSetting.objects.all().order_by("type", "id")
        term = (search or "").strip()
        if term:
            qs = qs.filter(Q(type__icontains=term) | Q(subject__icontains=term))
        return qs

    def get_setting(self, setting_id: int) -> dict[str, Any]:
        row = NotificationSetting.objects.filter(id=setting_id).first()
        if row is None:
            raise SettingsNotFoundError("Notification setting not found.")
        return _to_dict(row)

    def create_setting(self, payload: dict[str, Any]) -> dict[str, Any]:
        subject = str(payload.get("subject") or "").strip()
        template = str(payload.get("template") or "").strip()
        if not subject or not template:
            raise SettingsValidationError("subject and template are required.")

        row = NotificationSetting.objects.create(
            type=str(payload.get("type") or "").strip() or None,
            is_mail=as_flag_str(payload.get("is_mail", "0")),
            is_sms=as_flag_str(payload.get("is_sms", "0")),
            is_notification=as_int_flag(payload.get("is_notification", 0)),
            display_notification=as_int_flag(payload.get("display_notification", 0)),
            display_sms=as_int_flag(payload.get("display_sms", 1), default=1),
            is_student_recipient=payload.get("is_student_recipient"),
            is_guardian_recipient=payload.get("is_guardian_recipient"),
            is_staff_recipient=payload.get("is_staff_recipient"),
            display_student_recipient=payload.get("display_student_recipient"),
            display_guardian_recipient=payload.get("display_guardian_recipient"),
            display_staff_recipient=payload.get("display_staff_recipient"),
            subject=subject,
            template_id=str(payload.get("template_id") or "").strip(),
            template=template,
            variables=str(payload.get("variables") or "").strip(),
            created_at=now_datetime(),
        )
        logger.info("Created notification setting id=%s type=%s", row.id, row.type)
        return _to_dict(row)

    def update_setting(
        self, setting_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        row = NotificationSetting.objects.filter(id=setting_id).first()
        if row is None:
            raise SettingsNotFoundError("Notification setting not found.")

        if "type" in payload:
            row.type = str(payload.get("type") or "").strip() or None
        if "is_mail" in payload:
            row.is_mail = as_flag_str(payload.get("is_mail"))
        if "is_sms" in payload:
            row.is_sms = as_flag_str(payload.get("is_sms"))
        if "is_notification" in payload:
            row.is_notification = as_int_flag(payload.get("is_notification"))
        if "display_notification" in payload:
            row.display_notification = as_int_flag(payload.get("display_notification"))
        if "display_sms" in payload:
            row.display_sms = as_int_flag(payload.get("display_sms"), default=1)
        for field in (
            "is_student_recipient",
            "is_guardian_recipient",
            "is_staff_recipient",
            "display_student_recipient",
            "display_guardian_recipient",
            "display_staff_recipient",
        ):
            if field in payload:
                setattr(row, field, payload.get(field))
        if "subject" in payload:
            subject = str(payload.get("subject") or "").strip()
            if not subject:
                raise SettingsValidationError("subject cannot be empty.")
            row.subject = subject
        if "template_id" in payload:
            row.template_id = str(payload.get("template_id") or "").strip()
        if "template" in payload:
            template = str(payload.get("template") or "").strip()
            if not template:
                raise SettingsValidationError("template cannot be empty.")
            row.template = template
        if "variables" in payload:
            row.variables = str(payload.get("variables") or "").strip()

        row.save()
        return _to_dict(row)

    def delete_setting(self, setting_id: int) -> None:
        row = NotificationSetting.objects.filter(id=setting_id).first()
        if row is None:
            raise SettingsNotFoundError("Notification setting not found.")
        row.delete()
        logger.info("Deleted notification setting id=%s", setting_id)
