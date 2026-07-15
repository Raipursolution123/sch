from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.examinations.api.views.common import MODULE, examination_error_response
from apps.examinations.domain.examination_exceptions import ExaminationError
from apps.examinations.services.exam_result_service import ExamResultService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

# Seeded exam_result is view-only for some roles; writes use exam_group
# matching schedule manage pattern / FE exams.edit.
LIST_CATEGORY = "exam_result"
MANAGE_CATEGORY = "exam_group"


class ExamResultRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = LIST_CATEGORY

    def get(self, request):
        exam_id = request.query_params.get("exam_id")
        schedule_id = request.query_params.get(
            "exam_group_class_batch_exam_subject_id"
        ) or request.query_params.get("schedule_id")
        if not exam_id or not schedule_id:
            return APIResponse.error(
                message="exam_id and schedule_id are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = ExamResultService().get_roster(int(exam_id), int(schedule_id))
            return APIResponse.success(
                data=data, message="Exam result roster retrieved successfully."
            )
        except ExaminationError as exc:
            return examination_error_response(exc)
        except (TypeError, ValueError):
            return APIResponse.error(
                message="exam_id and schedule_id must be valid integers.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )


class ExamResultsSaveView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = MANAGE_CATEGORY

    def post(self, request):
        try:
            data = ExamResultService().save_results(request.data)
            return APIResponse.success(
                data=data,
                message="Exam results saved successfully.",
                status_code=status.HTTP_200_OK,
            )
        except ExaminationError as exc:
            return examination_error_response(exc)
