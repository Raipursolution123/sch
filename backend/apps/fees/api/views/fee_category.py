from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.views.common import MODULE, fee_error_response
from apps.fees.domain.fee_exceptions import FeeError
from apps.fees.services.fee_category_service import FeeCategoryService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "fees_type"


class FeeCategoriesListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        rows = FeeCategoryService().list_categories()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(rows, request, view=self)
        current = page if page is not None else rows
        from apps.fees.selectors.fee_selectors import category_to_dict

        data = [category_to_dict(row) for row in current]
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(
            data=data, message="Fee categories retrieved successfully."
        )

    def post(self, request):
        try:
            data = FeeCategoryService().create_category(request.data)
            return APIResponse.success(
                data=data,
                message="Fee category created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except FeeError as exc:
            return fee_error_response(exc)


class FeeCategoryDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=FeeCategoryService().get_category(pk),
                message="Fee category retrieved successfully.",
            )
        except FeeError as exc:
            return fee_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            data = FeeCategoryService().update_category(pk, request.data)
            return APIResponse.success(
                data=data, message="Fee category updated successfully."
            )
        except FeeError as exc:
            return fee_error_response(exc)

    def delete(self, request, pk):
        try:
            FeeCategoryService().delete_category(pk)
            return APIResponse.success(message="Fee category deleted successfully.")
        except FeeError as exc:
            return fee_error_response(exc)
