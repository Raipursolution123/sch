from rest_framework import serializers

from apps.communications.models.email_template import EmailTemplate


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = ["id", "title", "message", "created_at"]
        read_only_fields = ["id", "created_at"]
