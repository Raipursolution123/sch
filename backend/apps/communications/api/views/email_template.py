from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.communications.api.serializers.email_template import EmailTemplateSerializer
from apps.communications.services.message_service import (
    CommunicationNotFoundError,
    MessageService,
)
from common.exceptions.legacy_errors import legacy_domain_error_response
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


class EmailTemplateListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "email_template"

    def get(self, request):
        service = MessageService()
        qs = service.list_email_templates()
        serializer = EmailTemplateSerializer(qs, many=True)
        return APIResponse.success(data=serializer.data)

    def post(self, request):
        service = MessageService()
        try:
            item = service.create_email_template(request.data)
            serializer = EmailTemplateSerializer(item)
            return APIResponse.success(
                data=serializer.data,
                message="Email template created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return legacy_domain_error_response(
                e, not_found_type=CommunicationNotFoundError
            )


class EmailTemplateDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "email_template"

    def get(self, request, pk):
        service = MessageService()
        try:
            item = service.get_email_template(pk)
            serializer = EmailTemplateSerializer(item)
            return APIResponse.success(data=serializer.data)
        except Exception as e:
            return legacy_domain_error_response(
                e, not_found_type=CommunicationNotFoundError
            )

    def put(self, request, pk):
        service = MessageService()
        try:
            item = service.update_email_template(pk, request.data)
            serializer = EmailTemplateSerializer(item)
            return APIResponse.success(
                data=serializer.data, message="Email template updated successfully."
            )
        except Exception as e:
            return legacy_domain_error_response(
                e, not_found_type=CommunicationNotFoundError
            )

    def delete(self, request, pk):
        service = MessageService()
        try:
            service.delete_email_template(pk)
            return APIResponse.success(message="Email template deleted successfully.")
        except Exception as e:
            return legacy_domain_error_response(
                e, not_found_type=CommunicationNotFoundError
            )
