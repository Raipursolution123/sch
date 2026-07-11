from rest_framework import serializers


class SessionCreateSerializer(serializers.Serializer):
    session = serializers.CharField(max_length=60)


class SessionUpdateSerializer(serializers.Serializer):
    session = serializers.CharField(max_length=60)
