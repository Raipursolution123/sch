from rest_framework import serializers


class StudentDisableSerializer(serializers.Serializer):
    disable_reason_id = serializers.IntegerField(required=False, allow_null=True)
    dis_note = serializers.CharField(required=False, allow_blank=True, default="")
