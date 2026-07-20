from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.transport.api.serializers.route_pickup_point import (
    RoutePickupPointSerializer,
    RoutePickupPointCreateSerializer,
    RoutePickupPointUpdateSerializer,
)
from apps.transport.domain.transport_exceptions import TransportError
from apps.transport.services.route_pickup_point_service import RoutePickupPointService
from apps.transport.api.views.transport_fees import transport_error_response
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "transport"
CATEGORY = "route_pickup_point"


class RoutePickupPointListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = RoutePickupPointService()
        route_id = request.query_params.get("route_id")
        if route_id:
            try:
                qs = service.list_by_route(int(route_id))
            except (ValueError, TypeError):
                return APIResponse.error(
                    message="Invalid route_id.", status_code=status.HTTP_400_BAD_REQUEST
                )
        else:
            qs = service.list_all()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = RoutePickupPointSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data,
            message="Route-pickup-point assignments retrieved successfully.",
        )

    def post(self, request):
        serializer = RoutePickupPointCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            obj = RoutePickupPointService().create(serializer.validated_data)
            response_serializer = RoutePickupPointSerializer(obj)
            return APIResponse.success(
                data=response_serializer.data,
                message="Route-pickup-point assignment created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except TransportError as exc:
            return transport_error_response(exc)


class RoutePickupPointDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            obj = RoutePickupPointService().get(pk)
            serializer = RoutePickupPointSerializer(obj)
            return APIResponse.success(
                data=serializer.data,
                message="Route-pickup-point assignment retrieved successfully.",
            )
        except TransportError as exc:
            return transport_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = RoutePickupPointUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            obj = RoutePickupPointService().update(pk, serializer.validated_data)
            response_serializer = RoutePickupPointSerializer(obj)
            return APIResponse.success(
                data=response_serializer.data,
                message="Route-pickup-point assignment updated successfully.",
            )
        except TransportError as exc:
            return transport_error_response(exc)

    def delete(self, request, pk):
        try:
            RoutePickupPointService().delete(pk)
            return APIResponse.success(
                message="Route-pickup-point assignment deleted successfully."
            )
        except TransportError as exc:
            return transport_error_response(exc)
