from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.front_office.api.serializers.complaint_type import ComplaintTypeSerializer
from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeError,
    FrontOfficeNotFoundError,
)
from apps.front_office.services.complaint_type_service import ComplaintTypeService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "front_office"
CATEGORY = "setup_font_office"  # Matches seeds/basic_seed.sql categories


def front_office_error_response(exc: FrontOfficeError):
    if isinstance(exc, FrontOfficeNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    return APIResponse.error(
        message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
    )


class ComplaintTypeListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = ComplaintTypeService()
        qs = service.list_complaint_types()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = ComplaintTypeSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Complaint types retrieved successfully."
        )

    def post(self, request):
        serializer = ComplaintTypeSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            item = ComplaintTypeService().create_complaint_type(
                serializer.validated_data
            )
            response_serializer = ComplaintTypeSerializer(item)
            return APIResponse.success(
                data=response_serializer.data,
                message="Complaint type created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)


class ComplaintTypeDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            item = ComplaintTypeService().get_complaint_type(pk)
            serializer = ComplaintTypeSerializer(item)
            return APIResponse.success(
                data=serializer.data,
                message="Complaint type retrieved successfully.",
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = ComplaintTypeSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            item = ComplaintTypeService().update_complaint_type(
                pk, serializer.validated_data
            )
            response_serializer = ComplaintTypeSerializer(item)
            return APIResponse.success(
                data=response_serializer.data,
                message="Complaint type updated successfully.",
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def delete(self, request, pk):
        try:
            ComplaintTypeService().delete_complaint_type(pk)
            return APIResponse.success(message="Complaint type deleted successfully.")
        except FrontOfficeError as exc:
            return front_office_error_response(exc)
