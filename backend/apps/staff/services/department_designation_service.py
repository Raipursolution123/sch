from __future__ import annotations

import logging
from typing import Any

from apps.staff.domain.staff_exceptions import (
    StaffConflictError,
    StaffNotFoundError,
    StaffValidationError,
)
from apps.staff.models.department import Department
from apps.staff.models.staff import Staff
from apps.staff.models.staff_designation import StaffDesignation

logger = logging.getLogger(__name__)


def _normalize_active(value: Any, default: str = "yes") -> str:
    if value is None:
        return default
    if value in ("yes", "no"):
        return value
    return "yes" if value in (1, True, "1", "true", "True") else "no"


class DepartmentService:
    def list(self, *, query: str | None = None) -> list[dict[str, Any]]:
        qs = Department.objects.all().order_by("department_name", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(department_name__icontains=term)
        return [self._to_dict(row) for row in qs]

    def get(self, pk: int) -> dict[str, Any]:
        row = Department.objects.filter(id=pk).first()
        if row is None:
            raise StaffNotFoundError("Department not found.")
        return self._to_dict(row)

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("department_name") or payload.get("name") or "").strip()
        if not name:
            raise StaffValidationError("Department name is required.")
        if Department.objects.filter(department_name__iexact=name).exists():
            raise StaffConflictError("A department with this name already exists.")
        row = Department.objects.create(
            department_name=name,
            is_active=_normalize_active(payload.get("is_active"), "yes"),
        )
        logger.info("Created department id=%s", row.id)
        return self._to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = Department.objects.filter(id=pk).first()
        if row is None:
            raise StaffNotFoundError("Department not found.")
        if "department_name" in payload or "name" in payload:
            name = str(
                payload.get("department_name") or payload.get("name") or ""
            ).strip()
            if not name:
                raise StaffValidationError("Department name cannot be empty.")
            if (
                Department.objects.exclude(id=pk)
                .filter(department_name__iexact=name)
                .exists()
            ):
                raise StaffConflictError("A department with this name already exists.")
            row.department_name = name
        if "is_active" in payload and payload["is_active"] is not None:
            row.is_active = _normalize_active(payload["is_active"])
        row.save()
        return self._to_dict(row)

    def delete(self, pk: int) -> None:
        row = Department.objects.filter(id=pk).first()
        if row is None:
            raise StaffNotFoundError("Department not found.")
        if _normalize_active(row.is_active, "no") == "yes":
            raise StaffValidationError("Deactivate the department before deleting.")
        if Staff.objects.filter(department=pk).exists():
            raise StaffValidationError(
                "Cannot delete a department that is assigned to staff."
            )
        row.delete()

    def _to_dict(self, row: Department) -> dict[str, Any]:
        return {
            "id": row.id,
            "department_name": row.department_name or "",
            "name": row.department_name or "",
            "is_active": _normalize_active(row.is_active, "no"),
        }


class DesignationService:
    def list(self, *, query: str | None = None) -> list[dict[str, Any]]:
        qs = StaffDesignation.objects.all().order_by("designation", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(designation__icontains=term)
        return [self._to_dict(row) for row in qs]

    def get(self, pk: int) -> dict[str, Any]:
        row = StaffDesignation.objects.filter(id=pk).first()
        if row is None:
            raise StaffNotFoundError("Designation not found.")
        return self._to_dict(row)

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("designation") or payload.get("name") or "").strip()
        if not name:
            raise StaffValidationError("Designation name is required.")
        if StaffDesignation.objects.filter(designation__iexact=name).exists():
            raise StaffConflictError("A designation with this name already exists.")
        row = StaffDesignation.objects.create(
            designation=name,
            is_active=_normalize_active(payload.get("is_active"), "yes"),
        )
        logger.info("Created designation id=%s", row.id)
        return self._to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = StaffDesignation.objects.filter(id=pk).first()
        if row is None:
            raise StaffNotFoundError("Designation not found.")
        if "designation" in payload or "name" in payload:
            name = str(payload.get("designation") or payload.get("name") or "").strip()
            if not name:
                raise StaffValidationError("Designation name cannot be empty.")
            if (
                StaffDesignation.objects.exclude(id=pk)
                .filter(designation__iexact=name)
                .exists()
            ):
                raise StaffConflictError("A designation with this name already exists.")
            row.designation = name
        if "is_active" in payload and payload["is_active"] is not None:
            row.is_active = _normalize_active(payload["is_active"])
        row.save()
        return self._to_dict(row)

    def delete(self, pk: int) -> None:
        row = StaffDesignation.objects.filter(id=pk).first()
        if row is None:
            raise StaffNotFoundError("Designation not found.")
        if _normalize_active(row.is_active, "no") == "yes":
            raise StaffValidationError("Deactivate the designation before deleting.")
        if Staff.objects.filter(designation=pk).exists():
            raise StaffValidationError(
                "Cannot delete a designation that is assigned to staff."
            )
        row.delete()

    def _to_dict(self, row: StaffDesignation) -> dict[str, Any]:
        return {
            "id": row.id,
            "designation": row.designation or "",
            "name": row.designation or "",
            "is_active": _normalize_active(row.is_active, "no"),
        }
