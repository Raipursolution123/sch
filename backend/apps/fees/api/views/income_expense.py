from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.serializers.income_expense import (
    ExpenseCreateSerializer,
    ExpenseHeadCreateSerializer,
    ExpenseHeadSerializer,
    ExpenseHeadUpdateSerializer,
    ExpenseSerializer,
    ExpenseUpdateSerializer,
    IncomeCreateSerializer,
    IncomeHeadCreateSerializer,
    IncomeHeadSerializer,
    IncomeHeadUpdateSerializer,
    IncomeSerializer,
    IncomeUpdateSerializer,
)
from apps.fees.api.views.common import fee_error_response
from apps.fees.domain.fee_exceptions import FeeError
from apps.fees.services.income_expense_service import (
    ExpenseHeadService,
    ExpenseService,
    IncomeHeadService,
    IncomeService,
)
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


def _paginated(request, view, qs, serializer_cls, message: str):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(qs, request, view=view)
    rows = list(page if page is not None else qs)
    data = serializer_cls(rows, many=True).data
    if page is not None:
        return paginator.get_paginated_response(data)
    return APIResponse.success(data=data, message=message)


class _CrudListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    service_cls = None
    list_serializer = None
    create_serializer = None
    list_message = "Records retrieved successfully."
    create_message = "Record created successfully."

    def get(self, request):
        qs = self.service_cls().list(query=request.query_params.get("q"))
        return _paginated(request, self, qs, self.list_serializer, self.list_message)

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
        except FeeError as exc:
            return fee_error_response(exc)


class _CrudDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
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
        except FeeError as exc:
            return fee_error_response(exc)

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
        except FeeError as exc:
            return fee_error_response(exc)

    def delete(self, request, pk):
        try:
            self.service_cls().delete(pk)
            return APIResponse.success(message="Record deleted successfully.")
        except FeeError as exc:
            return fee_error_response(exc)


class IncomeHeadListCreateView(_CrudListCreateView):
    legacy_module_short_code = "income"
    legacy_permission_category = "income_head"
    service_cls = IncomeHeadService
    list_serializer = IncomeHeadSerializer
    create_serializer = IncomeHeadCreateSerializer
    list_message = "Income heads retrieved successfully."
    create_message = "Income head created successfully."


class IncomeHeadDetailView(_CrudDetailView):
    legacy_module_short_code = "income"
    legacy_permission_category = "income_head"
    service_cls = IncomeHeadService
    list_serializer = IncomeHeadSerializer
    update_serializer = IncomeHeadUpdateSerializer


class IncomeListCreateView(_CrudListCreateView):
    legacy_module_short_code = "income"
    legacy_permission_category = "income"
    service_cls = IncomeService
    list_serializer = IncomeSerializer
    create_serializer = IncomeCreateSerializer
    list_message = "Income records retrieved successfully."
    create_message = "Income record created successfully."


class IncomeDetailView(_CrudDetailView):
    legacy_module_short_code = "income"
    legacy_permission_category = "income"
    service_cls = IncomeService
    list_serializer = IncomeSerializer
    update_serializer = IncomeUpdateSerializer


class ExpenseHeadListCreateView(_CrudListCreateView):
    legacy_module_short_code = "expense"
    legacy_permission_category = "expense_head"
    service_cls = ExpenseHeadService
    list_serializer = ExpenseHeadSerializer
    create_serializer = ExpenseHeadCreateSerializer
    list_message = "Expense heads retrieved successfully."
    create_message = "Expense head created successfully."


class ExpenseHeadDetailView(_CrudDetailView):
    legacy_module_short_code = "expense"
    legacy_permission_category = "expense_head"
    service_cls = ExpenseHeadService
    list_serializer = ExpenseHeadSerializer
    update_serializer = ExpenseHeadUpdateSerializer


class ExpenseListCreateView(_CrudListCreateView):
    legacy_module_short_code = "expense"
    legacy_permission_category = "expense"
    service_cls = ExpenseService
    list_serializer = ExpenseSerializer
    create_serializer = ExpenseCreateSerializer
    list_message = "Expense records retrieved successfully."
    create_message = "Expense record created successfully."


class ExpenseDetailView(_CrudDetailView):
    legacy_module_short_code = "expense"
    legacy_permission_category = "expense"
    service_cls = ExpenseService
    list_serializer = ExpenseSerializer
    update_serializer = ExpenseUpdateSerializer
