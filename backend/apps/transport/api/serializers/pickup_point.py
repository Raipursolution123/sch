from rest_framework import serializers


class PickupPointSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=255)
    latitude = serializers.CharField(max_length=100, allow_null=True, allow_blank=True, required=False)
    longitude = serializers.CharField(max_length=100, allow_null=True, allow_blank=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)


class PickupPointCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    latitude = serializers.CharField(max_length=100, allow_null=True, allow_blank=True, required=False)
    longitude = serializers.CharField(max_length=100, allow_null=True, allow_blank=True, required=False)


class PickupPointUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    latitude = serializers.CharField(max_length=100, allow_null=True, allow_blank=True, required=False)
    longitude = serializers.CharField(max_length=100, allow_null=True, allow_blank=True, required=False)
