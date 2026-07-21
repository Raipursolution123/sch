"""Staff user accounts: list, activate/deactivate, assign role."""

from __future__ import annotations

import logging
from typing import Any

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.accounts.models import Role, StaffRole, User
from apps.staff.models import Staff
from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from common.cache.reference_cache import invalidate_user_permissions_cache

logger = logging.getLogger(__name__)


def _normalize_active(value: Any) -> str:
    if value in (True, 1, "1", "true", "yes", "Yes", "YES"):
        return "yes"
    if value in (False, 0, "0", "false", "no", "No", "NO"):
        return "no"
    raise SettingsValidationError("is_active must be yes/no or boolean.")


def _staff_display_name(staff: Staff | None) -> str:
    if staff is None:
        return ""
    parts = [p for p in (staff.name, staff.surname) if p]
    return " ".join(parts).strip()


class UserAccountService:
    def list_staff_users(self):
        return User.objects.filter(role="staff").order_by("username", "id")

    def _serialize_user(self, user: User) -> dict[str, Any]:
        staff = Staff.objects.filter(pk=user.user_id).first()
        staff_role = (
            StaffRole.objects.filter(staff_id=user.user_id, is_active=1)
            .select_related("role")
            .first()
        )
        role = staff_role.role if staff_role else None
        return {
            "id": user.id,
            "username": user.username or "",
            "is_active": str(user.is_active or "").lower() in {"yes", "1", "true"},
            "staff_id": user.user_id,
            "staff_name": _staff_display_name(staff),
            "employee_id": staff.employee_id if staff else "",
            "email": staff.email if staff else "",
            "role_id": role.id if role else None,
            "role_name": (role.name or role.slug or "") if role else "",
            "role_slug": (role.slug or role.name or "") if role else "",
            "is_superadmin_role": bool(role.is_superadmin) if role else False,
        }

    def list_users_payload(self) -> list[dict[str, Any]]:
        return [self._serialize_user(u) for u in self.list_staff_users()]

    def get_user(self, user_id: int) -> User:
        user = User.objects.filter(pk=user_id, role="staff").first()
        if user is None:
            raise SettingsNotFoundError("User not found.")
        return user

    def get_user_detail(self, user_id: int) -> dict[str, Any]:
        return self._serialize_user(self.get_user(user_id))

    def update_user(self, user_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        if not ("is_active" in payload or "role_id" in payload):
            raise SettingsValidationError("Provide is_active and/or role_id to update.")

        user = self.get_user(user_id)
        with transaction.atomic():
            return self._apply_user_update(user, payload)

    def _apply_user_update(self, user: User, payload: dict[str, Any]) -> dict[str, Any]:
        changed = False

        if "is_active" in payload:
            new_active = _normalize_active(payload.get("is_active"))
            if str(user.is_active or "") != new_active:
                user.is_active = new_active
                user.updated_at = timezone.now().date()
                user.save(update_fields=["is_active", "updated_at"])
                changed = True

        if "role_id" in payload:
            role_id = payload.get("role_id")
            if role_id in (None, "", 0, "0"):
                raise SettingsValidationError("role_id is required.")
            try:
                role_id = int(role_id)
            except (TypeError, ValueError) as exc:
                raise SettingsValidationError("role_id must be an integer.") from exc

            role = Role.objects.filter(pk=role_id).first()
            if role is None:
                raise SettingsNotFoundError("Role not found.")
            if not role.is_active:
                raise SettingsValidationError("Cannot assign an inactive role.")

            now = timezone.now()
            current = (
                StaffRole.objects.filter(staff_id=user.user_id, is_active=1)
                .select_related("role")
                .first()
            )
            if current is None or current.role_id != role.id:
                StaffRole.objects.filter(staff_id=user.user_id, is_active=1).update(
                    is_active=0,
                    updated_at=now.date(),
                )
                existing_inactive = StaffRole.objects.filter(
                    staff_id=user.user_id, role=role
                ).first()
                if existing_inactive:
                    existing_inactive.is_active = 1
                    existing_inactive.updated_at = now.date()
                    existing_inactive.save(update_fields=["is_active", "updated_at"])
                else:
                    StaffRole.objects.create(
                        role=role,
                        staff_id=user.user_id,
                        is_active=1,
                        created_at=now,
                        updated_at=now.date(),
                    )
                changed = True

        if changed:
            invalidate_user_permissions_cache(user.id)
            logger.info("Updated staff user id=%s", user.id)
        return self._serialize_user(user)

    def search_users(self, *, q: str = "") -> list[dict[str, Any]]:
        qs = self.list_staff_users()
        term = (q or "").strip()
        if not term:
            return [self._serialize_user(u) for u in qs]

        staff_ids = list(
            Staff.objects.filter(
                Q(name__icontains=term)
                | Q(surname__icontains=term)
                | Q(email__icontains=term)
                | Q(employee_id__icontains=term)
            ).values_list("id", flat=True)
        )
        qs = qs.filter(Q(username__icontains=term) | Q(user_id__in=staff_ids))
        return [self._serialize_user(u) for u in qs]
