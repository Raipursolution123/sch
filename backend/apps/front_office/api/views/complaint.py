from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.front_office.api.serializers.complaint import (
    ComplaintSerializer,
    ComplaintCreateSerializer,
    ComplaintUpdateSerializer,
)
from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeError,
    FrontOfficeNotFoundError,
)
from apps.front_office.services.complaint_service import ComplaintService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "front_office"
CATEGORY = "complaint"


def front_office_error_response(exc: FrontOfficeError):
    if isinstance(exc, FrontOfficeNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    return APIResponse.error(
        message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
    )


class ComplaintListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = ComplaintService()
        qs = service.list_complaints()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = ComplaintSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Complaints retrieved successfully."
        )

    def post(self, request):
        serializer = ComplaintCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            complaint = ComplaintService().create_complaint(serializer.validated_data)
            response_serializer = ComplaintSerializer(complaint)
            return APIResponse.success(
                data=response_serializer.data,
                message="Complaint created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)


class ComplaintDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            complaint = ComplaintService().get_complaint(pk)
            serializer = ComplaintSerializer(complaint)
            return APIResponse.success(
                data=serializer.data, message="Complaint retrieved successfully."
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = ComplaintUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            complaint = ComplaintService().update_complaint(pk, serializer.validated_data)
            response_serializer = ComplaintSerializer(complaint)
            return APIResponse.success(
                data=response_serializer.data,
                message="Complaint updated successfully.",
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def delete(self, request, pk):
        try:
            ComplaintService().delete_complaint(pk)
            return APIResponse.success(message="Complaint deleted successfully.")
        except FrontOfficeError as exc:
            return front_office_error_response(exc)
