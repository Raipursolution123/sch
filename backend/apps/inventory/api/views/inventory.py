from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.inventory.api.serializers.inventory import (
    ItemCategoryCreateSerializer,
    ItemCategorySerializer,
    ItemCategoryUpdateSerializer,
    ItemCreateSerializer,
    ItemIssueCreateSerializer,
    ItemIssueReturnSerializer,
    ItemIssueSerializer,
    ItemSerializer,
    ItemStockCreateSerializer,
    ItemStockSerializer,
    ItemStoreCreateSerializer,
    ItemStoreSerializer,
    ItemStoreUpdateSerializer,
    ItemSupplierCreateSerializer,
    ItemSupplierSerializer,
    ItemSupplierUpdateSerializer,
    ItemUpdateSerializer,
)
from apps.inventory.domain.inventory_exceptions import (
    InventoryError,
    InventoryNotFoundError,
)
from apps.inventory.services.item_service import ItemService
from apps.inventory.services.masters_service import (
    ItemCategoryService,
    ItemStoreService,
    ItemSupplierService,
)
from apps.inventory.services.stock_issue_service import (
    ItemIssueService,
    ItemStockService,
)
from common.exceptions.legacy_errors import legacy_domain_error_response
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "inventory"


def inventory_error_response(exc: InventoryError):
    return legacy_domain_error_response(exc, not_found_type=InventoryNotFoundError)


def _paginated(request, view, qs, serializer_cls, message: str):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(qs, request, view=view)
    rows = list(page if page is not None else qs)
    data = serializer_cls(rows, many=True).data
    if page is not None:
        return paginator.get_paginated_response(data)
    return APIResponse.success(data=data, message=message)


class _MasterListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    service_cls = None
    list_serializer = None
    create_serializer = None
    list_message = "Records retrieved successfully."
    create_message = "Record created successfully."

    def get(self, request):
        qs = self.service_cls().list(query=request.query_params.get("q"))
        return _paginated(
            request, self, qs, self.list_serializer, self.list_message
        )

    def post(self, request):
        serializer = self.create_serializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = self.service_cls().create(serializer.validated_data)
            return APIResponse.success(
                data=self.list_serializer(row).data,
                message=self.create_message,
                status_code=status.HTTP_201_CREATED,
            )
        except InventoryError as exc:
            return inventory_error_response(exc)


class _MasterDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    service_cls = None
    list_serializer = None
    update_serializer = None

    def get(self, request, pk):
        try:
            row = self.service_cls().get(pk)
            return APIResponse.success(
                data=self.list_serializer(row).data,
                message="Record retrieved successfully.",
            )
        except InventoryError as exc:
            return inventory_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = self.update_serializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = self.service_cls().update(pk, serializer.validated_data)
            return APIResponse.success(
                data=self.list_serializer(row).data,
                message="Record updated successfully.",
            )
        except InventoryError as exc:
            return inventory_error_response(exc)

    def delete(self, request, pk):
        try:
            self.service_cls().delete(pk)
            return APIResponse.success(message="Record deleted successfully.")
        except InventoryError as exc:
            return inventory_error_response(exc)


class ItemCategoryListCreateView(_MasterListCreateView):
    legacy_permission_category = "item_category"
    service_cls = ItemCategoryService
    list_serializer = ItemCategorySerializer
    create_serializer = ItemCategoryCreateSerializer
    list_message = "Item categories retrieved successfully."
    create_message = "Item category created successfully."


class ItemCategoryDetailView(_MasterDetailView):
    legacy_permission_category = "item_category"
    service_cls = ItemCategoryService
    list_serializer = ItemCategorySerializer
    update_serializer = ItemCategoryUpdateSerializer


class ItemStoreListCreateView(_MasterListCreateView):
    legacy_permission_category = "store"
    service_cls = ItemStoreService
    list_serializer = ItemStoreSerializer
    create_serializer = ItemStoreCreateSerializer
    list_message = "Item stores retrieved successfully."
    create_message = "Item store created successfully."


class ItemStoreDetailView(_MasterDetailView):
    legacy_permission_category = "store"
    service_cls = ItemStoreService
    list_serializer = ItemStoreSerializer
    update_serializer = ItemStoreUpdateSerializer


class ItemSupplierListCreateView(_MasterListCreateView):
    legacy_permission_category = "supplier"
    service_cls = ItemSupplierService
    list_serializer = ItemSupplierSerializer
    create_serializer = ItemSupplierCreateSerializer
    list_message = "Suppliers retrieved successfully."
    create_message = "Supplier created successfully."


class ItemSupplierDetailView(_MasterDetailView):
    legacy_permission_category = "supplier"
    service_cls = ItemSupplierService
    list_serializer = ItemSupplierSerializer
    update_serializer = ItemSupplierUpdateSerializer


class ItemListCreateView(_MasterListCreateView):
    legacy_permission_category = "item"
    service_cls = ItemService
    list_serializer = ItemSerializer
    create_serializer = ItemCreateSerializer
    list_message = "Items retrieved successfully."
    create_message = "Item created successfully."


class ItemDetailView(_MasterDetailView):
    legacy_permission_category = "item"
    service_cls = ItemService
    list_serializer = ItemSerializer
    update_serializer = ItemUpdateSerializer


class ItemStockListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "item_stock"

    def get(self, request):
        qs = ItemStockService().list(query=request.query_params.get("q"))
        return _paginated(
            request,
            self,
            qs,
            ItemStockSerializer,
            "Stock entries retrieved successfully.",
        )

    def post(self, request):
        serializer = ItemStockCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = ItemStockService().create(serializer.validated_data)
            return APIResponse.success(
                data=ItemStockSerializer(row).data,
                message="Stock entry created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except InventoryError as exc:
            return inventory_error_response(exc)


class ItemStockDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "item_stock"

    def delete(self, request, pk):
        try:
            ItemStockService().delete(pk)
            return APIResponse.success(message="Stock entry deleted successfully.")
        except InventoryError as exc:
            return inventory_error_response(exc)


class ItemIssueListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "issue_item"

    def get(self, request):
        status_filter = request.query_params.get("status") or "open"
        try:
            qs = ItemIssueService().list(
                status=status_filter, query=request.query_params.get("q")
            )
        except InventoryError as exc:
            return inventory_error_response(exc)
        return _paginated(
            request,
            self,
            qs,
            ItemIssueSerializer,
            "Item issues retrieved successfully.",
        )

    def post(self, request):
        serializer = ItemIssueCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            issue_by = getattr(request.user, "id", None)
            row = ItemIssueService().issue(
                serializer.validated_data, issue_by=issue_by
            )
            return APIResponse.success(
                data=ItemIssueSerializer(row).data,
                message="Item issued successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except InventoryError as exc:
            return inventory_error_response(exc)


class ItemIssueReturnView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "issue_item"
    legacy_method_actions = {"POST": "can_edit"}

    def post(self, request, pk):
        serializer = ItemIssueReturnSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = ItemIssueService().return_issue(
                pk, return_date=serializer.validated_data.get("return_date")
            )
            return APIResponse.success(
                data=ItemIssueSerializer(row).data,
                message="Item returned successfully.",
            )
        except InventoryError as exc:
            return inventory_error_response(exc)
