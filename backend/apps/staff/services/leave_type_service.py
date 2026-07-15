import logging
from typing import Any

from apps.staff.domain.staff_exceptions import (
    StaffConflictError,
    StaffNotFoundError,
    StaffValidationError,
)
from apps.staff.models.leave_types import LeaveTypes
from apps.staff.models.staff_leave_details import StaffLeaveDetails
from apps.staff.models.staff_leave_request import StaffLeaveRequest

logger = logging.getLogger(__name__)


class LeaveTypeService:
    def list_types(self) -> list[dict[str, Any]]:
        rows = LeaveTypes.objects.all().order_by("type")
        return [self._to_dict(row) for row in rows]

    def get_type(self, type_id: int) -> dict[str, Any]:
        row = LeaveTypes.objects.filter(id=type_id).first()
        if row is None:
            raise StaffNotFoundError("Leave type not found.")
        return self._to_dict(row)

    def create_type(self, payload: dict[str, Any]) -> dict[str, Any]:
        cleaned = self._validate_payload(payload)
        if LeaveTypes.objects.filter(type__iexact=cleaned["type"]).exists():
            raise StaffConflictError("A leave type with this name already exists.")

        row = LeaveTypes.objects.create(
            type=cleaned["type"],
            is_active=cleaned["is_active"],
        )
        logger.info("Created leave type id=%s name=%s", row.id, row.type)
        return self._to_dict(row)

    def update_type(self, type_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = LeaveTypes.objects.filter(id=type_id).first()
        if row is None:
            raise StaffNotFoundError("Leave type not found.")

        current = {"type": row.type, "is_active": row.is_active}
        merged = {**current, **payload}
        cleaned = self._validate_payload(merged)

        if (
            LeaveTypes.objects.exclude(id=type_id)
            .filter(type__iexact=cleaned["type"])
            .exists()
        ):
            raise StaffConflictError("A leave type with this name already exists.")

        row.type = cleaned["type"]
        row.is_active = cleaned["is_active"]
        row.save()
        return self._to_dict(row)

    def delete_type(self, type_id: int) -> None:
        row = LeaveTypes.objects.filter(id=type_id).first()
        if row is None:
            raise StaffNotFoundError("Leave type not found.")
        if str(row.is_active).lower() in {"yes", "1", "true"}:
            raise StaffValidationError("Deactivate the leave type before deleting.")
        if StaffLeaveRequest.objects.filter(leave_type_id=type_id).exists():
            raise StaffValidationError(
                "Cannot delete a leave type that is used by leave requests."
            )
        if StaffLeaveDetails.objects.filter(leave_type_id=type_id).exists():
            raise StaffValidationError(
                "Cannot delete a leave type that is allotted to staff."
            )
        row.delete()
        logger.info("Deleted leave type id=%s", type_id)

    def _to_dict(self, row: LeaveTypes) -> dict[str, Any]:
        active = str(row.is_active or "").strip().lower()
        is_active = "yes" if active in {"yes", "1", "true"} else "no"
        return {
            "id": row.id,
            "name": row.type,
            "is_active": is_active,
        }

    def _validate_payload(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name") or payload.get("type") or "").strip()
        if not name:
            raise StaffValidationError("Leave type name is required.")

        is_active = payload.get("is_active", "no")
        if isinstance(is_active, bool):
            is_active = "yes" if is_active else "no"
        is_active = str(is_active).strip().lower()
        if is_active in {"1", "true"}:
            is_active = "yes"
        if is_active in {"0", "false"}:
            is_active = "no"
        if is_active not in {"yes", "no"}:
            raise StaffValidationError("is_active must be 'yes' or 'no'.")

        return {"type": name, "is_active": is_active}
