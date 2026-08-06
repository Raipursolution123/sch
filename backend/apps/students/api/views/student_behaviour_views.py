from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from core.permissions.legacy_privilege import HasLegacyPrivilege
from common.responses.api import APIResponse
from common.exceptions.legacy_errors import legacy_domain_error_response
from apps.students.services.student_behaviour_service import StudentBehaviourService
from apps.students.api.serializers.student_behaviour_serializers import (
    StudentBehaviourSerializer,
    StudentIncidentsSerializer,
    StudentIncidentDetailSerializer,
    StudentIncidentCommentsSerializer,
    BehaviourSettingsSerializer,
)


class StudentBehaviourViewSet(ViewSet):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    
    def get_privilege_category(self):
        return "behaviour_records_incident"

    def list(self, request):
        service = StudentBehaviourService()
        incidents = service.list_incidents()
        serializer = StudentBehaviourSerializer(incidents, many=True)
        return APIResponse.success(data=serializer.data, message="Incidents retrieved successfully.")

    def retrieve(self, request, pk=None):
        service = StudentBehaviourService()
        try:
            incident = service.get_incident(int(pk))
            serializer = StudentBehaviourSerializer(incident)
            return APIResponse.success(data=serializer.data, message="Incident retrieved successfully.")
        except Exception as e:
            return legacy_domain_error_response(e)

    def create(self, request):
        serializer = StudentBehaviourSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        
        service = StudentBehaviourService()
        try:
            incident = service.create_incident(serializer.validated_data)
            response_serializer = StudentBehaviourSerializer(incident)
            return APIResponse.success(
                data=response_serializer.data,
                message="Incident created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return legacy_domain_error_response(e)

    def update(self, request, pk=None):
        serializer = StudentBehaviourSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        
        service = StudentBehaviourService()
        try:
            incident = service.update_incident(int(pk), serializer.validated_data)
            response_serializer = StudentBehaviourSerializer(incident)
            return APIResponse.success(
                data=response_serializer.data,
                message="Incident updated successfully.",
            )
        except Exception as e:
            return legacy_domain_error_response(e)

    def destroy(self, request, pk=None):
        service = StudentBehaviourService()
        try:
            service.delete_incident(int(pk))
            return APIResponse.success(message="Incident deleted successfully.")
        except Exception as e:
            return legacy_domain_error_response(e)


class StudentIncidentsViewSet(ViewSet):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    
    def get_privilege_category(self):
        return "behaviour_records_assign_incident"

    def list(self, request):
        class_id = request.query_params.get("class_id")
        section_id = request.query_params.get("section_id")
        session_id = request.query_params.get("session_id")
        
        if class_id:
            class_id = int(class_id)
        if section_id:
            section_id = int(section_id)
        if session_id:
            session_id = int(session_id)
        else:
            # Default to active session if not provided
            from apps.academics.selectors.session_selectors import get_current_session
            active_sess = get_current_session()
            if active_sess:
                session_id = active_sess.id

        service = StudentBehaviourService()
        results = service.list_assigned_incidents(
            class_id=class_id, section_id=section_id, session_id=session_id
        )
        serializer = StudentIncidentDetailSerializer(results, many=True)
        return APIResponse.success(data=serializer.data, message="Assigned incidents retrieved successfully.")

    def create(self, request):
        serializer = StudentIncidentsSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        
        from apps.academics.selectors.session_selectors import get_current_session
        active_sess = get_current_session()
        if not active_sess:
            return APIResponse.error(message="No active academic session found.")

        # Identify logged-in staff member or user id
        assign_by_id = 1
        if hasattr(request.user, "staff_id") and request.user.staff_id:
            assign_by_id = request.user.staff_id
        elif hasattr(request.user, "id"):
            assign_by_id = request.user.id

        service = StudentBehaviourService()
        try:
            record = service.assign_incident(
                serializer.validated_data, assign_by_id=assign_by_id, session_id=active_sess.id
            )
            response_serializer = StudentIncidentsSerializer(record)
            return APIResponse.success(
                data=response_serializer.data,
                message="Incident assigned successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return legacy_domain_error_response(e)


class StudentIncidentCommentsViewSet(ViewSet):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    
    def get_privilege_category(self):
        return "behaviour_records_assign_incident"

    def list(self, request):
        student_incident_id = request.query_params.get("student_incident_id")
        if not student_incident_id:
            return APIResponse.error(message="student_incident_id is required.")
            
        service = StudentBehaviourService()
        comments = service.list_incident_comments(int(student_incident_id))
        serializer = StudentIncidentCommentsSerializer(comments, many=True)
        return APIResponse.success(data=serializer.data, message="Comments retrieved successfully.")

    def create(self, request):
        serializer = StudentIncidentCommentsSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
            
        staff_id = None
        student_id = None
        if hasattr(request.user, "staff_id") and request.user.staff_id:
            staff_id = request.user.staff_id
        elif hasattr(request.user, "student_id") and request.user.student_id:
            student_id = request.user.student_id
        else:
            staff_id = request.user.id

        service = StudentBehaviourService()
        try:
            comment = service.add_comment(
                serializer.validated_data, staff_id=staff_id, student_id=student_id
            )
            response_serializer = StudentIncidentCommentsSerializer(comment)
            return APIResponse.success(
                data=response_serializer.data,
                message="Comment added successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return legacy_domain_error_response(e)

    def destroy(self, request, pk=None):
        service = StudentBehaviourService()
        try:
            service.delete_comment(int(pk))
            return APIResponse.success(message="Comment deleted successfully.")
        except Exception as e:
            return legacy_domain_error_response(e)


class BehaviourSettingsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    
    def get_privilege_category(self):
        return "behaviour_records_setting"

    def get(self, request):
        service = StudentBehaviourService()
        setting = service.get_setting()
        serializer = BehaviourSettingsSerializer(setting)
        return APIResponse.success(data=serializer.data, message="Settings retrieved successfully.")

    def put(self, request):
        serializer = BehaviourSettingsSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
            
        service = StudentBehaviourService()
        try:
            setting = service.update_setting(serializer.validated_data)
            response_serializer = BehaviourSettingsSerializer(setting)
            return APIResponse.success(data=response_serializer.data, message="Settings updated successfully.")
        except Exception as e:
            return legacy_domain_error_response(e)
