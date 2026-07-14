from rest_framework import serializers


class TransportRouteSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    route_title = serializers.CharField(max_length=100, allow_null=True, allow_blank=True, required=False)
    route_from = serializers.CharField(max_length=255, allow_null=True, allow_blank=True, required=False)
    route_to = serializers.CharField(max_length=255, allow_null=True, allow_blank=True, required=False)
    route_distance = serializers.FloatField(allow_null=True, required=False)
    no_of_vehicle = serializers.IntegerField(allow_null=True, required=False)
    note = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    is_active = serializers.CharField(max_length=255, allow_null=True, allow_blank=True, required=False, default='no')
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateField(allow_null=True, required=False)


class TransportRouteCreateSerializer(serializers.Serializer):
    route_title = serializers.CharField(max_length=100, allow_null=True, allow_blank=True, required=False)
    route_from = serializers.CharField(max_length=255, allow_null=True, allow_blank=True, required=False)
    route_to = serializers.CharField(max_length=255, allow_null=True, allow_blank=True, required=False)
    route_distance = serializers.FloatField(allow_null=True, required=False)
    no_of_vehicle = serializers.IntegerField(allow_null=True, required=False)
    note = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    is_active = serializers.CharField(max_length=255, allow_null=True, allow_blank=True, required=False, default='no')


class TransportRouteUpdateSerializer(serializers.Serializer):
    route_title = serializers.CharField(max_length=100, allow_null=True, allow_blank=True, required=False)
    route_from = serializers.CharField(max_length=255, allow_null=True, allow_blank=True, required=False)
    route_to = serializers.CharField(max_length=255, allow_null=True, allow_blank=True, required=False)
    route_distance = serializers.FloatField(allow_null=True, required=False)
    no_of_vehicle = serializers.IntegerField(allow_null=True, required=False)
    note = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    is_active = serializers.CharField(max_length=255, allow_null=True, allow_blank=True, required=False)
