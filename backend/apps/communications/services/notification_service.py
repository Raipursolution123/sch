import logging
from typing import Any

from django.utils import timezone

from apps.communications.domain.notification_exceptions import (
    NotificationNotFoundError,
    NotificationValidationError,
)
from apps.communications.models.send_notification import SendNotification

logger = logging.getLogger(__name__)


class NotificationService:
    def list_notices(self):
        return SendNotification.objects.all().order_by("-id")

    def get_notice(self, notice_id: int) -> dict[str, Any]:
        notice = SendNotification.objects.filter(id=notice_id).first()
        if notice is None:
            raise NotificationNotFoundError("Notice not found.")
        return self._to_dict(notice)

    def create_notice(self, payload: dict[str, Any]) -> dict[str, Any]:
        cleaned = self._validate(payload, partial=False)
        notice = SendNotification.objects.create(
            title=cleaned["title"],
            message=cleaned.get("message"),
            publish_date=cleaned.get("publish_date"),
            date=cleaned.get("date") or timezone.now().date(),
            attachment=cleaned.get("attachment"),
            visible_student=cleaned.get("visible_student", "no"),
            visible_staff=cleaned.get("visible_staff", "no"),
            visible_parent=cleaned.get("visible_parent", "no"),
            created_by=cleaned.get("created_by"),
            created_id=cleaned.get("created_id"),
            is_active=cleaned.get("is_active", "no"),
            created_at=timezone.now(),
            updated_at=timezone.now().date(),
        )
        logger.info("Created notice id=%s title=%s", notice.id, notice.title)
        return self._to_dict(notice)

    def update_notice(self, notice_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        notice = SendNotification.objects.filter(id=notice_id).first()
        if notice is None:
            raise NotificationNotFoundError("Notice not found.")

        current = {
            "title": notice.title,
            "message": notice.message,
            "publish_date": notice.publish_date,
            "date": notice.date,
            "attachment": notice.attachment,
            "visible_student": notice.visible_student,
            "visible_staff": notice.visible_staff,
            "visible_parent": notice.visible_parent,
            "is_active": notice.is_active,
            "created_by": notice.created_by,
            "created_id": notice.created_id,
        }
        merged = {**current, **payload}
        cleaned = self._validate(merged, partial=False)

        notice.title = cleaned["title"]
        notice.message = cleaned.get("message")
        notice.publish_date = cleaned.get("publish_date")
        notice.date = cleaned.get("date") or notice.date
        notice.attachment = cleaned.get("attachment")
        notice.visible_student = cleaned.get("visible_student", "no")
        notice.visible_staff = cleaned.get("visible_staff", "no")
        notice.visible_parent = cleaned.get("visible_parent", "no")
        notice.is_active = cleaned.get("is_active", "no")
        notice.updated_at = timezone.now().date()
        notice.save()
        return self._to_dict(notice)

    def delete_notice(self, notice_id: int) -> None:
        notice = SendNotification.objects.filter(id=notice_id).first()
        if notice is None:
            raise NotificationNotFoundError("Notice not found.")
        notice.delete()
        logger.info("Deleted notice id=%s", notice_id)

    def enrich_list(self, rows) -> list[dict[str, Any]]:
        return [self._to_dict(row) for row in rows]

    def _to_dict(self, notice: SendNotification) -> dict[str, Any]:
        return {
            "id": notice.id,
            "title": notice.title,
            "message": notice.message,
            "publish_date": str(notice.publish_date) if notice.publish_date else None,
            "date": str(notice.date) if notice.date else None,
            "attachment": notice.attachment,
            "visible_student": notice.visible_student,
            "visible_staff": notice.visible_staff,
            "visible_parent": notice.visible_parent,
            "created_by": notice.created_by,
            "created_id": notice.created_id,
            "is_active": notice.is_active,
            "created_at": notice.created_at.isoformat() if notice.created_at else None,
            "updated_at": str(notice.updated_at) if notice.updated_at else None,
        }

    def _validate(self, payload: dict[str, Any], *, partial: bool) -> dict[str, Any]:
        title = payload.get("title")
        if title is not None:
            title = str(title).strip()
        if not partial and not title:
            raise NotificationValidationError("Title is required.")

        def yes_no(value, default="no") -> str:
            if value is None:
                return default
            if isinstance(value, bool):
                return "yes" if value else "no"
            text = str(value).strip().lower()
            return "yes" if text in ("yes", "1", "true") else "no"

        return {
            "title": title,
            "message": payload.get("message"),
            "publish_date": payload.get("publish_date"),
            "date": payload.get("date"),
            "attachment": payload.get("attachment"),
            "visible_student": yes_no(payload.get("visible_student")),
            "visible_staff": yes_no(payload.get("visible_staff")),
            "visible_parent": yes_no(payload.get("visible_parent")),
            "is_active": yes_no(payload.get("is_active")),
            "created_by": payload.get("created_by"),
            "created_id": payload.get("created_id"),
        }
