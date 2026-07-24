from __future__ import annotations

import logging
from typing import Any

from django.utils import timezone

from apps.communications.domain.notification_exceptions import (
    NotificationNotFoundError,
    NotificationValidationError,
)
from apps.communications.models.messages import Messages
from apps.students.models.student_session import StudentSession
from apps.students.models.students import Students

logger = logging.getLogger(__name__)


def _yes_no(flag: bool) -> str:
    return "1" if flag else "0"


class MessageService:
    """Compose and list Email/SMS messages persisted to legacy `messages`."""

    def list_messages(self, *, channel: str | None = None) -> list[dict[str, Any]]:
        qs = Messages.objects.all().order_by("-id")
        channel = (channel or "").strip().lower()
        if channel == "email":
            qs = qs.filter(send_mail="1")
        elif channel == "sms":
            qs = qs.filter(send_sms="1")
        return [self._to_dict(row) for row in qs[:200]]

    def get_message(self, pk: int) -> dict[str, Any]:
        row = Messages.objects.filter(id=pk).first()
        if row is None:
            raise NotificationNotFoundError("Message not found.")
        return self._to_dict(row)

    def compose(
        self,
        payload: dict[str, Any],
        *,
        channel: str,
    ) -> dict[str, Any]:
        channel = (channel or "").strip().lower()
        if channel not in ("email", "sms"):
            raise NotificationValidationError("channel must be email or sms.")

        title = str(payload.get("title") or "").strip()
        message = str(payload.get("message") or "").strip()
        if not title:
            raise NotificationValidationError("Title is required.")
        if not message:
            raise NotificationValidationError("Message body is required.")

        audience = str(payload.get("audience") or "group").strip().lower()
        if audience not in ("group", "individual", "class"):
            raise NotificationValidationError(
                "audience must be group, individual, or class."
            )

        group_list = str(payload.get("group_list") or "").strip() or None
        user_list = str(payload.get("user_list") or "").strip() or None
        class_id = payload.get("class_id")
        section_id = payload.get("section_id")

        if audience == "individual" and not user_list:
            raise NotificationValidationError(
                "user_list is required for individual audience."
            )
        if audience == "group" and not group_list:
            group_list = "students,staff,parent"
        if audience == "class":
            try:
                class_id = int(class_id)
            except (TypeError, ValueError) as exc:
                raise NotificationValidationError("class_id is required.") from exc
            if not class_id:
                raise NotificationValidationError("class_id is required.")

        now = timezone.now()
        row = Messages.objects.create(
            title=title[:200],
            template_id=str(payload.get("template_id") or "")[:100] or None,
            email_template_id=None,
            sms_template_id=None,
            send_through=channel,
            message=message,
            send_mail=_yes_no(channel == "email"),
            send_sms=_yes_no(channel == "sms"),
            is_group=_yes_no(audience == "group"),
            is_individual=_yes_no(audience == "individual"),
            is_class=1 if audience == "class" else 0,
            is_schedule=0,
            sent=0,  # Queued — live SMTP/SMS delivery is not configured in MVP.
            schedule_date_time=None,
            group_list=group_list,
            user_list=user_list,
            schedule_class=int(class_id) if audience == "class" and class_id else None,
            schedule_section=(
                str(section_id)
                if audience == "class" and section_id not in (None, "")
                else None
            ),
            created_at=now,
            updated_at=now.date(),
        )
        logger.info("Composed %s message id=%s title=%s", channel, row.id, row.title)
        return self._to_dict(row)

    def bulk_email_to_students(self, payload: dict[str, Any]) -> dict[str, Any]:
        title = str(payload.get("title") or "").strip()
        message = str(payload.get("message") or "").strip()
        if not title:
            raise NotificationValidationError("Title is required.")
        if not message:
            raise NotificationValidationError("Message body is required.")

        try:
            session_id = int(payload.get("session_id"))
            class_id = int(payload.get("class_id"))
        except (TypeError, ValueError) as exc:
            raise NotificationValidationError(
                "session_id and class_id are required."
            ) from exc

        section_raw = payload.get("section_id")
        section_id: int | None
        try:
            section_id = (
                int(section_raw) if section_raw not in (None, "", 0, "0") else None
            )
        except (TypeError, ValueError):
            section_id = None

        enrollments = StudentSession.objects.filter(
            session_id=session_id,
            class_id=class_id,
        )
        if section_id:
            enrollments = enrollments.filter(section_id=section_id)

        student_ids = list(enrollments.values_list("student_id", flat=True))
        if not student_ids:
            raise NotificationValidationError(
                "No students found for the selected class/section."
            )

        students = Students.objects.filter(id__in=student_ids, is_active="yes")
        emails = sorted(
            {(s.email or "").strip() for s in students if (s.email or "").strip()}
        )
        if not emails:
            raise NotificationValidationError(
                "No student email addresses found for this class/section."
            )

        now = timezone.now()
        row = Messages.objects.create(
            title=title[:200],
            template_id=None,
            email_template_id=None,
            sms_template_id=None,
            send_through="email",
            message=message,
            send_mail="1",
            send_sms="0",
            is_group="0",
            is_individual="0",
            is_class=1,
            is_schedule=0,
            sent=0,
            schedule_date_time=None,
            group_list=None,
            user_list=",".join(emails),
            schedule_class=class_id,
            schedule_section=str(section_id) if section_id else None,
            created_at=now,
            updated_at=now.date(),
        )
        data = self._to_dict(row)
        data["recipient_count"] = len(emails)
        logger.info(
            "Bulk email message id=%s recipients=%s class_id=%s",
            row.id,
            len(emails),
            class_id,
        )
        return data

    def _to_dict(self, row: Messages) -> dict[str, Any]:
        return {
            "id": row.id,
            "title": row.title or "",
            "message": row.message or "",
            "send_through": row.send_through or "",
            "send_mail": row.send_mail == "1" or row.send_mail == 1,
            "send_sms": row.send_sms == "1" or row.send_sms == 1,
            "is_group": row.is_group == "1" or row.is_group == 1,
            "is_individual": row.is_individual == "1" or row.is_individual == 1,
            "is_class": int(row.is_class or 0) == 1,
            "is_schedule": int(row.is_schedule or 0) == 1,
            "sent": int(row.sent or 0),
            "delivery_status": "sent" if int(row.sent or 0) == 1 else "queued",
            "group_list": row.group_list or "",
            "user_list": row.user_list or "",
            "class_id": row.schedule_class,
            "section_id": row.schedule_section or "",
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        }
