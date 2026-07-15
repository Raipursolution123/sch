from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.examinations.api.views.common import MODULE, examination_error_response
from apps.examinations.domain.examination_exceptions import ExaminationError
from apps.examinations.services.exam_schedule_service import ExamScheduleService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

# Seeded exam_schedule is view-only for some roles; write ops use exam_group
# which matches FE permission-resolver (exams.create/edit/delete).
LIST_CATEGORY = "exam_schedule"
MANAGE_CATEGORY = "exam_group"


class ExamSchedulesListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = LIST_CATEGORY

    def initial(self, request, *args, **kwargs):
        if request.method.upper() == "POST":
            self.legacy_permission_category = MANAGE_CATEGORY
        else:
            self.legacy_permission_category = LIST_CATEGORY
        super().initial(request, *args, **kwargs)

    def get(self, request):
        data = ExamScheduleService().list_schedules()
        return APIResponse.success(
            data=data, message="Exam schedules retrieved successfully."
        )

    def post(self, request):
        try:
            data = ExamScheduleService().create_schedule(request.data)
            return APIResponse.success(
                data=data,
                message="Exam schedule created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except ExaminationError as exc:
            return examination_error_response(exc)


class ExamSchedulesDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = LIST_CATEGORY

    def initial(self, request, *args, **kwargs):
        if request.method.upper() in {"PUT", "PATCH", "DELETE"}:
            self.legacy_permission_category = MANAGE_CATEGORY
        else:
            self.legacy_permission_category = LIST_CATEGORY
        super().initial(request, *args, **kwargs)

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=ExamScheduleService().get_schedule(pk),
                message="Exam schedule retrieved successfully.",
            )
        except ExaminationError as exc:
            return examination_error_response(exc)

    def put(self, request, pk):
        try:
            data = ExamScheduleService().update_schedule(pk, request.data)
            return APIResponse.success(
                data=data, message="Exam schedule updated successfully."
            )
        except ExaminationError as exc:
            return examination_error_response(exc)

    patch = put

    def delete(self, request, pk):
        try:
            ExamScheduleService().delete_schedule(pk)
            return APIResponse.success(message="Exam schedule deleted successfully.")
        except ExaminationError as exc:
            return examination_error_response(exc)
