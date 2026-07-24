from rest_framework import serializers


class RoutePickupPointSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    transport_route_id = serializers.IntegerField()
    pickup_point_id = serializers.IntegerField()
    fees = serializers.FloatField(required=False, allow_null=True, default=0.0)
    destination_distance = serializers.FloatField(required=False, allow_null=True, default=0.0)
    pickup_time = serializers.TimeField(required=False, allow_null=True)
    order_number = serializers.CharField(max_length=50, allow_blank=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)


class RoutePickupPointCreateSerializer(serializers.Serializer):
    transport_route_id = serializers.IntegerField()
    pickup_point_id = serializers.IntegerField()
    fees = serializers.FloatField(required=False, allow_null=True, default=0.0)
    destination_distance = serializers.FloatField(required=False, allow_null=True, default=0.0)
    pickup_time = serializers.TimeField(required=False, allow_null=True)
    order_number = serializers.CharField(max_length=50, allow_blank=True, required=False, default="")


class RoutePickupPointUpdateSerializer(serializers.Serializer):
    fees = serializers.FloatField(required=False, allow_null=True)
    destination_distance = serializers.FloatField(required=False, allow_null=True)
    pickup_time = serializers.TimeField(required=False, allow_null=True)
    order_number = serializers.CharField(max_length=50, allow_blank=True, required=False)
