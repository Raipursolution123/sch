from typing import Any

from django.db import connection

from apps.fees.domain.fee_exceptions import (
    FeeConflictError,
    FeeNotFoundError,
    FeeValidationError,
)
from apps.fees.models.feetype import Feetype
from apps.fees.selectors import fee_selectors as selectors


class FeeCategoryService:
    def list_categories(self):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM categories ORDER BY category")
            return selectors.dictfetchall(cursor)

    def get_category(self, category_id: int) -> dict[str, Any]:
        row = self._fetch_category(category_id)
        if row is None:
            raise FeeNotFoundError("Fee category not found.")
        return selectors.category_to_dict(row)

    def create_category(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name", "")).strip()
        if not name:
            raise FeeValidationError("Category name is required.")

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id FROM categories WHERE LOWER(category) = LOWER(%s)", [name]
            )
            if cursor.fetchone():
                raise FeeConflictError("A category with this name already exists.")

            is_active = payload.get("is_active", "no")
            cursor.execute(
                "INSERT INTO categories (category, is_active, created_at) VALUES (%s, %s, %s)",
                [name, is_active, selectors.now_datetime()],
            )
            new_id = cursor.lastrowid
            cursor.execute("SELECT * FROM categories WHERE id = %s", [new_id])
            return selectors.category_to_dict(selectors.dictfetchall(cursor)[0])

    def update_category(
        self, category_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM categories WHERE id = %s", [category_id])
            rows = selectors.dictfetchall(cursor)
            if not rows:
                raise FeeNotFoundError("Fee category not found.")

            updates: list[str] = []
            params: list[Any] = []

            if "name" in payload:
                name = str(payload.get("name", "")).strip()
                if not name:
                    raise FeeValidationError("Category name cannot be empty.")
                cursor.execute(
                    "SELECT id FROM categories WHERE LOWER(category) = LOWER(%s) AND id != %s",
                    [name, category_id],
                )
                if cursor.fetchone():
                    raise FeeConflictError("A category with this name already exists.")
                updates.append("category = %s")
                params.append(name)

            if "is_active" in payload:
                updates.append("is_active = %s")
                params.append(payload["is_active"])

            if updates:
                updates.append("updated_at = %s")
                params.append(selectors.today_date())
                params.append(category_id)
                query = f"UPDATE categories SET {', '.join(updates)} WHERE id = %s"
                cursor.execute(query, params)

            cursor.execute("SELECT * FROM categories WHERE id = %s", [category_id])
            return selectors.category_to_dict(selectors.dictfetchall(cursor)[0])

    def delete_category(self, category_id: int) -> None:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM categories WHERE id = %s", [category_id])
            rows = selectors.dictfetchall(cursor)
            if not rows:
                raise FeeNotFoundError("Fee category not found.")

            cat = rows[0]
            if cat.get("is_active") == "yes":
                raise FeeValidationError("Deactivate the category before deleting.")

            if Feetype.objects.filter(feecategory_id=category_id).exists():
                raise FeeValidationError(
                    "Cannot delete a category that has fee types assigned to it."
                )

            cursor.execute("DELETE FROM categories WHERE id = %s", [category_id])

    def _fetch_category(self, category_id: int) -> dict[str, Any] | None:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM categories WHERE id = %s", [category_id])
            rows = selectors.dictfetchall(cursor)
            return rows[0] if rows else None
