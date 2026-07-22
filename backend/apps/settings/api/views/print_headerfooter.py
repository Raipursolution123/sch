from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from apps.settings.models.print_headerfooter import PrintHeaderfooter
from apps.settings.api.serializers.print_headerfooter import PrintHeaderfooterSerializer
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege
from apps.settings.api.views.common import SETTINGS_MODULE

CATEGORY = "print_header_footer"

class PrintHeaderFooterListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        configs = PrintHeaderfooter.objects.all().order_by('id')
        serializer = PrintHeaderfooterSerializer(configs, many=True)
        return APIResponse.success(data=serializer.data, message="Print templates retrieved successfully")

    def post(self, request):
        serializer = PrintHeaderfooterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                created_by=request.user.id or 1,
                entry_date=timezone.now(),
                created_at=timezone.now()
            )
            return APIResponse.success(data=serializer.data, message="Print template created successfully", status_code=status.HTTP_201_CREATED)
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

class PrintHeaderFooterDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            config = PrintHeaderfooter.objects.get(pk=pk)
        except PrintHeaderfooter.DoesNotExist:
            return APIResponse.error(message="Print template not found", status_code=status.HTTP_404_NOT_FOUND)

        serializer = PrintHeaderfooterSerializer(config)
        return APIResponse.success(data=serializer.data, message="Print template retrieved successfully")

    def put(self, request, pk):
        try:
            config = PrintHeaderfooter.objects.get(pk=pk)
        except PrintHeaderfooter.DoesNotExist:
            return APIResponse.error(message="Print template not found", status_code=status.HTTP_404_NOT_FOUND)

        serializer = PrintHeaderfooterSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(data=serializer.data, message="Print template updated successfully")
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            config = PrintHeaderfooter.objects.get(pk=pk)
        except PrintHeaderfooter.DoesNotExist:
            return APIResponse.error(message="Print template not found", status_code=status.HTTP_404_NOT_FOUND)

        config.delete()
        return APIResponse.success(message="Print template deleted successfully")
