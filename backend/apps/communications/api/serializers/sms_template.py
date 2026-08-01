from rest_framework import serializers

from apps.communications.models.sms_template import SmsTemplate


class SmsTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmsTemplate
        fields = ["id", "title", "message", "created_at"]
        read_only_fields = ["id", "created_at"]
