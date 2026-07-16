from rest_framework import serializers


class VehicleRoutesSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    route_id = serializers.IntegerField()
    vehicle_id = serializers.IntegerField()
    created_at = serializers.DateTimeField(read_only=True)

    # Enriched fields:
    route_title = serializers.CharField(read_only=True, allow_null=True)
    route_from = serializers.CharField(read_only=True, allow_null=True)
    route_to = serializers.CharField(read_only=True, allow_null=True)
    vehicle_no = serializers.CharField(read_only=True, allow_null=True)
    vehicle_model = serializers.CharField(read_only=True, allow_null=True)
    driver_name = serializers.CharField(read_only=True, allow_null=True)


class VehicleRoutesCreateSerializer(serializers.Serializer):
    route_id = serializers.IntegerField()
    vehicle_id = serializers.IntegerField()


class VehicleRoutesUpdateSerializer(serializers.Serializer):
    route_id = serializers.IntegerField(required=False)
    vehicle_id = serializers.IntegerField(required=False)
