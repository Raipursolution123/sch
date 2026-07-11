from rest_framework import serializers


class GeneralSettingsUpdateSerializer(serializers.Serializer):
    """Partial update — all fields optional; service enforces allowlist + rules."""

    name = serializers.CharField(required=False, allow_blank=True, max_length=100)
    email = serializers.CharField(required=False, allow_blank=True, max_length=100)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=50)
    address = serializers.CharField(required=False, allow_blank=True)
    dise_code = serializers.CharField(required=False, allow_blank=True, max_length=50)
    timezone = serializers.CharField(required=False, allow_blank=True)
    date_format = serializers.CharField(required=False, allow_blank=True)
    time_format = serializers.CharField(required=False, allow_blank=True)
    start_month = serializers.CharField(required=False, allow_blank=True)
    start_week = serializers.CharField(required=False, allow_blank=True)
    day_off = serializers.CharField(required=False, allow_blank=True)
    is_rtl = serializers.CharField(required=False, allow_blank=True)
    attendence_type = serializers.IntegerField(required=False)
    low_attendance_limit = serializers.FloatField(required=False)
    class_teacher = serializers.CharField(required=False, allow_blank=True)
    currency = serializers.CharField(required=False, allow_blank=True, max_length=50)
    currency_symbol = serializers.CharField(
        required=False, allow_blank=True, max_length=50
    )
    currency_place = serializers.CharField(required=False, allow_blank=True)
    collect_back_date_fees = serializers.IntegerField(required=False)
    fee_due_days = serializers.IntegerField(required=False)
    is_duplicate_fees_invoice = serializers.CharField(
        required=False, allow_blank=True, max_length=100
    )
    maintenance_mode = serializers.IntegerField(required=False)
    lock_grace_period = serializers.IntegerField(required=False)
    student_panel_login = serializers.IntegerField(required=False)
    parent_panel_login = serializers.IntegerField(required=False)
