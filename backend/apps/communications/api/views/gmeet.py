from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.communications.api.serializers.gmeet import (
    GmeetSettingsSerializer,
    GmeetSerializer,
    GmeetHistorySerializer,
)
from apps.communications.services.gmeet_service import GmeetService
from apps.staff.models.staff import Staff
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


def _resolve_staff(user):
    staff = Staff.objects.filter(user_id=user.id).first()
    if not staff and hasattr(user, "user_id"):
        staff = Staff.objects.filter(id=user.user_id).first()
    return staff


class GmeetSettingsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "gmeet_setting"

    def get(self, request):
        service = GmeetService()
        settings = service.get_settings()
        serializer = GmeetSettingsSerializer(settings)
        return APIResponse.success(data=serializer.data)

    def post(self, request):
        service = GmeetService()
        settings = service.save_settings(request.data)
        serializer = GmeetSettingsSerializer(settings)
        return APIResponse.success(
            data=serializer.data, message="Settings updated successfully."
        )


class GmeetClassView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "live_classes"

    def get(self, request):
        service = GmeetService()
        session_id = request.query_params.get("session_id")
        staff_id = request.query_params.get("staff_id")
        
        # If staff_id is passed as 'me', resolve to current logged-in staff
        if staff_id == "me":
            staff = _resolve_staff(request.user)
            staff_id = staff.id if staff else None

        classes = service.list_classes(staff_id=staff_id, session_id=session_id)
        serializer = GmeetSerializer(classes, many=True)
        return APIResponse.success(data=serializer.data)

    def post(self, request):
        service = GmeetService()
        staff = _resolve_staff(request.user)
        created_by_staff_id = staff.id if staff else 1  # Fallback to ID 1 or error
        session_id = request.data.get("session_id") or 1  # Fallback/Required

        class_sections = request.data.get("class_sections", [])
        gmeet = service.create_class(
            data=request.data,
            class_sections=class_sections,
            created_by_staff_id=created_by_staff_id,
            session_id=session_id,
        )
        serializer = GmeetSerializer(gmeet)
        return APIResponse.success(
            data=serializer.data,
            message="Live Class created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class GmeetClassDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "live_classes"

    def delete(self, request, pk):
        service = GmeetService()
        service.delete_class(pk)
        return APIResponse.success(message="Live Class deleted successfully.")


class GmeetMeetingView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "live_meeting"

    def get(self, request):
        service = GmeetService()
        session_id = request.query_params.get("session_id")
        staff_id = request.query_params.get("staff_id")

        if staff_id == "me":
            staff = _resolve_staff(request.user)
            staff_id = staff.id if staff else None

        meetings = service.list_meetings(staff_id=staff_id, session_id=session_id)
        serializer = GmeetSerializer(meetings, many=True)
        return APIResponse.success(data=serializer.data)

    def post(self, request):
        service = GmeetService()
        staff = _resolve_staff(request.user)
        created_by_staff_id = staff.id if staff else 1
        session_id = request.data.get("session_id") or 1

        staff_ids = request.data.get("staff_ids", [])
        gmeet = service.create_meeting(
            data=request.data,
            staff_ids=staff_ids,
            created_by_staff_id=created_by_staff_id,
            session_id=session_id,
        )
        serializer = GmeetSerializer(gmeet)
        return APIResponse.success(
            data=serializer.data,
            message="Live Meeting created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class GmeetMeetingDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "live_meeting"

    def delete(self, request, pk):
        service = GmeetService()
        service.delete_meeting(pk)
        return APIResponse.success(message="Live Meeting deleted successfully.")


class GmeetJoinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        service = GmeetService()
        # Mark status as 2 (started/active or completed, CI status=2 is UAT UPLOADS)
        service.change_status(pk, 2)

        # Detect if student or staff
        student_id = request.data.get("student_id")
        staff_id = request.data.get("staff_id")

        if not student_id and not staff_id:
            # Fallback: resolve from request.user
            staff = _resolve_staff(request.user)
            if staff:
                staff_id = staff.id
            else:
                # Could be a student user
                pass

        history = service.add_join_history(pk, student_id=student_id, staff_id=staff_id)
        if history:
            return APIResponse.success(message="Joined meeting successfully.")
        return APIResponse.error(message="Unable to record join history.")


class GmeetClassReportView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "class_report"

    def get(self, request):
        service = GmeetService()
        class_id = request.query_params.get("class_id")
        section_id = request.query_params.get("section_id")
        session_id = request.query_params.get("session_id") or 1

        if not class_id or not section_id:
            return APIResponse.error(message="class_id and section_id are required.")

        classes = service.get_class_report(class_id, section_id, session_id)
        serializer = GmeetSerializer(classes, many=True)
        return APIResponse.success(data=serializer.data)


class GmeetMeetingReportView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "live_meeting"  # CI has 'live_meeting_report' or similar, we gate by live_meeting

    def get(self, request):
        service = GmeetService()
        session_id = request.query_params.get("session_id")
        meetings = service.get_meeting_report(session_id=session_id)
        serializer = GmeetSerializer(meetings, many=True)
        return APIResponse.success(data=serializer.data)


class GmeetClassViewersView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "class_report"

    def get(self, request, pk):
        service = GmeetService()
        class_id = request.query_params.get("class_id")
        section_id = request.query_params.get("section_id")

        if not class_id or not section_id:
            return APIResponse.error(message="class_id and section_id are required.")

        viewers = service.get_class_viewers(pk, class_id, section_id)
        return APIResponse.success(data=viewers)


class GmeetMeetingViewersView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "live_meeting"

    def get(self, request, pk):
        service = GmeetService()
        viewers = service.get_meeting_viewers(pk)
        return APIResponse.success(data=viewers)
