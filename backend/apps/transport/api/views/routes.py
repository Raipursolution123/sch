from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.transport.api.serializers.routes import (
    TransportRouteSerializer,
    TransportRouteCreateSerializer,
    TransportRouteUpdateSerializer,
)
from apps.transport.domain.transport_exceptions import TransportError
from apps.transport.services.route_service import TransportRouteService
from apps.transport.api.views.transport_fees import transport_error_response
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "transport"
CATEGORY = "routes"


class TransportRouteListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = TransportRouteService()
        qs = service.list_routes()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = TransportRouteSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Transport routes retrieved successfully."
        )

    def post(self, request):
        serializer = TransportRouteCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            route = TransportRouteService().create_route(serializer.validated_data)
            response_serializer = TransportRouteSerializer(route)
            return APIResponse.success(
                data=response_serializer.data,
                message="Transport route created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except TransportError as exc:
            return transport_error_response(exc)


class TransportRouteDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            route = TransportRouteService().get_route(pk)
            serializer = TransportRouteSerializer(route)
            return APIResponse.success(
                data=serializer.data,
                message="Transport route retrieved successfully.",
            )
        except TransportError as exc:
            return transport_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = TransportRouteUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            route = TransportRouteService().update_route(pk, serializer.validated_data)
            response_serializer = TransportRouteSerializer(route)
            return APIResponse.success(
                data=response_serializer.data,
                message="Transport route updated successfully.",
            )
        except TransportError as exc:
            return transport_error_response(exc)

    def delete(self, request, pk):
        try:
            TransportRouteService().delete_route(pk)
            return APIResponse.success(message="Transport route deleted successfully.")
        except TransportError as exc:
            return transport_error_response(exc)
