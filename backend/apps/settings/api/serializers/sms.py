from rest_framework import serializers
from apps.communications.models.sms_config import SmsConfig

class SmsConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmsConfig
        fields = '__all__'
