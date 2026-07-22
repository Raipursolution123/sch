from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
from django.utils import timezone

from apps.fees.api.views.common import MODULE
from apps.fees.models.payment_settings import PaymentSettings
from apps.fees.api.serializers.payment_settings import PaymentSettingsSerializer
from apps.fees.services.payment_settings_service import PaymentSettingsService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "offline_bank_payments"

class PaymentGatewaysListView(APIView):
    """List of payment gateway settings (secrets masked)."""
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = PaymentSettingsService()
        qs = service.list_gateways()
        data = service.enrich_list(qs)
        return APIResponse.success(
            data=data, message="Payment gateways retrieved successfully."
        )

class PaymentGatewayDetailView(APIView):
    """Retrieve and Update specific payment gateway configuration."""
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            gateway = PaymentSettings.objects.get(pk=pk)
        except PaymentSettings.DoesNotExist:
            return APIResponse.error(message="Payment gateway not found", status_code=status.HTTP_404_NOT_FOUND)

        serializer = PaymentSettingsSerializer(gateway)
        return APIResponse.success(data=serializer.data, message="Payment gateway details retrieved.")

    def put(self, request, pk):
        try:
            gateway = PaymentSettings.objects.get(pk=pk)
        except PaymentSettings.DoesNotExist:
            return APIResponse.error(message="Payment gateway not found", status_code=status.HTTP_404_NOT_FOUND)

        serializer = PaymentSettingsSerializer(gateway, data=request.data, partial=True)
        if serializer.is_valid():
            is_active = request.data.get('is_active')
            if is_active == 'yes':
                PaymentSettings.objects.exclude(pk=pk).update(is_active='no')

            serializer.save(updated_at=timezone.now().date())
            return APIResponse.success(data=serializer.data, message="Payment gateway updated successfully.")
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
