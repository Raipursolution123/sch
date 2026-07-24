from __future__ import annotations

import datetime
import logging
from typing import Any

from django.db.models import Q
from django.utils import timezone

from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeNotFoundError,
    FrontOfficeValidationError,
)
from apps.front_office.models.visitors_purpose import VisitorsPurpose
from apps.system.models.general_calls import GeneralCalls

logger = logging.getLogger(__name__)


def _parse_date(value: Any, *, field: str) -> datetime.date:
    if value in (None, ""):
        raise FrontOfficeValidationError(f"{field} is required.")
    if isinstance(value, datetime.date) and not isinstance(value, datetime.datetime):
        return value
    try:
        return datetime.datetime.strptime(str(value), "%Y-%m-%d").date()
    except ValueError as exc:
        raise FrontOfficeValidationError(f"Invalid {field}. Use YYYY-MM-DD.") from exc


class PhoneCallLogService:
    def list(self, *, query: str | None = None) -> list[dict[str, Any]]:
        qs = GeneralCalls.objects.all().order_by("-date", "-id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(Q(name__icontains=term) | Q(contact__icontains=term))
        return [self._to_dict(row) for row in qs]

    def get(self, pk: int) -> dict[str, Any]:
        row = GeneralCalls.objects.filter(id=pk).first()
        if row is None:
            raise FrontOfficeNotFoundError("Phone call log not found.")
        return self._to_dict(row)

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        cleaned = self._validate(payload)
        row = GeneralCalls.objects.create(**cleaned, created_at=timezone.now())
        logger.info("Created phone call log id=%s", row.id)
        return self._to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = GeneralCalls.objects.filter(id=pk).first()
        if row is None:
            raise FrontOfficeNotFoundError("Phone call log not found.")
        cleaned = self._validate({**self._to_dict(row), **payload})
        for key, value in cleaned.items():
            setattr(row, key, value)
        row.save()
        return self._to_dict(row)

    def delete(self, pk: int) -> None:
        row = GeneralCalls.objects.filter(id=pk).first()
        if row is None:
            raise FrontOfficeNotFoundError("Phone call log not found.")
        row.delete()

    def _validate(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name") or "").strip()
        contact = str(payload.get("contact") or "").strip()
        call_type = str(payload.get("call_type") or "").strip() or "Incoming"
        if not name:
            raise FrontOfficeValidationError("Name is required.")
        if not contact:
            raise FrontOfficeValidationError("Contact is required.")
        if call_type not in ("Incoming", "Outgoing"):
            raise FrontOfficeValidationError("call_type must be Incoming or Outgoing.")
        return {
            "name": name,
            "contact": contact[:12],
            "date": _parse_date(payload.get("date"), field="date"),
            "description": str(payload.get("description") or "").strip()[:500],
            "follow_up_date": _parse_date(
                payload.get("follow_up_date") or payload.get("date"),
                field="follow_up_date",
            ),
            "call_duration": str(payload.get("call_duration") or "").strip()[:50],
            "note": str(payload.get("note") or "").strip(),
            "call_type": call_type,
        }

    def _to_dict(self, row: GeneralCalls) -> dict[str, Any]:
        return {
            "id": row.id,
            "name": row.name or "",
            "contact": row.contact or "",
            "date": row.date.isoformat() if row.date else None,
            "description": row.description or "",
            "follow_up_date": (
                row.follow_up_date.isoformat() if row.follow_up_date else None
            ),
            "call_duration": row.call_duration or "",
            "note": row.note or "",
            "call_type": row.call_type or "",
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }


class VisitorsPurposeService:
    def list(self) -> list[dict[str, Any]]:
        return [
            self._to_dict(row)
            for row in VisitorsPurpose.objects.all().order_by("visitors_purpose", "id")
        ]

    def get(self, pk: int) -> dict[str, Any]:
        row = VisitorsPurpose.objects.filter(id=pk).first()
        if row is None:
            raise FrontOfficeNotFoundError("Visitor purpose not found.")
        return self._to_dict(row)

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("visitors_purpose") or payload.get("name") or "").strip()
        if not name:
            raise FrontOfficeValidationError("Purpose name is required.")
        row = VisitorsPurpose.objects.create(
            visitors_purpose=name,
            description=str(payload.get("description") or "").strip(),
            created_at=timezone.now(),
        )
        logger.info("Created visitors purpose id=%s", row.id)
        return self._to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = VisitorsPurpose.objects.filter(id=pk).first()
        if row is None:
            raise FrontOfficeNotFoundError("Visitor purpose not found.")
        if "visitors_purpose" in payload or "name" in payload:
            name = str(
                payload.get("visitors_purpose") or payload.get("name") or ""
            ).strip()
            if not name:
                raise FrontOfficeValidationError("Purpose name cannot be empty.")
            row.visitors_purpose = name
        if "description" in payload:
            row.description = str(payload.get("description") or "").strip()
        row.save()
        return self._to_dict(row)

    def delete(self, pk: int) -> None:
        row = VisitorsPurpose.objects.filter(id=pk).first()
        if row is None:
            raise FrontOfficeNotFoundError("Visitor purpose not found.")
        row.delete()

    def _to_dict(self, row: VisitorsPurpose) -> dict[str, Any]:
        return {
            "id": row.id,
            "visitors_purpose": row.visitors_purpose or "",
            "name": row.visitors_purpose or "",
            "description": row.description or "",
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
