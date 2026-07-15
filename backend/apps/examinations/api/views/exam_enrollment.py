from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.examinations.api.views.common import MODULE, examination_error_response
from apps.examinations.domain.examination_exceptions import ExaminationError
from apps.examinations.services.exam_enrollment_service import ExamEnrollmentService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "exam_group"


class ExamEnrollmentRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        exam_id = request.query_params.get("exam_id")
        class_id = request.query_params.get("class_id")
        section_id = request.query_params.get("section_id")
        if not exam_id or not class_id or not section_id:
            return APIResponse.error(
                message="exam_id, class_id, and section_id are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = ExamEnrollmentService().get_roster(
                int(exam_id), int(class_id), int(section_id)
            )
            return APIResponse.success(
                data=data, message="Exam enrollment roster retrieved successfully."
            )
        except ExaminationError as exc:
            return examination_error_response(exc)
        except (TypeError, ValueError):
            return APIResponse.error(
                message="exam_id, class_id, and section_id must be valid integers.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )


class ExamEnrollmentAssignView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def post(self, request):
        try:
            data = ExamEnrollmentService().enroll(
                exam_id=int(request.data.get("exam_id")),
                student_session_ids=list(request.data.get("student_session_ids") or []),
            )
            return APIResponse.success(
                data=data,
                message="Students enrolled in exam successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except ExaminationError as exc:
            return examination_error_response(exc)
        except (TypeError, ValueError):
            return APIResponse.error(
                message="Invalid enroll payload.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )


class ExamEnrollmentUnassignView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"DELETE": "can_delete"}

    def delete(self, request, pk):
        try:
            ExamEnrollmentService().unenroll(pk)
            return APIResponse.success(message="Student removed from exam.")
        except ExaminationError as exc:
            return examination_error_response(exc)
