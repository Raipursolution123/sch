import logging
from typing import Any

from apps.fees.domain.fee_exceptions import (
    FeeConflictError,
    FeeNotFoundError,
    FeeValidationError,
)
from apps.fees.models.fee_groups import FeeGroups
from apps.fees.selectors import fee_selectors as selectors

logger = logging.getLogger(__name__)


class FeeGroupService:
    def list_groups(self):
        return FeeGroups.objects.all().order_by("name")

    def get_group(self, group_id: int) -> dict[str, Any]:
        group = FeeGroups.objects.filter(id=group_id).first()
        if group is None:
            raise FeeNotFoundError("Fee group not found.")
        return selectors.fee_group_to_dict(group)

    def create_group(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name", "")).strip()
        if not name:
            raise FeeValidationError("Fee group name is required.")
        if FeeGroups.objects.filter(name__iexact=name).exists():
            raise FeeConflictError("A fee group with this name already exists.")

        group = FeeGroups.objects.create(
            name=name,
            description=(
                str(payload.get("description", "")).strip()
                if payload.get("description")
                else None
            ),
            is_system=0,
            is_active=payload.get("is_active", "no"),
            created_at=selectors.now_datetime(),
        )
        return selectors.fee_group_to_dict(group)

    def update_group(self, group_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        group = FeeGroups.objects.filter(id=group_id).first()
        if group is None:
            raise FeeNotFoundError("Fee group not found.")

        if "name" in payload:
            name = str(payload.get("name", "")).strip()
            if not name:
                raise FeeValidationError("Fee group name cannot be empty.")
            if (
                FeeGroups.objects.exclude(id=group_id)
                .filter(name__iexact=name)
                .exists()
            ):
                raise FeeConflictError("A fee group with this name already exists.")
            group.name = name

        if "description" in payload:
            desc = payload.get("description")
            group.description = str(desc).strip() if desc else None

        if "is_active" in payload:
            group.is_active = payload["is_active"]

        group.save()
        return selectors.fee_group_to_dict(group)

    def delete_group(self, group_id: int) -> None:
        group = FeeGroups.objects.filter(id=group_id).first()
        if group is None:
            raise FeeNotFoundError("Fee group not found.")
        if group.is_active == "yes":
            raise FeeValidationError("Deactivate the fee group before deleting.")
        if group.is_system:
            raise FeeValidationError("Cannot delete a system fee group.")
        group.delete()
