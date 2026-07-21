from __future__ import annotations

from typing import Any

from django.db.models import Q
from django.utils import timezone

from apps.inventory.domain.inventory_exceptions import (
    InventoryNotFoundError,
    InventoryValidationError,
)
from apps.inventory.models.item import Item
from apps.inventory.models.item_category import ItemCategory
from apps.inventory.models.item_store import ItemStore
from apps.inventory.models.item_supplier import ItemSupplier


class ItemService:
    def list(self, *, query: str | None = None):
        qs = Item.objects.all().order_by("name", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(name__icontains=term)
                | Q(unit__icontains=term)
                | Q(description__icontains=term)
            )
        return qs

    def get(self, pk: int) -> Item:
        row = Item.objects.filter(id=pk).first()
        if row is None:
            raise InventoryNotFoundError("Item not found.")
        return row

    def create(self, payload: dict[str, Any]) -> Item:
        name = str(payload.get("name", "")).strip()
        unit = str(payload.get("unit", "")).strip()
        if not name:
            raise InventoryValidationError("Item name is required.")
        if not unit:
            raise InventoryValidationError("Unit is required.")

        category_id = payload.get("item_category_id")
        store_id = payload.get("item_store_id")
        supplier_id = payload.get("item_supplier_id")
        self._validate_refs(category_id, store_id, supplier_id)

        qty = int(payload.get("quantity") or 0)
        if qty < 0:
            raise InventoryValidationError("Quantity cannot be negative.")

        return Item.objects.create(
            name=name,
            unit=unit,
            item_category_id=category_id,
            item_store_id=store_id,
            item_supplier_id=supplier_id,
            item_photo=str(payload.get("item_photo", "")).strip() or None,
            description=str(payload.get("description", "")).strip(),
            quantity=qty,
            date=payload.get("date") or timezone.now().date(),
            created_at=timezone.now(),
            updated_at=timezone.now().date(),
        )

    def update(self, pk: int, payload: dict[str, Any]) -> Item:
        row = self.get(pk)
        if "name" in payload:
            name = str(payload["name"]).strip()
            if not name:
                raise InventoryValidationError("Item name cannot be empty.")
            row.name = name
        if "unit" in payload:
            unit = str(payload["unit"]).strip()
            if not unit:
                raise InventoryValidationError("Unit cannot be empty.")
            row.unit = unit
        if "item_category_id" in payload:
            self._validate_refs(payload["item_category_id"], None, None)
            row.item_category_id = payload["item_category_id"]
        if "item_store_id" in payload:
            self._validate_refs(None, payload["item_store_id"], None)
            row.item_store_id = payload["item_store_id"]
        if "item_supplier_id" in payload:
            self._validate_refs(None, None, payload["item_supplier_id"])
            row.item_supplier_id = payload["item_supplier_id"]
        if "item_photo" in payload:
            row.item_photo = str(payload["item_photo"] or "").strip() or None
        if "description" in payload:
            row.description = str(payload["description"]).strip()
        if "quantity" in payload:
            qty = int(payload["quantity"] or 0)
            if qty < 0:
                raise InventoryValidationError("Quantity cannot be negative.")
            row.quantity = qty
        if "date" in payload:
            row.date = payload["date"]
        row.updated_at = timezone.now().date()
        row.save()
        return row

    def delete(self, pk: int) -> None:
        self.get(pk).delete()

    @staticmethod
    def _validate_refs(category_id, store_id, supplier_id) -> None:
        if category_id is not None and not ItemCategory.objects.filter(
            id=category_id
        ).exists():
            raise InventoryValidationError("Item category not found.")
        if store_id is not None and not ItemStore.objects.filter(id=store_id).exists():
            raise InventoryValidationError("Item store not found.")
        if supplier_id is not None and not ItemSupplier.objects.filter(
            id=supplier_id
        ).exists():
            raise InventoryValidationError("Supplier not found.")
