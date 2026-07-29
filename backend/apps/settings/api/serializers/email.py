from rest_framework import serializers

from apps.communications.models.email_config import EmailConfig


class EmailConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailConfig
        fields = "__all__"
