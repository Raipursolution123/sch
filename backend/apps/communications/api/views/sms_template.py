from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.communications.api.serializers.sms_template import SmsTemplateSerializer
from apps.communications.services.message_service import (
    CommunicationNotFoundError,
    MessageService,
)
from common.exceptions.legacy_errors import legacy_domain_error_response
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


class SmsTemplateListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "sms_template"

    def get(self, request):
        service = MessageService()
        qs = service.list_sms_templates()
        serializer = SmsTemplateSerializer(qs, many=True)
        return APIResponse.success(data=serializer.data)

    def post(self, request):
        service = MessageService()
        try:
            item = service.create_sms_template(request.data)
            serializer = SmsTemplateSerializer(item)
            return APIResponse.success(
                data=serializer.data,
                message="SMS template created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return legacy_domain_error_response(
                e, not_found_type=CommunicationNotFoundError
            )


class SmsTemplateDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "sms_template"

    def get(self, request, pk):
        service = MessageService()
        try:
            item = service.get_sms_template(pk)
            serializer = SmsTemplateSerializer(item)
            return APIResponse.success(data=serializer.data)
        except Exception as e:
            return legacy_domain_error_response(
                e, not_found_type=CommunicationNotFoundError
            )

    def put(self, request, pk):
        service = MessageService()
        try:
            item = service.update_sms_template(pk, request.data)
            serializer = SmsTemplateSerializer(item)
            return APIResponse.success(
                data=serializer.data, message="SMS template updated successfully."
            )
        except Exception as e:
            return legacy_domain_error_response(
                e, not_found_type=CommunicationNotFoundError
            )

    def delete(self, request, pk):
        service = MessageService()
        try:
            service.delete_sms_template(pk)
            return APIResponse.success(message="SMS template deleted successfully.")
        except Exception as e:
            return legacy_domain_error_response(
                e, not_found_type=CommunicationNotFoundError
            )
