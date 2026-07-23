from __future__ import annotations

import logging
from typing import Any

from django.db.models import Q

from apps.accounts.models.permission import PermissionGroup
from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.services.secret_utils import as_int_flag

logger = logging.getLogger(__name__)


def module_to_dict(row: PermissionGroup) -> dict[str, Any]:
    return {
        "id": row.id,
        "name": row.name or row.short_code,
        "short_code": row.short_code,
        "is_active": int(row.is_active or 0),
        "system": int(row.system or 0),
        "created_at": (
            row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else None
        ),
    }


class ModulesService:
    def list_modules(self, *, search: str = ""):
        qs = PermissionGroup.objects.all().order_by("name", "id")
        term = (search or "").strip()
        if term:
            qs = qs.filter(Q(name__icontains=term) | Q(short_code__icontains=term))
        return qs

    def get_module(self, module_id: int) -> dict[str, Any]:
        row = PermissionGroup.objects.filter(id=module_id).first()
        if row is None:
            raise SettingsNotFoundError("Module not found.")
        return module_to_dict(row)

    def update_module(self, module_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = PermissionGroup.objects.filter(id=module_id).first()
        if row is None:
            raise SettingsNotFoundError("Module not found.")
        if "is_active" not in payload:
            raise SettingsValidationError("is_active is required.")
        if int(row.system or 0) == 1 and not as_int_flag(
            payload.get("is_active"), default=1
        ):
            raise SettingsValidationError("Cannot disable a system module.")
        row.is_active = as_int_flag(payload.get("is_active"))
        row.save(update_fields=["is_active"])
        logger.info("Updated module id=%s is_active=%s", module_id, row.is_active)
        return module_to_dict(row)
