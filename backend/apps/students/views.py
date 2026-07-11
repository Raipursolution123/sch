import logging

from django.db import connection
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.academics.models import Sessions
from apps.students.models.student_session import StudentSession
from apps.students.models.students import Students
from common.responses.api import APIResponse

logger = logging.getLogger(__name__)


class ParentsTestView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM feetype")
                ft = [
                    dict(zip([c[0] for c in cursor.description], row))
                    for row in cursor.fetchall()
                ]
                cursor.execute(
                    "SELECT * FROM fee_groups_feetype ORDER BY id DESC LIMIT 5"
                )
                fgft = [
                    dict(zip([c[0] for c in cursor.description], row))
                    for row in cursor.fetchall()
                ]
            return Response({"ft": ft, "fgft": fgft})
        except Exception as e:
            import traceback

            return Response({"error": str(e), "traceback": traceback.format_exc()})


class StudentAcademicSessionsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, student_id):
        user_role = request.user.role if request.user.is_authenticated else None
        if not user_role:
            return APIResponse.error(
                message="Authentication required. Please login first.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        student = Students.objects.filter(id=student_id).first()
        if not student:
            return APIResponse.error(
                message="Student not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        session_ids = (
            StudentSession.objects.filter(student_id=student_id)
            .values_list("session_id", flat=True)
            .distinct()
        )
        sessions = Sessions.objects.filter(id__in=session_ids).order_by("id")

        from apps.settings.models.sch_settings import SchSettings

        sch_setting = SchSettings.objects.first()
        active_session_id = sch_setting.session_id if sch_setting else 0

        sessions_data = []
        for s in sessions:
            sessions_data.append(
                {
                    "id": s.id,
                    "session": s.session,
                    "is_active": s.is_active,
                    "active": s.id if s.id == active_session_id else 0,
                    "created_at": (
                        s.created_at.strftime("%Y-%m-%d %H:%M:%S")
                        if s.created_at
                        else None
                    ),
                    "updated_at": (
                        s.updated_at.strftime("%Y-%m-%d") if s.updated_at else None
                    ),
                }
            )

        return APIResponse.success(
            data={"sessions": sessions_data},
            message="Student academic sessions retrieved successfully.",
        )
