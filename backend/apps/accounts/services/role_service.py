"""Role listing and permission-matrix updates (legacy roles / roles_permissions)."""

from __future__ import annotations

import logging
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.accounts.models import (
    PermissionCategory,
    PermissionGroup,
    Role,
    RolePermission,
)
from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)

logger = logging.getLogger(__name__)


def _flag(value: Any, field: str) -> int:
    if value in (True, 1, "1", "true", "yes"):
        return 1
    if value in (False, 0, "0", "false", "no", None, ""):
        return 0
    raise SettingsValidationError(f"{field} must be a boolean or 0/1.")


def role_to_dict(role: Role) -> dict[str, Any]:
    return {
        "id": role.id,
        "name": role.name or "",
        "slug": role.slug or "",
        "is_active": bool(role.is_active),
        "is_system": bool(role.is_system),
        "is_superadmin": bool(role.is_superadmin),
    }


class RoleService:
    def list_roles(self, *, active_only: bool = False):
        qs = Role.objects.all().order_by("name", "id")
        if active_only:
            qs = qs.filter(is_active=1)
        return qs

    def get_role(self, role_id: int) -> Role:
        role = Role.objects.filter(pk=role_id).first()
        if role is None:
            raise SettingsNotFoundError("Role not found.")
        return role

    def get_role_detail(self, role_id: int) -> dict[str, Any]:
        role = self.get_role(role_id)
        existing = {
            rp.permission_category_id: rp
            for rp in RolePermission.objects.filter(role=role).select_related(
                "permission_category"
            )
            if rp.permission_category_id
        }

        groups: dict[int, dict[str, Any]] = {}
        for group in PermissionGroup.objects.filter(is_active=1).order_by("name", "id"):
            groups[group.id] = {
                "id": group.id,
                "name": group.name or group.short_code,
                "short_code": group.short_code,
                "categories": [],
            }

        categories = (
            PermissionCategory.objects.select_related("permission_group")
            .order_by("permission_group__name", "name", "id")
            .all()
        )
        for cat in categories:
            group = cat.permission_group
            if group is None:
                continue
            bucket = groups.get(group.id)
            if bucket is None:
                bucket = {
                    "id": group.id,
                    "name": group.name or group.short_code,
                    "short_code": group.short_code,
                    "categories": [],
                }
                groups[group.id] = bucket

            rp = existing.get(cat.id)
            bucket["categories"].append(
                {
                    "id": cat.id,
                    "name": cat.name or cat.short_code or str(cat.id),
                    "short_code": cat.short_code or "",
                    "enable_view": bool(cat.enable_view),
                    "enable_add": bool(cat.enable_add),
                    "enable_edit": bool(cat.enable_edit),
                    "enable_delete": bool(cat.enable_delete),
                    "can_view": bool(rp.can_view) if rp else False,
                    "can_add": bool(rp.can_add) if rp else False,
                    "can_edit": bool(rp.can_edit) if rp else False,
                    "can_delete": bool(rp.can_delete) if rp else False,
                }
            )

        return {
            **role_to_dict(role),
            "permission_groups": [g for g in groups.values() if g["categories"]],
        }

    def update_role_permissions(
        self, role_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        role = self.get_role(role_id)
        if role.is_superadmin:
            raise SettingsValidationError(
                "Cannot edit permissions for a superadmin role."
            )

        raw_perms = payload.get("permissions")
        if not isinstance(raw_perms, list):
            raise SettingsValidationError("permissions must be a list.")

        with transaction.atomic():
            return self._apply_role_permissions(role, raw_perms)

    def _apply_role_permissions(
        self, role: Role, raw_perms: list[Any]
    ) -> dict[str, Any]:
        now = timezone.now()
        updated = 0
        created = 0
        role_id = role.id

        for item in raw_perms:
            if not isinstance(item, dict):
                raise SettingsValidationError(
                    "Each permission entry must be an object."
                )
            try:
                perm_cat_id = int(item.get("perm_cat_id") or item.get("id"))
            except (TypeError, ValueError) as exc:
                raise SettingsValidationError(
                    "perm_cat_id is required for each permission."
                ) from exc

            category = PermissionCategory.objects.filter(pk=perm_cat_id).first()
            if category is None:
                raise SettingsNotFoundError(
                    f"Permission category {perm_cat_id} not found."
                )

            flags = {
                "can_view": _flag(item.get("can_view", 0), "can_view"),
                "can_add": _flag(item.get("can_add", 0), "can_add"),
                "can_edit": _flag(item.get("can_edit", 0), "can_edit"),
                "can_delete": _flag(item.get("can_delete", 0), "can_delete"),
            }

            rp = RolePermission.objects.filter(
                role=role, permission_category=category
            ).first()
            if rp is None:
                RolePermission.objects.create(
                    role=role,
                    permission_category=category,
                    created_at=now,
                    is_central=0,
                    **flags,
                )
                created += 1
            else:
                for field, value in flags.items():
                    setattr(rp, field, value)
                rp.save(update_fields=list(flags.keys()))
                updated += 1

        logger.info(
            "Updated role permissions role_id=%s created=%s updated=%s",
            role_id,
            created,
            updated,
        )
        return self.get_role_detail(role_id)
