import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.students.services.behaviour_service import BehaviourService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)
MODULE = "behaviour_records"


def _error(exc: Exception):
    if isinstance(exc, LookupError):
        return APIResponse.error(
            message=str(exc), status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, ValueError):
        return APIResponse.error(
            message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Behaviour error: %s", exc)
    return APIResponse.error(
        message="Behaviour operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


class BehaviourIncidentTypeListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "behaviour_records_incident"

    def get(self, request):
        try:
            return APIResponse.success(data=BehaviourService().list_incident_types())
        except Exception as exc:
            return _error(exc)

    def post(self, request):
        try:
            data = BehaviourService().create_incident_type(request.data)
            return APIResponse.success(
                data=data,
                message="Incident type created.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as exc:
            return _error(exc)


class BehaviourIncidentTypeDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "behaviour_records_incident"

    def put(self, request, pk):
        try:
            data = BehaviourService().update_incident_type(pk, request.data)
            return APIResponse.success(data=data, message="Incident type updated.")
        except Exception as exc:
            return _error(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        try:
            BehaviourService().delete_incident_type(pk)
            return APIResponse.success(message="Incident type deleted.")
        except Exception as exc:
            return _error(exc)


class BehaviourAssignmentListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "behaviour_records_assign_incident"

    def get(self, request):
        session_id = request.query_params.get("session_id")
        student_id = request.query_params.get("student_id")
        try:
            data = BehaviourService().list_assignments(
                session_id=int(session_id) if session_id else None,
                student_id=int(student_id) if student_id else None,
            )
            return APIResponse.success(data=data)
        except Exception as exc:
            return _error(exc)

    def post(self, request):
        assign_by = getattr(request.user, "id", 0) or 0
        try:
            data = BehaviourService().assign_incident(request.data, assign_by=assign_by)
            return APIResponse.success(
                data=data,
                message="Incident assigned.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as exc:
            return _error(exc)


class BehaviourAssignmentDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "behaviour_records_assign_incident"

    def delete(self, request, pk):
        try:
            BehaviourService().delete_assignment(pk)
            return APIResponse.success(message="Assignment deleted.")
        except Exception as exc:
            return _error(exc)


class BehaviourSettingsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "behaviour_records_setting"

    def get(self, request):
        try:
            return APIResponse.success(data=BehaviourService().get_settings())
        except Exception as exc:
            return _error(exc)
