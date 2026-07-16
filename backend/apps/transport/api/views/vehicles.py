from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.transport.api.serializers.vehicles import (
    VehiclesSerializer,
    VehiclesCreateSerializer,
    VehiclesUpdateSerializer,
)
from apps.transport.domain.transport_exceptions import TransportError
from apps.transport.services.vehicle_service import VehiclesService
from apps.transport.api.views.transport_fees import transport_error_response
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "transport"
CATEGORY = "vehicle"


class VehiclesListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = VehiclesService()
        qs = service.list_vehicles()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = VehiclesSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Vehicles retrieved successfully."
        )

    def post(self, request):
        serializer = VehiclesCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            vehicle = VehiclesService().create_vehicle(serializer.validated_data)
            response_serializer = VehiclesSerializer(vehicle)
            return APIResponse.success(
                data=response_serializer.data,
                message="Vehicle created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except TransportError as exc:
            return transport_error_response(exc)


class VehiclesDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            vehicle = VehiclesService().get_vehicle(pk)
            serializer = VehiclesSerializer(vehicle)
            return APIResponse.success(
                data=serializer.data,
                message="Vehicle retrieved successfully.",
            )
        except TransportError as exc:
            return transport_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = VehiclesUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            vehicle = VehiclesService().update_vehicle(pk, serializer.validated_data)
            response_serializer = VehiclesSerializer(vehicle)
            return APIResponse.success(
                data=response_serializer.data,
                message="Vehicle updated successfully.",
            )
        except TransportError as exc:
            return transport_error_response(exc)

    def delete(self, request, pk):
        try:
            VehiclesService().delete_vehicle(pk)
            return APIResponse.success(message="Vehicle deleted successfully.")
        except TransportError as exc:
            return transport_error_response(exc)
