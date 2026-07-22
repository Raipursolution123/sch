from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.documents.api.serializers.certificates import (
    CertificateCreateSerializer,
    CertificateGenerateSerializer,
    CertificatePreviewSerializer,
    CertificateSerializer,
    CertificateUpdateSerializer,
)
from apps.documents.domain.certificate_exceptions import (
    CertificateError,
    CertificateNotFoundError,
)
from apps.documents.services.certificate_service import (
    CertificateGenerateService,
    CertificateTemplateService,
)
from common.exceptions.legacy_errors import legacy_domain_error_response
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "certificate"


def certificate_error_response(exc: CertificateError):
    return legacy_domain_error_response(
        exc, not_found_type=CertificateNotFoundError
    )


class CertificateListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "student_certificate"

    def get(self, request):
        created_for = request.query_params.get("created_for")
        qs = CertificateTemplateService().list(
            query=request.query_params.get("q"),
            created_for=int(created_for) if created_for else None,
        )
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        data = CertificateSerializer(rows, many=True).data
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(
            data=data, message="Certificate templates retrieved successfully."
        )

    def post(self, request):
        serializer = CertificateCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = CertificateTemplateService().create(serializer.validated_data)
            return APIResponse.success(
                data=CertificateSerializer(row).data,
                message="Certificate template created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except CertificateError as exc:
            return certificate_error_response(exc)


class CertificateDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "student_certificate"

    def get(self, request, pk):
        try:
            row = CertificateTemplateService().get(pk)
            return APIResponse.success(
                data=CertificateSerializer(row).data,
                message="Certificate template retrieved successfully.",
            )
        except CertificateError as exc:
            return certificate_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = CertificateUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = CertificateTemplateService().update(pk, serializer.validated_data)
            return APIResponse.success(
                data=CertificateSerializer(row).data,
                message="Certificate template updated successfully.",
            )
        except CertificateError as exc:
            return certificate_error_response(exc)

    def delete(self, request, pk):
        try:
            CertificateTemplateService().delete(pk)
            return APIResponse.success(
                message="Certificate template deleted successfully."
            )
        except CertificateError as exc:
            return certificate_error_response(exc)


class CertificateGenerateView(APIView):
    """Preview merged certificate for print. Seed grants view-only."""

    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "generate_certificate"
    legacy_method_actions = {"POST": "can_view"}

    def post(self, request):
        serializer = CertificateGenerateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            preview = CertificateGenerateService().preview(
                certificate_id=serializer.validated_data["certificate_id"],
                student_id=serializer.validated_data["student_id"],
            )
            return APIResponse.success(
                data=CertificatePreviewSerializer(preview).data,
                message="Certificate preview generated successfully.",
            )
        except CertificateError as exc:
            return certificate_error_response(exc)
