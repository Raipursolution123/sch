from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.examinations.api.views.common import MODULE, examination_error_response
from apps.examinations.domain.examination_exceptions import ExaminationError
from apps.examinations.services.mark_division_service import MarkDivisionService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "marks_division"


class MarkDivisionsListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = MarkDivisionService()
        qs = service.list_divisions()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        data = service.enrich_list(rows)
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(
            data=data, message="Mark divisions retrieved successfully."
        )

    def post(self, request):
        try:
            data = MarkDivisionService().create_division(request.data)
            return APIResponse.success(
                data=data,
                message="Mark division created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except ExaminationError as exc:
            return examination_error_response(exc)


class MarkDivisionsDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=MarkDivisionService().get_division(pk),
                message="Mark division retrieved successfully.",
            )
        except ExaminationError as exc:
            return examination_error_response(exc)

    def put(self, request, pk):
        try:
            data = MarkDivisionService().update_division(pk, request.data)
            return APIResponse.success(
                data=data, message="Mark division updated successfully."
            )
        except ExaminationError as exc:
            return examination_error_response(exc)

    patch = put

    def delete(self, request, pk):
        try:
            MarkDivisionService().delete_division(pk)
            return APIResponse.success(message="Mark division deleted successfully.")
        except ExaminationError as exc:
            return examination_error_response(exc)
