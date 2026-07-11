from typing import Any

from apps.fees.domain.fee_exceptions import (
    FeeConflictError,
    FeeNotFoundError,
    FeeValidationError,
)
from apps.fees.models.feetype import Feetype
from apps.fees.selectors import fee_selectors as selectors


class FeeTypeService:
    def list_types(self):
        return Feetype.objects.all().order_by("type")

    def get_type(self, feetype_id: int) -> dict[str, Any]:
        ft = Feetype.objects.filter(id=feetype_id).first()
        if ft is None:
            raise FeeNotFoundError("Fee type not found.")
        return selectors.fee_type_to_dict(ft, selectors.get_categories_map())

    def create_type(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name", "")).strip()
        code = str(payload.get("code", "")).strip().upper()
        if not name:
            raise FeeValidationError("Fee type name is required.")
        if not code:
            raise FeeValidationError("Fee type code is required.")
        if Feetype.objects.filter(code__iexact=code).exists():
            raise FeeConflictError("A fee type with this code already exists.")

        ft = Feetype.objects.create(
            type=name,
            code=code,
            feecategory_id=payload.get("feecategory_id"),
            description=(
                str(payload.get("description", "")).strip()
                if payload.get("description")
                else None
            ),
            is_active=payload.get("is_active", "no"),
            is_system=0,
            created_at=selectors.now_datetime(),
        )
        return selectors.fee_type_to_dict(ft, selectors.get_categories_map())

    def update_type(self, feetype_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        ft = Feetype.objects.filter(id=feetype_id).first()
        if ft is None:
            raise FeeNotFoundError("Fee type not found.")

        if "code" in payload:
            code = str(payload.get("code", "")).strip().upper()
            if not code:
                raise FeeValidationError("Fee type code cannot be empty.")
            if Feetype.objects.exclude(id=feetype_id).filter(code__iexact=code).exists():
                raise FeeConflictError("A fee type with this code already exists.")
            ft.code = code

        if "name" in payload:
            name = str(payload.get("name", "")).strip()
            if not name:
                raise FeeValidationError("Fee type name cannot be empty.")
            ft.type = name

        if "description" in payload:
            desc = payload.get("description")
            ft.description = str(desc).strip() if desc else None

        if "feecategory_id" in payload:
            ft.feecategory_id = payload["feecategory_id"]

        if "is_active" in payload:
            ft.is_active = payload["is_active"]

        ft.updated_at = selectors.today_date()
        ft.save()
        return selectors.fee_type_to_dict(ft, selectors.get_categories_map())

    def delete_type(self, feetype_id: int) -> None:
        ft = Feetype.objects.filter(id=feetype_id).first()
        if ft is None:
            raise FeeNotFoundError("Fee type not found.")
        if ft.is_active == "yes":
            raise FeeValidationError("Deactivate the fee type before deleting.")
        ft.delete()

    def enrich_list(self, rows) -> list[dict[str, Any]]:
        category_map = selectors.get_categories_map()
        return [selectors.fee_type_to_dict(ft, category_map) for ft in rows]
