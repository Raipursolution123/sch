from rest_framework import serializers

from apps.communications.models.gmeet import Gmeet
from apps.communications.models.gmeet_settings import GmeetSettings
from apps.communications.models.gmeet_history import GmeetHistory


class GmeetSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GmeetSettings
        fields = ["id", "api_key", "api_secret", "use_api", "created_at"]
        read_only_fields = ["id", "created_at"]


class GmeetSerializer(serializers.ModelSerializer):
    class_sections = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    staff_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    
    # Extra read-only fields for UI
    create_for_name = serializers.CharField(read_only=True, default="")
    create_for_surname = serializers.CharField(read_only=True, default="")
    create_by_name = serializers.CharField(read_only=True, default="")
    create_by_surname = serializers.CharField(read_only=True, default="")
    create_by_employee_id = serializers.CharField(read_only=True, default="")
    create_by_role_name = serializers.CharField(read_only=True, default="")
    create_for_role_name = serializers.CharField(read_only=True, default="")
    total_viewers = serializers.IntegerField(read_only=True, default=0)
    sections_list = serializers.SerializerMethodField(read_only=True)
    staff_list = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Gmeet
        fields = [
            "id",
            "purpose",
            "staff_id",
            "created_id",
            "title",
            "date",
            "type",
            "api_data",
            "duration",
            "subject",
            "url",
            "session_id",
            "description",
            "timezone",
            "status",
            "created_at",
            "class_sections",
            "staff_ids",
            "create_for_name",
            "create_for_surname",
            "create_by_name",
            "create_by_surname",
            "create_by_employee_id",
            "create_by_role_name",
            "create_for_role_name",
            "total_viewers",
            "sections_list",
            "staff_list",
        ]
        read_only_fields = ["id", "created_at"]

    def get_sections_list(self, obj):
        return getattr(obj, "sections_list", [])

    def get_staff_list(self, obj):
        return getattr(obj, "staff_list", [])


class GmeetHistorySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(read_only=True, default="")
    admission_no = serializers.CharField(read_only=True, default="")
    roll_no = serializers.CharField(read_only=True, default="")
    staff_name = serializers.CharField(read_only=True, default="")
    employee_id = serializers.CharField(read_only=True, default="")
    role_name = serializers.CharField(read_only=True, default="")

    class Meta:
        model = GmeetHistory
        fields = [
            "id",
            "gmeet_id",
            "staff_id",
            "student_id",
            "total_hit",
            "created_at",
            "student_name",
            "admission_no",
            "roll_no",
            "staff_name",
            "employee_id",
            "role_name",
        ]
        read_only_fields = ["id", "created_at"]
