from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.front_office.api.serializers.visitors_book import (
    VisitorsBookSerializer,
    VisitorsBookCreateSerializer,
    VisitorsBookUpdateSerializer,
)
from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeError,
    FrontOfficeNotFoundError,
)
from apps.front_office.services.visitors_book_service import VisitorsBookService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "front_office"
CATEGORY = "visitor_book"


def front_office_error_response(exc: FrontOfficeError):
    if isinstance(exc, FrontOfficeNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    return APIResponse.error(
        message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
    )


class VisitorsBookListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = VisitorsBookService()
        qs = service.list_visitors()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = VisitorsBookSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Visitor records retrieved successfully."
        )

    def post(self, request):
        serializer = VisitorsBookCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            visitor = VisitorsBookService().create_visitor(serializer.validated_data)
            response_serializer = VisitorsBookSerializer(visitor)
            return APIResponse.success(
                data=response_serializer.data,
                message="Visitor record created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)


class VisitorsBookDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            visitor = VisitorsBookService().get_visitor(pk)
            serializer = VisitorsBookSerializer(visitor)
            return APIResponse.success(
                data=serializer.data, message="Visitor record retrieved successfully."
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = VisitorsBookUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            visitor = VisitorsBookService().update_visitor(pk, serializer.validated_data)
            response_serializer = VisitorsBookSerializer(visitor)
            return APIResponse.success(
                data=response_serializer.data,
                message="Visitor record updated successfully.",
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def delete(self, request, pk):
        try:
            VisitorsBookService().delete_visitor(pk)
            return APIResponse.success(message="Visitor record deleted successfully.")
        except FrontOfficeError as exc:
            return front_office_error_response(exc)
