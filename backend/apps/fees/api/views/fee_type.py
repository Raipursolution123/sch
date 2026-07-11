from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.views.common import MODULE, fee_error_response
from apps.fees.domain.fee_exceptions import FeeError
from apps.fees.services.fee_type_service import FeeTypeService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "fees_type"


class FeeTypesListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = FeeTypeService()
        qs = service.list_types()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        data = service.enrich_list(rows)
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(data=data, message="Fee types retrieved successfully.")

    def post(self, request):
        try:
            data = FeeTypeService().create_type(request.data)
            return APIResponse.success(
                data=data,
                message="Fee type created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except FeeError as exc:
            return fee_error_response(exc)


class FeeTypeDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=FeeTypeService().get_type(pk),
                message="Fee type retrieved successfully.",
            )
        except FeeError as exc:
            return fee_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            data = FeeTypeService().update_type(pk, request.data)
            return APIResponse.success(
                data=data, message="Fee type updated successfully."
            )
        except FeeError as exc:
            return fee_error_response(exc)

    def delete(self, request, pk):
        try:
            FeeTypeService().delete_type(pk)
            return APIResponse.success(message="Fee type deleted successfully.")
        except FeeError as exc:
            return fee_error_response(exc)
