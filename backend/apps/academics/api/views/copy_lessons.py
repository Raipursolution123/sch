from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.academics.domain.lesson_plan_exceptions import LessonPlanError
from apps.academics.services.lesson_plan_service import LessonPlanService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "academics"
CATEGORY = "copy_old_lesson"


class CopyLessonsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def post(self, request):
        from_session_id = request.data.get("from_session_id")
        from_subject_group_id = request.data.get("from_subject_group_id")
        from_subject_id = request.data.get("from_subject_id")
        to_session_id = request.data.get("to_session_id")
        to_subject_group_id = request.data.get("to_subject_group_id")
        to_subject_id = request.data.get("to_subject_id")

        if not all(
            [
                from_session_id,
                from_subject_group_id,
                from_subject_id,
                to_session_id,
                to_subject_group_id,
                to_subject_id,
            ]
        ):
            return APIResponse.error(
                message="Missing required parameters.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            res = LessonPlanService().copy_lessons(
                from_session_id=int(from_session_id),
                from_subject_group_id=int(from_subject_group_id),
                from_subject_id=int(from_subject_id),
                to_session_id=int(to_session_id),
                to_subject_group_id=int(to_subject_group_id),
                to_subject_id=int(to_subject_id),
            )
            return APIResponse.success(
                data=res, message="Lessons and topics copied successfully."
            )
        except LessonPlanError as exc:
            return APIResponse.error(
                message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return APIResponse.error(
                message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
