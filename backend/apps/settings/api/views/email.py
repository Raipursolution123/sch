from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from apps.communications.models.email_config import EmailConfig
from apps.settings.api.serializers.email import EmailConfigSerializer
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege
from apps.settings.api.views.common import SETTINGS_MODULE

CATEGORY = "email"

class EmailSettingsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        config = EmailConfig.objects.first()
        if not config:
            config = EmailConfig.objects.create(
                email_type="smtp",
                is_active="no",
                created_at=timezone.now()
            )
        serializer = EmailConfigSerializer(config)
        return APIResponse.success(data=serializer.data, message="Email configuration retrieved successfully")

    def put(self, request):
        config = EmailConfig.objects.first()
        if not config:
            config = EmailConfig.objects.create(
                email_type="smtp",
                is_active="no",
                created_at=timezone.now()
            )
        
        serializer = EmailConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(data=serializer.data, message="Email configuration updated successfully")
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
