from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.communications.models.notification_setting import NotificationSetting
from apps.settings.api.serializers.notifications import NotificationSettingSerializer
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege
from apps.settings.api.views.common import SETTINGS_MODULE

CATEGORY = "notifications"

class NotificationSettingsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        configs = NotificationSetting.objects.all().order_by('id')
        serializer = NotificationSettingSerializer(configs, many=True)
        return APIResponse.success(data=serializer.data, message="Notification settings retrieved successfully")

class NotificationSettingsDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def put(self, request, pk):
        try:
            config = NotificationSetting.objects.get(pk=pk)
        except NotificationSetting.DoesNotExist:
            return APIResponse.error(message="Notification setting not found", status_code=status.HTTP_404_NOT_FOUND)

        serializer = NotificationSettingSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(data=serializer.data, message="Notification setting updated successfully")
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
