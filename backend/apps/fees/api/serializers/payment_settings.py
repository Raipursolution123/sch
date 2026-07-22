from rest_framework import serializers
from apps.fees.models.payment_settings import PaymentSettings

class PaymentSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentSettings
        fields = '__all__'
        read_only_fields = ['id', 'payment_type', 'created_at', 'updated_at']
