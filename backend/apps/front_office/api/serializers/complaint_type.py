from rest_framework import serializers


class ComplaintTypeSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    complaint_type = serializers.CharField(max_length=100)
    description = serializers.CharField(allow_blank=True, required=False, default="")
    created_at = serializers.DateTimeField(read_only=True)
