from __future__ import annotations

import logging
from typing import Any

from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.models.sidebar_menus import SidebarMenus
from apps.settings.models.sidebar_sub_menus import SidebarSubMenus
from apps.settings.services.secret_utils import as_int_flag

logger = logging.getLogger(__name__)


def menu_to_dict(row: SidebarMenus) -> dict[str, Any]:
    return {
        "id": row.id,
        "permission_group_id": row.permission_group_id,
        "icon": row.icon or "",
        "menu": row.menu or "",
        "activate_menu": row.activate_menu or "",
        "lang_key": row.lang_key or "",
        "system_level": row.system_level,
        "level": row.level,
        "sidebar_display": int(row.sidebar_display or 0),
        "is_active": int(row.is_active or 0),
        "created_at": (
            row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else None
        ),
    }


def submenu_to_dict(row: SidebarSubMenus) -> dict[str, Any]:
    return {
        "id": row.id,
        "sidebar_menu_id": row.sidebar_menu_id,
        "menu": row.menu or "",
        "key": row.key or "",
        "lang_key": row.lang_key or "",
        "url": row.url or "",
        "level": row.level,
        "permission_group_id": row.permission_group_id,
        "is_active": int(row.is_active or 0),
        "created_at": (
            row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else None
        ),
    }


class SidebarMenuService:
    def list_menus(self):
        return SidebarMenus.objects.all().order_by("level", "id")

    def list_submenus(self, *, menu_id: int | None = None):
        qs = SidebarSubMenus.objects.all().order_by("sidebar_menu_id", "level", "id")
        if menu_id is not None:
            qs = qs.filter(sidebar_menu_id=menu_id)
        return qs

    def update_menu(self, menu_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = SidebarMenus.objects.filter(id=menu_id).first()
        if row is None:
            raise SettingsNotFoundError("Sidebar menu not found.")
        updated = False
        if "is_active" in payload:
            row.is_active = as_int_flag(payload.get("is_active"), default=1)
            updated = True
        if "sidebar_display" in payload:
            row.sidebar_display = as_int_flag(payload.get("sidebar_display"))
            updated = True
        if "level" in payload:
            try:
                row.level = int(payload.get("level"))
            except (TypeError, ValueError) as exc:
                raise SettingsValidationError("level must be an integer.") from exc
            updated = True
        if not updated:
            raise SettingsValidationError("No sidebar menu fields provided.")
        row.save()
        logger.info("Updated sidebar menu id=%s", menu_id)
        return menu_to_dict(row)

    def update_submenu(
        self, submenu_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        row = SidebarSubMenus.objects.filter(id=submenu_id).first()
        if row is None:
            raise SettingsNotFoundError("Sidebar submenu not found.")
        updated = False
        if "is_active" in payload:
            row.is_active = as_int_flag(payload.get("is_active"), default=1)
            updated = True
        if "level" in payload:
            try:
                row.level = int(payload.get("level"))
            except (TypeError, ValueError) as exc:
                raise SettingsValidationError("level must be an integer.") from exc
            updated = True
        if not updated:
            raise SettingsValidationError("No sidebar submenu fields provided.")
        row.save()
        logger.info("Updated sidebar submenu id=%s", submenu_id)
        return submenu_to_dict(row)
