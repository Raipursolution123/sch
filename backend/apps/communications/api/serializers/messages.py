from rest_framework import serializers

from apps.communications.models.messages import Messages


class MessagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Messages
        fields = [
            "id",
            "title",
            "send_through",
            "message",
            "send_mail",
            "send_sms",
            "is_group",
            "is_individual",
            "is_class",
            "is_schedule",
            "sent",
            "schedule_date_time",
            "group_list",
            "user_list",
            "schedule_class",
            "schedule_section",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
