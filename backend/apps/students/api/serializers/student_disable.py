from rest_framework import serializers


class StudentDisableSerializer(serializers.Serializer):
    disable_reason_id = serializers.IntegerField(min_value=1)
    dis_note = serializers.CharField(required=False, allow_blank=True, default="")
