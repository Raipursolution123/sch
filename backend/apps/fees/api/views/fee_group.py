from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.views.common import MODULE, fee_error_response
from apps.fees.domain.fee_exceptions import FeeError
from apps.fees.selectors.fee_selectors import fee_group_to_dict
from apps.fees.services.fee_group_service import FeeGroupService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "fees_group"


class FeeGroupsListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        qs = FeeGroupService().list_groups()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else qs
        data = [fee_group_to_dict(group) for group in rows]
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(data=data, message="Fee groups retrieved successfully.")

    def post(self, request):
        try:
            data = FeeGroupService().create_group(request.data)
            return APIResponse.success(
                data=data,
                message="Fee group created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except FeeError as exc:
            return fee_error_response(exc)


class FeeGroupDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=FeeGroupService().get_group(pk),
                message="Fee group retrieved successfully.",
            )
        except FeeError as exc:
            return fee_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            data = FeeGroupService().update_group(pk, request.data)
            return APIResponse.success(
                data=data, message="Fee group updated successfully."
            )
        except FeeError as exc:
            return fee_error_response(exc)

    def delete(self, request, pk):
        try:
            FeeGroupService().delete_group(pk)
            return APIResponse.success(message="Fee group deleted successfully.")
        except FeeError as exc:
            return fee_error_response(exc)
