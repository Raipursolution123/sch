from rest_framework import serializers


class SourceSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    source = serializers.CharField(max_length=100)
    description = serializers.CharField(allow_blank=True, required=False, default="")


class ReferenceSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    reference = serializers.CharField(max_length=100)
    description = serializers.CharField(allow_blank=True, required=False, default="")
