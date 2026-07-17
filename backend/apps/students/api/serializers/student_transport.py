from rest_framework import serializers


class StudentTransportUpdateSerializer(serializers.Serializer):
    vehroute_id = serializers.IntegerField(
        required=False, allow_null=True, min_value=1
    )
    route_pickup_point_id = serializers.IntegerField(
        required=False, allow_null=True, min_value=1
    )
    transport_fees = serializers.FloatField(required=False, min_value=0)
