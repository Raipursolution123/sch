from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.examinations.api.views.common import MODULE, examination_error_response
from apps.examinations.domain.examination_exceptions import ExaminationError
from apps.examinations.selectors.examination_selectors import exam_to_dict
from apps.examinations.services.exam_service import ExamService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "exam"


class ExamsListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        qs = ExamService().list_exams()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else qs
        data = [exam_to_dict(exam) for exam in rows]
        if page is not None:
            return APIResponse.success(
                data={
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": data,
                },
                message="Exams retrieved successfully.",
            )
        return APIResponse.success(data=data, message="Exams retrieved successfully.")

    def post(self, request):
        try:
            data = ExamService().create_exam(request.data)
            return APIResponse.success(
                data=data,
                message="Exam created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except ExaminationError as exc:
            return examination_error_response(exc)


class ExamsDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=ExamService().get_exam(pk),
                message="Exam retrieved successfully.",
            )
        except ExaminationError as exc:
            return examination_error_response(exc)

    def put(self, request, pk):
        try:
            data = ExamService().update_exam(pk, request.data)
            return APIResponse.success(data=data, message="Exam updated successfully.")
        except ExaminationError as exc:
            return examination_error_response(exc)

    patch = put

    def delete(self, request, pk):
        try:
            ExamService().delete_exam(pk)
            return APIResponse.success(message="Exam deleted successfully.")
        except ExaminationError as exc:
            return examination_error_response(exc)
