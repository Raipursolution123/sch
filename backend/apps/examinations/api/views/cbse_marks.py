from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.examinations.api.views.common import examination_error_response
from apps.examinations.domain.examination_exceptions import ExaminationError
from apps.examinations.services.cbse_marks_service import CbseMarksService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CBSE_MODULE = "cbseexam"


class CbseExamTimetableListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = CBSE_MODULE
    legacy_permission_category = "cbse_exam_schedule"

    def get(self, request, pk):
        try:
            data = CbseMarksService().list_timetable(pk)
            return APIResponse.success(
                data=data, message="CBSE exam timetable retrieved successfully."
            )
        except ExaminationError as exc:
            return examination_error_response(exc)


class CbseMarksRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = CBSE_MODULE
    legacy_permission_category = "cbse_exam_marks"

    def get(self, request):
        exam_id = request.query_params.get("cbse_exam_id") or request.query_params.get(
            "exam_id"
        )
        timetable_id = request.query_params.get("timetable_id")
        assessment_type_id = request.query_params.get("assessment_type_id")
        if not exam_id or not timetable_id:
            return APIResponse.error(
                message="cbse_exam_id and timetable_id are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = CbseMarksService().get_roster(
                int(exam_id),
                int(timetable_id),
                assessment_type_id=(
                    int(assessment_type_id) if assessment_type_id else None
                ),
            )
            return APIResponse.success(data=data)
        except ExaminationError as exc:
            return examination_error_response(exc)
        except (TypeError, ValueError):
            return APIResponse.error(
                message="Invalid exam or timetable id.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )


class CbseMarksSaveView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = CBSE_MODULE
    legacy_permission_category = "cbse_exam_marks"

    def post(self, request):
        try:
            data = CbseMarksService().save_marks(request.data)
            return APIResponse.success(
                data=data, message="CBSE marks saved successfully."
            )
        except ExaminationError as exc:
            return examination_error_response(exc)


class CbseMarksheetView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = CBSE_MODULE
    legacy_permission_category = "cbse_exam_print_marksheet"

    def get(self, request):
        exam_id = request.query_params.get("cbse_exam_id") or request.query_params.get(
            "exam_id"
        )
        cbse_exam_student_id = request.query_params.get("cbse_exam_student_id")
        student_session_id = request.query_params.get("student_session_id")
        if not exam_id:
            return APIResponse.error(
                message="cbse_exam_id is required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = CbseMarksService().get_marksheet(
                int(exam_id),
                cbse_exam_student_id=(
                    int(cbse_exam_student_id) if cbse_exam_student_id else None
                ),
                student_session_id=(
                    int(student_session_id) if student_session_id else None
                ),
            )
            return APIResponse.success(data=data)
        except ExaminationError as exc:
            return examination_error_response(exc)
        except (TypeError, ValueError):
            return APIResponse.error(
                message="Invalid marksheet request parameters.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
