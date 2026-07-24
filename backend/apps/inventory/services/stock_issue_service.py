from __future__ import annotations

from typing import Any

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.inventory.domain.inventory_exceptions import (
    InventoryConflictError,
    InventoryNotFoundError,
    InventoryValidationError,
)
from apps.inventory.models.item import Item
from apps.inventory.models.item_issue import ItemIssue
from apps.inventory.models.item_stock import ItemStock
from apps.inventory.models.item_store import ItemStore
from apps.inventory.models.item_supplier import ItemSupplier
from apps.inventory.services.item_service import ItemService


class ItemStockService:
    def list(self, *, query: str | None = None):
        qs = ItemStock.objects.all().order_by("-id")
        term = (query or "").strip()
        if not term:
            return qs
        item_ids = list(
            Item.objects.filter(name__icontains=term).values_list("id", flat=True)[:50]
        )
        return qs.filter(Q(description__icontains=term) | Q(item_id__in=item_ids))

    def get(self, pk: int) -> ItemStock:
        row = ItemStock.objects.filter(id=pk).first()
        if row is None:
            raise InventoryNotFoundError("Stock entry not found.")
        return row

    def create(self, payload: dict[str, Any]) -> ItemStock:
        item_id = payload.get("item_id")
        if not item_id:
            raise InventoryValidationError("item_id is required.")
        item = ItemService().get(int(item_id))

        qty = int(payload.get("quantity") or 0)
        if qty < 1:
            raise InventoryValidationError("Quantity must be at least 1.")

        symbol = str(payload.get("symbol") or "+").strip() or "+"
        if symbol not in {"+", "-"}:
            raise InventoryValidationError("symbol must be + or -.")

        store_id = payload.get("store_id")
        supplier_id = payload.get("supplier_id")
        if store_id is not None and not ItemStore.objects.filter(id=store_id).exists():
            raise InventoryValidationError("Store not found.")
        if supplier_id is not None and not ItemSupplier.objects.filter(
            id=supplier_id
        ).exists():
            raise InventoryValidationError("Supplier not found.")

        purchase_price = float(payload.get("purchase_price") or 0)
        if purchase_price < 0:
            raise InventoryValidationError("Purchase price cannot be negative.")

        if symbol == "-" and int(item.quantity or 0) < qty:
            raise InventoryConflictError("Insufficient item quantity.")

        with transaction.atomic():
            if symbol == "+":
                item.quantity = int(item.quantity or 0) + qty
            else:
                item.quantity = int(item.quantity or 0) - qty
            item.updated_at = timezone.now().date()
            item.save(update_fields=["quantity", "updated_at"])

            return ItemStock.objects.create(
                item_id=item.id,
                supplier_id=supplier_id,
                store_id=store_id,
                symbol=symbol,
                quantity=qty,
                purchase_price=purchase_price,
                date=payload.get("date") or timezone.now().date(),
                attachment=str(payload.get("attachment", "")).strip() or None,
                description=str(payload.get("description", "")).strip(),
                is_active=str(payload.get("is_active") or "yes").strip() or "yes",
                created_at=timezone.now(),
            )

    def delete(self, pk: int) -> None:
        row = self.get(pk)
        with transaction.atomic():
            if row.item_id and row.quantity:
                item = Item.objects.filter(id=row.item_id).first()
                if item is not None:
                    qty = int(row.quantity or 0)
                    symbol = str(row.symbol or "+")
                    if symbol == "+":
                        if int(item.quantity or 0) < qty:
                            raise InventoryConflictError(
                                "Cannot delete stock: would make quantity negative."
                            )
                        item.quantity = int(item.quantity or 0) - qty
                    else:
                        item.quantity = int(item.quantity or 0) + qty
                    item.updated_at = timezone.now().date()
                    item.save(update_fields=["quantity", "updated_at"])
            row.delete()


class ItemIssueService:
    """is_returned: 0 = open, 1 = returned (explicit; ignore model default)."""

    def list(self, *, status: str | None = None, query: str | None = None):
        if status and status not in {"open", "returned", "all", None, ""}:
            raise InventoryValidationError("status must be open, returned, or all.")
        qs = ItemIssue.objects.all().order_by("-id")
        if status == "open":
            qs = qs.filter(is_returned=0)
        elif status == "returned":
            qs = qs.exclude(is_returned=0)
        term = (query or "").strip()
        if term:
            qs = qs.filter(Q(note__icontains=term) | Q(issue_category__icontains=term))
        return qs

    def get(self, pk: int) -> ItemIssue:
        row = ItemIssue.objects.filter(id=pk).first()
        if row is None:
            raise InventoryNotFoundError("Item issue not found.")
        return row

    def issue(self, payload: dict[str, Any], *, issue_by: int | None = None) -> ItemIssue:
        item_id = payload.get("item_id")
        if not item_id:
            raise InventoryValidationError("item_id is required.")
        item = ItemService().get(int(item_id))

        qty = int(payload.get("quantity") or 0)
        if qty < 1:
            raise InventoryValidationError("Quantity must be at least 1.")
        if int(item.quantity or 0) < qty:
            raise InventoryConflictError("Insufficient item quantity.")

        issue_to = payload.get("issue_to")
        if not issue_to:
            raise InventoryValidationError("issue_to is required.")

        with transaction.atomic():
            item.quantity = int(item.quantity or 0) - qty
            item.updated_at = timezone.now().date()
            item.save(update_fields=["quantity", "updated_at"])

            return ItemIssue.objects.create(
                issue_type=str(payload.get("issue_type", "")).strip() or "staff",
                issue_to=int(issue_to),
                issue_by=issue_by or payload.get("issue_by"),
                issue_date=payload.get("issue_date") or timezone.now().date(),
                return_date=None,
                item_category_id=payload.get("item_category_id")
                or item.item_category_id,
                item_id=item.id,
                quantity=qty,
                issue_category=str(payload.get("issue_category", "")).strip()
                or "issue",
                note=str(payload.get("note", "")).strip(),
                is_returned=0,
                created_at=timezone.now(),
                is_active="yes",
            )

    def return_issue(self, pk: int, *, return_date=None) -> ItemIssue:
        row = self.get(pk)
        if int(row.is_returned or 0) != 0:
            raise InventoryConflictError("Item is already returned.")
        if not row.item_id:
            raise InventoryValidationError("Issue has no linked item.")

        item = ItemService().get(int(row.item_id))
        with transaction.atomic():
            item.quantity = int(item.quantity or 0) + int(row.quantity or 0)
            item.updated_at = timezone.now().date()
            item.save(update_fields=["quantity", "updated_at"])

            row.is_returned = 1
            row.return_date = return_date or timezone.now().date()
            row.save(update_fields=["is_returned", "return_date"])
        return row
