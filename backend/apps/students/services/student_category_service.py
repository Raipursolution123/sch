from __future__ import annotations

from typing import Any

from django.db import connection
from django.utils import timezone

from apps.fees.models.feetype import Feetype
from apps.students.domain.student_exceptions import (
    StudentConflictError,
    StudentNotFoundError,
    StudentValidationError,
)
from apps.students.models.students import Students


def _now():
    return timezone.now()


def _today():
    return timezone.now().date()


def _dictfetchall(cursor) -> list[dict[str, Any]]:
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def category_to_dict(row: dict[str, Any]) -> dict[str, Any]:
    created = row.get("created_at")
    created_str = None
    if created is not None:
        created_str = (
            created.strftime("%Y-%m-%dT%H:%M:%SZ")
            if hasattr(created, "strftime")
            else str(created)
        )
    return {
        "id": row.get("id"),
        "name": row.get("category") or "",
        "is_active": row.get("is_active") or "no",
        "created_at": created_str,
    }


class StudentCategoryService:
    def list(self, *, query: str | None = None) -> list[dict[str, Any]]:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM categories ORDER BY category, id")
            rows = _dictfetchall(cursor)
        term = (query or "").strip().lower()
        if term:
            rows = [r for r in rows if term in (r.get("category") or "").lower()]
        return [category_to_dict(r) for r in rows]

    def get(self, pk: int) -> dict[str, Any]:
        row = self._fetch(pk)
        if row is None:
            raise StudentNotFoundError("Student category not found.")
        return category_to_dict(row)

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name", "")).strip()
        if not name:
            raise StudentValidationError("Category name is required.")
        is_active = payload.get("is_active", "yes")
        if is_active not in ("yes", "no"):
            is_active = "yes" if is_active in (1, True, "1", "true", "True") else "no"

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id FROM categories WHERE LOWER(category) = LOWER(%s)", [name]
            )
            if cursor.fetchone():
                raise StudentConflictError("A category with this name already exists.")
            cursor.execute(
                "INSERT INTO categories (category, is_active, created_at) VALUES (%s, %s, %s)",
                [name, is_active, _now()],
            )
            new_id = cursor.lastrowid
        return self.get(new_id)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        if self._fetch(pk) is None:
            raise StudentNotFoundError("Student category not found.")

        with connection.cursor() as cursor:
            updates: list[str] = []
            params: list[Any] = []

            if "name" in payload:
                name = str(payload.get("name", "")).strip()
                if not name:
                    raise StudentValidationError("Category name cannot be empty.")
                cursor.execute(
                    "SELECT id FROM categories WHERE LOWER(category) = LOWER(%s) AND id != %s",
                    [name, pk],
                )
                if cursor.fetchone():
                    raise StudentConflictError(
                        "A category with this name already exists."
                    )
                updates.append("category = %s")
                params.append(name)

            if "is_active" in payload and payload["is_active"] is not None:
                is_active = payload["is_active"]
                if is_active not in ("yes", "no"):
                    is_active = (
                        "yes" if is_active in (1, True, "1", "true", "True") else "no"
                    )
                updates.append("is_active = %s")
                params.append(is_active)

            if updates:
                updates.append("updated_at = %s")
                params.append(_today())
                params.append(pk)
                cursor.execute(
                    f"UPDATE categories SET {', '.join(updates)} WHERE id = %s",
                    params,
                )

        return self.get(pk)

    def delete(self, pk: int) -> None:
        row = self._fetch(pk)
        if row is None:
            raise StudentNotFoundError("Student category not found.")
        if row.get("is_active") == "yes":
            raise StudentValidationError("Deactivate the category before deleting.")
        if Feetype.objects.filter(feecategory_id=pk).exists():
            raise StudentValidationError(
                "Cannot delete a category that has fee types assigned to it."
            )
        name = (row.get("category") or "").strip()
        if name and Students.objects.filter(category_id__iexact=name).exists():
            raise StudentValidationError(
                "Cannot delete a category that is assigned to students."
            )
        if Students.objects.filter(category_id=str(pk)).exists():
            raise StudentValidationError(
                "Cannot delete a category that is assigned to students."
            )
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM categories WHERE id = %s", [pk])

    def _fetch(self, pk: int) -> dict[str, Any] | None:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM categories WHERE id = %s", [pk])
            rows = _dictfetchall(cursor)
            return rows[0] if rows else None
