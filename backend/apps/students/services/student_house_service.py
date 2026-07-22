from __future__ import annotations

from typing import Any

from django.db.models import Q

from apps.settings.models.school_houses import SchoolHouses
from apps.students.domain.student_exceptions import (
    StudentConflictError,
    StudentNotFoundError,
    StudentValidationError,
)
from apps.students.models.students import Students


def house_to_dict(row: SchoolHouses) -> dict[str, Any]:
    return {
        "id": row.id,
        "house_name": row.house_name or "",
        "description": row.description or "",
        "house_incharge": row.house_incharge,
        "house_president": row.house_president,
        "is_active": row.is_active or "no",
    }


class StudentHouseService:
    def list(self, *, query: str | None = None):
        qs = SchoolHouses.objects.all().order_by("house_name", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(house_name__icontains=term) | Q(description__icontains=term)
            )
        return qs

    def get(self, pk: int) -> SchoolHouses:
        row = SchoolHouses.objects.filter(id=pk).first()
        if row is None:
            raise StudentNotFoundError("Student house not found.")
        return row

    def create(self, payload: dict[str, Any]) -> SchoolHouses:
        name = str(payload.get("house_name", "")).strip()
        if not name:
            raise StudentValidationError("House name is required.")
        if SchoolHouses.objects.filter(house_name__iexact=name).exists():
            raise StudentConflictError("A house with this name already exists.")

        is_active = payload.get("is_active", "yes")
        if is_active not in ("yes", "no"):
            is_active = "yes" if is_active in (1, True, "1", "true", "True") else "no"

        return SchoolHouses.objects.create(
            house_name=name,
            description=str(payload.get("description", "") or "").strip(),
            house_incharge=payload.get("house_incharge"),
            house_president=payload.get("house_president"),
            is_active=is_active,
        )

    def update(self, pk: int, payload: dict[str, Any]) -> SchoolHouses:
        row = self.get(pk)
        if "house_name" in payload:
            name = str(payload.get("house_name", "")).strip()
            if not name:
                raise StudentValidationError("House name cannot be empty.")
            if (
                SchoolHouses.objects.exclude(id=pk)
                .filter(house_name__iexact=name)
                .exists()
            ):
                raise StudentConflictError("A house with this name already exists.")
            row.house_name = name
        if "description" in payload:
            row.description = str(payload.get("description") or "").strip()
        if "house_incharge" in payload:
            row.house_incharge = payload.get("house_incharge")
        if "house_president" in payload:
            row.house_president = payload.get("house_president")
        if "is_active" in payload and payload["is_active"] is not None:
            is_active = payload["is_active"]
            if is_active not in ("yes", "no"):
                is_active = (
                    "yes" if is_active in (1, True, "1", "true", "True") else "no"
                )
            row.is_active = is_active
        row.save()
        return row

    def delete(self, pk: int) -> None:
        row = self.get(pk)
        if (row.is_active or "").lower() == "yes":
            raise StudentValidationError("Deactivate the house before deleting.")
        if Students.objects.filter(school_house_id=pk).exists():
            raise StudentValidationError(
                "Cannot delete a house that is assigned to students."
            )
        row.delete()
