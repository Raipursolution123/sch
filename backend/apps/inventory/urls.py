from django.urls import path

from apps.inventory.api.views.inventory import (
    ItemCategoryDetailView,
    ItemCategoryListCreateView,
    ItemDetailView,
    ItemIssueListCreateView,
    ItemIssueReturnView,
    ItemListCreateView,
    ItemStockDetailView,
    ItemStockListCreateView,
    ItemStoreDetailView,
    ItemStoreListCreateView,
    ItemSupplierDetailView,
    ItemSupplierListCreateView,
)

urlpatterns = [
    path(
        "categories/",
        ItemCategoryListCreateView.as_view(),
        name="inventory-categories-list-create",
    ),
    path(
        "categories/<int:pk>/",
        ItemCategoryDetailView.as_view(),
        name="inventory-categories-detail",
    ),
    path(
        "stores/",
        ItemStoreListCreateView.as_view(),
        name="inventory-stores-list-create",
    ),
    path(
        "stores/<int:pk>/",
        ItemStoreDetailView.as_view(),
        name="inventory-stores-detail",
    ),
    path(
        "suppliers/",
        ItemSupplierListCreateView.as_view(),
        name="inventory-suppliers-list-create",
    ),
    path(
        "suppliers/<int:pk>/",
        ItemSupplierDetailView.as_view(),
        name="inventory-suppliers-detail",
    ),
    path("items/", ItemListCreateView.as_view(), name="inventory-items-list-create"),
    path(
        "items/<int:pk>/", ItemDetailView.as_view(), name="inventory-items-detail"
    ),
    path(
        "stock/",
        ItemStockListCreateView.as_view(),
        name="inventory-stock-list-create",
    ),
    path(
        "stock/<int:pk>/",
        ItemStockDetailView.as_view(),
        name="inventory-stock-detail",
    ),
    path(
        "issues/",
        ItemIssueListCreateView.as_view(),
        name="inventory-issues-list-create",
    ),
    path(
        "issues/<int:pk>/return/",
        ItemIssueReturnView.as_view(),
        name="inventory-issues-return",
    ),
]
