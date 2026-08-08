from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.communications.api.serializers.zoom import (
    ZoomSettingsSerializer,
    ConferenceSerializer,
)
from apps.communications.services.zoom_service import ZoomService
from apps.staff.models.staff import Staff
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


def _resolve_staff(user):
    staff = Staff.objects.filter(user_id=user.id).first()
    if not staff and hasattr(user, "user_id"):
        staff = Staff.objects.filter(id=user.user_id).first()
    return staff


class ZoomSettingsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "setting"  # Gated by 'setting'

    def get(self, request):
        service = ZoomService()
        settings = service.get_settings()
        serializer = ZoomSettingsSerializer(settings)
        return APIResponse.success(data=serializer.data)

    def post(self, request):
        service = ZoomService()
        settings = service.save_settings(request.data)
        serializer = ZoomSettingsSerializer(settings)
        return APIResponse.success(
            data=serializer.data, message="Settings updated successfully."
        )


class ZoomClassView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "live_classes"  # Gated by 'live_classes'

    def get(self, request):
        service = ZoomService()
        session_id = request.query_params.get("session_id")
        staff_id = request.query_params.get("staff_id")
        
        if staff_id == "me":
            staff = _resolve_staff(request.user)
            staff_id = staff.id if staff else None

        classes = service.list_classes(staff_id=staff_id, session_id=session_id)
        serializer = ConferenceSerializer(classes, many=True)
        return APIResponse.success(data=serializer.data)

    def post(self, request):
        service = ZoomService()
        staff = _resolve_staff(request.user)
        created_by_staff_id = staff.id if staff else 1
        session_id = request.data.get("session_id") or 1

        class_sections = request.data.get("class_sections", [])
        conf = service.create_class(
            data=request.data,
            class_sections=class_sections,
            created_by_staff_id=created_by_staff_id,
            session_id=session_id,
        )
        serializer = ConferenceSerializer(conf)
        return APIResponse.success(
            data=serializer.data,
            message="Zoom Live Class created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class ZoomClassDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "live_classes"

    def delete(self, request, pk):
        service = ZoomService()
        service.delete_class(pk)
        return APIResponse.success(message="Zoom Live Class deleted successfully.")


class ZoomMeetingView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "live_meeting"

    def get(self, request):
        service = ZoomService()
        session_id = request.query_params.get("session_id")
        staff_id = request.query_params.get("staff_id")

        if staff_id == "me":
            staff = _resolve_staff(request.user)
            staff_id = staff.id if staff else None

        meetings = service.list_meetings(staff_id=staff_id, session_id=session_id)
        serializer = ConferenceSerializer(meetings, many=True)
        return APIResponse.success(data=serializer.data)

    def post(self, request):
        service = ZoomService()
        staff = _resolve_staff(request.user)
        created_by_staff_id = staff.id if staff else 1
        session_id = request.data.get("session_id") or 1

        staff_ids = request.data.get("staff_ids", [])
        conf = service.create_meeting(
            data=request.data,
            staff_ids=staff_ids,
            created_by_staff_id=created_by_staff_id,
            session_id=session_id,
        )
        serializer = ConferenceSerializer(conf)
        return APIResponse.success(
            data=serializer.data,
            message="Zoom Live Meeting created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class ZoomMeetingDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "live_meeting"

    def delete(self, request, pk):
        service = ZoomService()
        service.delete_meeting(pk)
        return APIResponse.success(message="Zoom Live Meeting deleted successfully.")


class ZoomJoinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        service = ZoomService()
        service.change_status(pk, 2)

        student_id = request.data.get("student_id")
        staff_id = request.data.get("staff_id")

        if not student_id and not staff_id:
            staff = _resolve_staff(request.user)
            if staff:
                staff_id = staff.id

        history = service.add_join_history(pk, student_id=student_id, staff_id=staff_id)
        if history:
            return APIResponse.success(message="Joined zoom meeting successfully.")
        return APIResponse.error(message="Unable to record join history.")


class ZoomClassReportView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "class_report"

    def get(self, request):
        service = ZoomService()
        class_id = request.query_params.get("class_id")
        section_id = request.query_params.get("section_id")
        session_id = request.query_params.get("session_id") or 1

        if not class_id or not section_id:
            return APIResponse.error(message="class_id and section_id are required.")

        classes = service.get_class_report(class_id, section_id, session_id)
        serializer = ConferenceSerializer(classes, many=True)
        return APIResponse.success(data=serializer.data)


class ZoomMeetingReportView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "live_meeting"

    def get(self, request):
        service = ZoomService()
        session_id = request.query_params.get("session_id")
        meetings = service.get_meeting_report(session_id=session_id)
        serializer = ConferenceSerializer(meetings, many=True)
        return APIResponse.success(data=serializer.data)


class ZoomClassViewersView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "class_report"

    def get(self, request, pk):
        service = ZoomService()
        class_id = request.query_params.get("class_id")
        section_id = request.query_params.get("section_id")

        if not class_id or not section_id:
            return APIResponse.error(message="class_id and section_id are required.")

        viewers = service.get_class_viewers(pk, class_id, section_id)
        return APIResponse.success(data=viewers)


class ZoomMeetingViewersView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "live_meeting"

    def get(self, request, pk):
        service = ZoomService()
        viewers = service.get_meeting_viewers(pk)
        return APIResponse.success(data=viewers)
