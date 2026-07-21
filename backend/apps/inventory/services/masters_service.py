from __future__ import annotations

from typing import Any

from django.db.models import Q
from django.utils import timezone

from apps.inventory.domain.inventory_exceptions import (
    InventoryNotFoundError,
    InventoryValidationError,
)
from apps.inventory.models.item_category import ItemCategory
from apps.inventory.models.item_store import ItemStore
from apps.inventory.models.item_supplier import ItemSupplier


class ItemCategoryService:
    def list(self, *, query: str | None = None):
        qs = ItemCategory.objects.all().order_by("item_category", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(item_category__icontains=term) | Q(description__icontains=term)
            )
        return qs

    def get(self, pk: int) -> ItemCategory:
        row = ItemCategory.objects.filter(id=pk).first()
        if row is None:
            raise InventoryNotFoundError("Item category not found.")
        return row

    def create(self, payload: dict[str, Any]) -> ItemCategory:
        name = str(payload.get("item_category", "")).strip()
        if not name:
            raise InventoryValidationError("Category name is required.")
        return ItemCategory.objects.create(
            item_category=name,
            description=str(payload.get("description", "")).strip(),
            is_active=str(payload.get("is_active") or "yes").strip() or "yes",
            created_at=timezone.now(),
            updated_at=timezone.now().date(),
        )

    def update(self, pk: int, payload: dict[str, Any]) -> ItemCategory:
        row = self.get(pk)
        if "item_category" in payload:
            name = str(payload["item_category"]).strip()
            if not name:
                raise InventoryValidationError("Category name cannot be empty.")
            row.item_category = name
        if "description" in payload:
            row.description = str(payload["description"]).strip()
        if "is_active" in payload:
            row.is_active = str(payload["is_active"]).strip() or "yes"
        row.updated_at = timezone.now().date()
        row.save()
        return row

    def delete(self, pk: int) -> None:
        self.get(pk).delete()


class ItemStoreService:
    def list(self, *, query: str | None = None):
        qs = ItemStore.objects.all().order_by("item_store", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(item_store__icontains=term)
                | Q(code__icontains=term)
                | Q(description__icontains=term)
            )
        return qs

    def get(self, pk: int) -> ItemStore:
        row = ItemStore.objects.filter(id=pk).first()
        if row is None:
            raise InventoryNotFoundError("Item store not found.")
        return row

    def create(self, payload: dict[str, Any]) -> ItemStore:
        name = str(payload.get("item_store", "")).strip()
        code = str(payload.get("code", "")).strip()
        if not name:
            raise InventoryValidationError("Store name is required.")
        if not code:
            raise InventoryValidationError("Store code is required.")
        return ItemStore.objects.create(
            item_store=name,
            code=code,
            description=str(payload.get("description", "")).strip(),
            created_at=timezone.now(),
        )

    def update(self, pk: int, payload: dict[str, Any]) -> ItemStore:
        row = self.get(pk)
        if "item_store" in payload:
            name = str(payload["item_store"]).strip()
            if not name:
                raise InventoryValidationError("Store name cannot be empty.")
            row.item_store = name
        if "code" in payload:
            code = str(payload["code"]).strip()
            if not code:
                raise InventoryValidationError("Store code cannot be empty.")
            row.code = code
        if "description" in payload:
            row.description = str(payload["description"]).strip()
        row.save()
        return row

    def delete(self, pk: int) -> None:
        self.get(pk).delete()


class ItemSupplierService:
    def list(self, *, query: str | None = None):
        qs = ItemSupplier.objects.all().order_by("item_supplier", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(item_supplier__icontains=term)
                | Q(phone__icontains=term)
                | Q(email__icontains=term)
                | Q(contact_person_name__icontains=term)
            )
        return qs

    def get(self, pk: int) -> ItemSupplier:
        row = ItemSupplier.objects.filter(id=pk).first()
        if row is None:
            raise InventoryNotFoundError("Supplier not found.")
        return row

    def create(self, payload: dict[str, Any]) -> ItemSupplier:
        name = str(payload.get("item_supplier", "")).strip()
        if not name:
            raise InventoryValidationError("Supplier name is required.")
        return ItemSupplier.objects.create(
            item_supplier=name,
            phone=str(payload.get("phone", "")).strip(),
            email=str(payload.get("email", "")).strip(),
            address=str(payload.get("address", "")).strip(),
            contact_person_name=str(payload.get("contact_person_name", "")).strip(),
            contact_person_phone=str(payload.get("contact_person_phone", "")).strip(),
            contact_person_email=str(payload.get("contact_person_email", "")).strip(),
            description=str(payload.get("description", "")).strip(),
        )

    def update(self, pk: int, payload: dict[str, Any]) -> ItemSupplier:
        row = self.get(pk)
        if "item_supplier" in payload:
            name = str(payload["item_supplier"]).strip()
            if not name:
                raise InventoryValidationError("Supplier name cannot be empty.")
            row.item_supplier = name
        for field in (
            "phone",
            "email",
            "address",
            "contact_person_name",
            "contact_person_phone",
            "contact_person_email",
            "description",
        ):
            if field in payload:
                setattr(row, field, str(payload[field]).strip())
        row.save()
        return row

    def delete(self, pk: int) -> None:
        self.get(pk).delete()
