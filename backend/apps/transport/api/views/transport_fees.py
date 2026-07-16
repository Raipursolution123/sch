from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.transport.api.serializers.transport_fees import (
    TransportFeeMasterSerializer,
    TransportFeeMasterCreateSerializer,
    TransportFeeMasterUpdateSerializer,
)
from apps.transport.domain.transport_exceptions import TransportError, TransportNotFoundError
from apps.transport.services.transport_fee_service import TransportFeeService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "transport"
CATEGORY = "transport_fees"


def transport_error_response(exc: TransportError):
    if isinstance(exc, TransportNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    return APIResponse.error(
        message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
    )


class TransportFeesListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        session_id = request.query_params.get("session_id")
        if session_id:
            try:
                session_id = int(session_id)
            except ValueError:
                session_id = None

        service = TransportFeeService()
        qs = service.list_fees(session_id=session_id)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = TransportFeeMasterSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Transport fees retrieved successfully."
        )

    def post(self, request):
        serializer = TransportFeeMasterCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            fee = TransportFeeService().create_fee(serializer.validated_data)
            response_serializer = TransportFeeMasterSerializer(fee)
            return APIResponse.success(
                data=response_serializer.data,
                message="Transport fee created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except TransportError as exc:
            return transport_error_response(exc)


class TransportFeesDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            fee = TransportFeeService().get_fee(pk)
            serializer = TransportFeeMasterSerializer(fee)
            return APIResponse.success(
                data=serializer.data,
                message="Transport fee retrieved successfully.",
            )
        except TransportError as exc:
            return transport_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = TransportFeeMasterUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            fee = TransportFeeService().update_fee(pk, serializer.validated_data)
            response_serializer = TransportFeeMasterSerializer(fee)
            return APIResponse.success(
                data=response_serializer.data,
                message="Transport fee updated successfully.",
            )
        except TransportError as exc:
            return transport_error_response(exc)

    def delete(self, request, pk):
        try:
            TransportFeeService().delete_fee(pk)
            return APIResponse.success(message="Transport fee deleted successfully.")
        except TransportError as exc:
            return transport_error_response(exc)
