import logging

from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.academics.api.serializers.section import (
    SectionCreateSerializer,
    SectionUpdateSerializer,
)
from apps.academics.domain.academic_structure_exceptions import (
    AcademicStructureError,
    AcademicStructureInUseError,
    AcademicStructureNotFoundError,
    AcademicStructureValidationError,
)
from apps.academics.selectors.section_selectors import section_to_dict
from apps.academics.services.section_service import SectionService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)

MODULE = "academics"
CATEGORY = "section"


class SectionListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        active_only = request.query_params.get("active_only", "false").lower() == "true"
        qs = SectionService().list_sections(active_only=active_only)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else qs
        data = [section_to_dict(s) for s in rows]
        if page is not None:
            return paginator.get_paginated_response({"sections": data})
        return APIResponse.success(
            data={"sections": data}, message="Sections retrieved successfully."
        )

    def post(self, request):
        serializer = SectionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            data = SectionService().create_section(
                serializer.validated_data["section_name"]
            )
            return APIResponse.success(
                data=data,
                message=f"Section '{data['section_name']}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except AcademicStructureError as exc:
            return _error_response(exc)


class SectionDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=SectionService().get_section(pk),
                message="Section details retrieved successfully.",
            )
        except AcademicStructureError as exc:
            return _error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = SectionUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        payload = {k: request.data.get(k) for k in request.data.keys()}
        try:
            data = SectionService().update_section(pk, payload)
            return APIResponse.success(
                data=data, message="Section updated successfully."
            )
        except AcademicStructureError as exc:
            return _error_response(exc)

    def delete(self, request, pk):
        try:
            with transaction.atomic():
                SectionService().deactivate_section(pk)
            return APIResponse.success(message="Section successfully deactivated.")
        except AcademicStructureError as exc:
            return _error_response(exc)


def _error_response(exc: AcademicStructureError) -> Response:
    if isinstance(exc, AcademicStructureNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, (AcademicStructureValidationError, AcademicStructureInUseError)):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected academic structure error: %s", exc)
    return APIResponse.error(
        message="Academic structure operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
