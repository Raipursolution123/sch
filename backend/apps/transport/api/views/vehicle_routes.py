from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.transport.api.serializers.vehicle_routes import (
    VehicleRoutesSerializer,
    VehicleRoutesCreateSerializer,
    VehicleRoutesUpdateSerializer,
)
from apps.transport.domain.transport_exceptions import TransportError
from apps.transport.services.vehicle_route_service import VehicleRoutesService
from apps.transport.api.views.transport_fees import transport_error_response
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "transport"
CATEGORY = "assign_vehicle"


class VehicleRoutesListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = VehicleRoutesService()
        qs = service.list_assignments()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)

        data = [service.enrich_assignment(item) for item in rows]

        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(
            data=data, message="Vehicle assignments retrieved successfully."
        )

    def post(self, request):
        serializer = VehicleRoutesCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            service = VehicleRoutesService()
            assignment = service.create_assignment(serializer.validated_data)
            data = service.enrich_assignment(assignment)
            return APIResponse.success(
                data=data,
                message="Vehicle assigned to route successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except TransportError as exc:
            return transport_error_response(exc)


class VehicleRoutesDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            service = VehicleRoutesService()
            assignment = service.get_assignment(pk)
            data = service.enrich_assignment(assignment)
            return APIResponse.success(
                data=data,
                message="Vehicle assignment retrieved successfully.",
            )
        except TransportError as exc:
            return transport_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = VehicleRoutesUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            service = VehicleRoutesService()
            assignment = service.update_assignment(pk, serializer.validated_data)
            data = service.enrich_assignment(assignment)
            return APIResponse.success(
                data=data,
                message="Vehicle assignment updated successfully.",
            )
        except TransportError as exc:
            return transport_error_response(exc)

    def delete(self, request, pk):
        try:
            VehicleRoutesService().delete_assignment(pk)
            return APIResponse.success(message="Vehicle assignment deleted successfully.")
        except TransportError as exc:
            return transport_error_response(exc)
