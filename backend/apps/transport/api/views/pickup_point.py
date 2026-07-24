from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.transport.api.serializers.pickup_point import (
    PickupPointSerializer,
    PickupPointCreateSerializer,
    PickupPointUpdateSerializer,
)
from apps.transport.domain.transport_exceptions import TransportError
from apps.transport.services.pickup_point_service import PickupPointService
from apps.transport.api.views.transport_fees import transport_error_response
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "transport"
CATEGORY = "pickup_point"


class PickupPointListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = PickupPointService()
        qs = service.list_pickup_points()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = PickupPointSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Pickup points retrieved successfully."
        )

    def post(self, request):
        serializer = PickupPointCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            point = PickupPointService().create_pickup_point(serializer.validated_data)
            response_serializer = PickupPointSerializer(point)
            return APIResponse.success(
                data=response_serializer.data,
                message="Pickup point created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except TransportError as exc:
            return transport_error_response(exc)


class PickupPointDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            point = PickupPointService().get_pickup_point(pk)
            serializer = PickupPointSerializer(point)
            return APIResponse.success(
                data=serializer.data,
                message="Pickup point retrieved successfully.",
            )
        except TransportError as exc:
            return transport_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = PickupPointUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            point = PickupPointService().update_pickup_point(pk, serializer.validated_data)
            response_serializer = PickupPointSerializer(point)
            return APIResponse.success(
                data=response_serializer.data,
                message="Pickup point updated successfully.",
            )
        except TransportError as exc:
            return transport_error_response(exc)

    def delete(self, request, pk):
        try:
            PickupPointService().delete_pickup_point(pk)
            return APIResponse.success(message="Pickup point deleted successfully.")
        except TransportError as exc:
            return transport_error_response(exc)
