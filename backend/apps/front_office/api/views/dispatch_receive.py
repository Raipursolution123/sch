from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.front_office.api.serializers.dispatch_receive import (
    DispatchReceiveSerializer,
    DispatchReceiveCreateSerializer,
    DispatchReceiveUpdateSerializer,
)
from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeError,
    FrontOfficeNotFoundError,
)
from apps.front_office.services.dispatch_receive_service import DispatchReceiveService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "front_office"
CATEGORY = "postal_dispatch"


def front_office_error_response(exc: FrontOfficeError):
    if isinstance(exc, FrontOfficeNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    return APIResponse.error(
        message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
    )


class DispatchReceiveListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = DispatchReceiveService()
        qs = service.list_dispatches()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = DispatchReceiveSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Postal records retrieved successfully."
        )

    def post(self, request):
        serializer = DispatchReceiveCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            record = DispatchReceiveService().create_dispatch(serializer.validated_data)
            response_serializer = DispatchReceiveSerializer(record)
            return APIResponse.success(
                data=response_serializer.data,
                message="Postal record created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)


class DispatchReceiveDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            record = DispatchReceiveService().get_dispatch(pk)
            serializer = DispatchReceiveSerializer(record)
            return APIResponse.success(
                data=serializer.data, message="Postal record retrieved successfully."
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = DispatchReceiveUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            record = DispatchReceiveService().update_dispatch(pk, serializer.validated_data)
            response_serializer = DispatchReceiveSerializer(record)
            return APIResponse.success(
                data=response_serializer.data,
                message="Postal record updated successfully.",
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def delete(self, request, pk):
        try:
            DispatchReceiveService().delete_dispatch(pk)
            return APIResponse.success(message="Postal record deleted successfully.")
        except FrontOfficeError as exc:
            return front_office_error_response(exc)
