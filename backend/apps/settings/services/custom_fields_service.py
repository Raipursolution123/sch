from __future__ import annotations

import logging
from typing import Any

from django.db.models import Q

from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.models.custom_fields import CustomFields
from apps.settings.selectors.settings_selectors import now_datetime, today_date
from apps.settings.services.secret_utils import as_int_flag

logger = logging.getLogger(__name__)


def custom_field_to_dict(row: CustomFields) -> dict[str, Any]:
    return {
        "id": row.id,
        "name": row.name or "",
        "belong_to": row.belong_to or "",
        "type": row.type or "",
        "bs_column": row.bs_column,
        "validation": int(row.validation or 0),
        "field_values": row.field_values or "",
        "show_table": row.show_table or "",
        "visible_on_table": int(row.visible_on_table or 0),
        "weight": row.weight,
        "is_active": int(row.is_active or 0),
        "created_at": (
            row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else None
        ),
        "updated_at": str(row.updated_at) if row.updated_at else None,
    }


class CustomFieldsService:
    def list_fields(self, *, search: str = "", belong_to: str = ""):
        qs = CustomFields.objects.all().order_by("belong_to", "weight", "id")
        if belong_to.strip():
            qs = qs.filter(belong_to__iexact=belong_to.strip())
        term = (search or "").strip()
        if term:
            qs = qs.filter(Q(name__icontains=term) | Q(type__icontains=term))
        return qs

    def get_field(self, field_id: int) -> dict[str, Any]:
        row = CustomFields.objects.filter(id=field_id).first()
        if row is None:
            raise SettingsNotFoundError("Custom field not found.")
        return custom_field_to_dict(row)

    def create_field(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name") or "").strip()
        belong_to = str(payload.get("belong_to") or "").strip()
        field_type = str(payload.get("type") or "").strip()
        if not name or not belong_to or not field_type:
            raise SettingsValidationError("name, belong_to, and type are required.")

        row = CustomFields.objects.create(
            name=name,
            belong_to=belong_to,
            type=field_type,
            bs_column=payload.get("bs_column"),
            validation=as_int_flag(payload.get("validation", 0)),
            field_values=str(payload.get("field_values") or "").strip() or None,
            show_table=str(payload.get("show_table") or "").strip() or None,
            visible_on_table=as_int_flag(payload.get("visible_on_table", 0)),
            weight=payload.get("weight"),
            is_active=as_int_flag(payload.get("is_active", 1), default=1),
            created_at=now_datetime(),
            updated_at=today_date(),
        )
        logger.info("Created custom field id=%s name=%s", row.id, row.name)
        return custom_field_to_dict(row)

    def update_field(self, field_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = CustomFields.objects.filter(id=field_id).first()
        if row is None:
            raise SettingsNotFoundError("Custom field not found.")

        if "name" in payload:
            name = str(payload.get("name") or "").strip()
            if not name:
                raise SettingsValidationError("name cannot be empty.")
            row.name = name
        if "belong_to" in payload:
            belong_to = str(payload.get("belong_to") or "").strip()
            if not belong_to:
                raise SettingsValidationError("belong_to cannot be empty.")
            row.belong_to = belong_to
        if "type" in payload:
            field_type = str(payload.get("type") or "").strip()
            if not field_type:
                raise SettingsValidationError("type cannot be empty.")
            row.type = field_type
        if "bs_column" in payload:
            row.bs_column = payload.get("bs_column")
        if "validation" in payload:
            row.validation = as_int_flag(payload.get("validation"))
        if "field_values" in payload:
            row.field_values = str(payload.get("field_values") or "").strip() or None
        if "show_table" in payload:
            row.show_table = str(payload.get("show_table") or "").strip() or None
        if "visible_on_table" in payload:
            row.visible_on_table = as_int_flag(payload.get("visible_on_table"))
        if "weight" in payload:
            row.weight = payload.get("weight")
        if "is_active" in payload:
            row.is_active = as_int_flag(payload.get("is_active"))

        row.updated_at = today_date()
        row.save()
        return custom_field_to_dict(row)

    def delete_field(self, field_id: int) -> None:
        row = CustomFields.objects.filter(id=field_id).first()
        if row is None:
            raise SettingsNotFoundError("Custom field not found.")
        row.delete()
        logger.info("Deleted custom field id=%s", field_id)
