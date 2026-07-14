from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.examinations.api.views.common import MODULE, examination_error_response
from apps.examinations.domain.examination_exceptions import ExaminationError
from apps.examinations.services.grade_service import GradeService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "marks_grade"


class GradesListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = GradeService()
        qs = service.list_grades()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        data = service.enrich_list(rows)
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(data=data, message="Grades retrieved successfully.")

    def post(self, request):
        try:
            data = GradeService().create_grade(request.data)
            return APIResponse.success(
                data=data,
                message="Grade created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except ExaminationError as exc:
            return examination_error_response(exc)


class GradesDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=GradeService().get_grade(pk),
                message="Grade retrieved successfully.",
            )
        except ExaminationError as exc:
            return examination_error_response(exc)

    def put(self, request, pk):
        try:
            data = GradeService().update_grade(pk, request.data)
            return APIResponse.success(data=data, message="Grade updated successfully.")
        except ExaminationError as exc:
            return examination_error_response(exc)

    patch = put

    def delete(self, request, pk):
        try:
            GradeService().delete_grade(pk)
            return APIResponse.success(message="Grade deleted successfully.")
        except ExaminationError as exc:
            return examination_error_response(exc)
