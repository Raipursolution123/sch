from rest_framework import serializers


class TransportFeeMasterSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    session_id = serializers.IntegerField()
    month = serializers.CharField(max_length=50, allow_null=True, allow_blank=True, required=False)
    due_date = serializers.DateField(allow_null=True, required=False)
    fine_amount = serializers.FloatField(allow_null=True, required=False, default=0.00)
    fine_type = serializers.CharField(max_length=50, allow_null=True, allow_blank=True, required=False)
    fine_percentage = serializers.FloatField(allow_null=True, required=False, default=0.00)
    created_at = serializers.DateTimeField(read_only=True)


class TransportFeeMasterCreateSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    month = serializers.CharField(max_length=50, allow_null=True, allow_blank=True, required=False)
    due_date = serializers.DateField(allow_null=True, required=False)
    fine_amount = serializers.FloatField(allow_null=True, required=False, default=0.00)
    fine_type = serializers.CharField(max_length=50, allow_null=True, allow_blank=True, required=False)
    fine_percentage = serializers.FloatField(allow_null=True, required=False, default=0.00)


class TransportFeeMasterUpdateSerializer(serializers.Serializer):
    session_id = serializers.IntegerField(required=False)
    month = serializers.CharField(max_length=50, allow_null=True, allow_blank=True, required=False)
    due_date = serializers.DateField(allow_null=True, required=False)
    fine_amount = serializers.FloatField(allow_null=True, required=False)
    fine_type = serializers.CharField(max_length=50, allow_null=True, allow_blank=True, required=False)
    fine_percentage = serializers.FloatField(allow_null=True, required=False)
