from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.front_office.api.serializers.enquiry import (
    EnquiryCreateSerializer,
    EnquirySerializer,
    EnquiryUpdateSerializer,
)
from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeError,
    FrontOfficeNotFoundError,
)
from apps.front_office.services.enquiry_service import EnquiryService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "front_office"
CATEGORY = "admission_enquiry"


def front_office_error_response(exc: FrontOfficeError):
    if isinstance(exc, FrontOfficeNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    return APIResponse.error(
        message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
    )


class EnquiryListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = EnquiryService()
        qs = service.list_enquiries()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = EnquirySerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Enquiries retrieved successfully."
        )

    def post(self, request):
        serializer = EnquiryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            enquiry = EnquiryService().create_enquiry(
                serializer.validated_data,
                created_by=request.user.id,
            )
            response_serializer = EnquirySerializer(enquiry)
            return APIResponse.success(
                data=response_serializer.data,
                message="Enquiry created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)


class EnquiryDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            enquiry = EnquiryService().get_enquiry(pk)
            serializer = EnquirySerializer(enquiry)
            return APIResponse.success(
                data=serializer.data,
                message="Enquiry retrieved successfully.",
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = EnquiryUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            enquiry = EnquiryService().update_enquiry(pk, serializer.validated_data)
            response_serializer = EnquirySerializer(enquiry)
            return APIResponse.success(
                data=response_serializer.data,
                message="Enquiry updated successfully.",
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def delete(self, request, pk):
        try:
            EnquiryService().delete_enquiry(pk)
            return APIResponse.success(message="Enquiry deleted successfully.")
        except FrontOfficeError as exc:
            return front_office_error_response(exc)
