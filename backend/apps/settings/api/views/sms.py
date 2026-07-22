from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.communications.models.sms_config import SmsConfig
from apps.settings.api.serializers.sms import SmsConfigSerializer
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege
from apps.settings.api.views.common import SETTINGS_MODULE

CATEGORY = "sms"

class SmsSettingsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        configs = SmsConfig.objects.all().order_by('id')
        serializer = SmsConfigSerializer(configs, many=True)
        return APIResponse.success(data=serializer.data, message="SMS configurations retrieved successfully")

    def post(self, request):
        # Allow creating new custom SMS if needed, or updating
        serializer = SmsConfigSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(data=serializer.data, message="SMS configuration created successfully", status_code=status.HTTP_201_CREATED)
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

class SmsSettingsDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def put(self, request, pk):
        try:
            config = SmsConfig.objects.get(pk=pk)
        except SmsConfig.DoesNotExist:
            return APIResponse.error(message="SMS configuration not found", status_code=status.HTTP_404_NOT_FOUND)

        serializer = SmsConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            # If activating this provider, disable all others
            is_active_val = request.data.get('is_active')
            if is_active_val == 'enabled':
                SmsConfig.objects.exclude(pk=pk).update(is_active='disabled')
            
            serializer.save()
            return APIResponse.success(data=serializer.data, message=f"SMS provider '{config.name}' updated successfully")
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
