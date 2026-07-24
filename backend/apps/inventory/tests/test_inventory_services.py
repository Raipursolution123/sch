from unittest.mock import MagicMock, patch

import pytest

from apps.inventory.domain.inventory_exceptions import (
    InventoryConflictError,
    InventoryValidationError,
)
from apps.inventory.services.masters_service import ItemCategoryService
from apps.inventory.services.stock_issue_service import (
    ItemIssueService,
    ItemStockService,
)


def test_category_requires_name():
    with pytest.raises(InventoryValidationError, match="Category name"):
        ItemCategoryService().create({"item_category": "  "})


def test_stock_rejects_bad_symbol():
    with patch(
        "apps.inventory.services.stock_issue_service.ItemService.get",
        return_value=MagicMock(id=1, quantity=5),
    ):
        with pytest.raises(InventoryValidationError, match="symbol"):
            ItemStockService().create(
                {"item_id": 1, "quantity": 1, "symbol": "x", "purchase_price": 0}
            )


def test_stock_rejects_insufficient_on_minus():
    with patch(
        "apps.inventory.services.stock_issue_service.ItemService.get",
        return_value=MagicMock(id=1, quantity=1),
    ):
        with pytest.raises(InventoryConflictError, match="Insufficient"):
            ItemStockService().create(
                {"item_id": 1, "quantity": 5, "symbol": "-", "purchase_price": 0}
            )


def test_issue_list_rejects_bad_status():
    with pytest.raises(InventoryValidationError, match="status must be"):
        ItemIssueService().list(status="nope")


def test_return_rejects_already_returned():
    service = ItemIssueService()
    with patch.object(
        service, "get", return_value=MagicMock(is_returned=1, item_id=1)
    ):
        with pytest.raises(InventoryConflictError, match="already returned"):
            service.return_issue(1)
