from rest_framework import serializers


class HostelSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    hostel_name = serializers.CharField(max_length=100)
    type = serializers.CharField(max_length=50, allow_null=True, allow_blank=True, required=False)
    address = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    intake = serializers.IntegerField(allow_null=True, required=False)
    description = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    hostel_incharge = serializers.CharField(max_length=44, allow_null=True, allow_blank=True, required=False)
    is_active = serializers.CharField(max_length=255, default='no')
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateField(read_only=True)
    meal_type = serializers.CharField(allow_null=True, allow_blank=True, required=False)


class HostelCreateSerializer(serializers.Serializer):
    hostel_name = serializers.CharField(max_length=100)
    type = serializers.CharField(max_length=50, allow_null=True, allow_blank=True, required=False)
    address = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    intake = serializers.IntegerField(allow_null=True, required=False)
    description = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    hostel_incharge = serializers.CharField(max_length=44, allow_null=True, allow_blank=True, required=False)
    is_active = serializers.CharField(max_length=255, default='no', required=False)
    meal_type = serializers.CharField(allow_null=True, allow_blank=True, required=False)


class HostelUpdateSerializer(serializers.Serializer):
    hostel_name = serializers.CharField(max_length=100, required=False)
    type = serializers.CharField(max_length=50, allow_null=True, allow_blank=True, required=False)
    address = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    intake = serializers.IntegerField(allow_null=True, required=False)
    description = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    hostel_incharge = serializers.CharField(max_length=44, allow_null=True, allow_blank=True, required=False)
    is_active = serializers.CharField(max_length=255, required=False)
    meal_type = serializers.CharField(allow_null=True, allow_blank=True, required=False)


class HostelRoomSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    hostel_id = serializers.IntegerField(allow_null=True, required=False)
    room_type_id = serializers.IntegerField(allow_null=True, required=False)
    room_no = serializers.CharField(max_length=200)
    no_of_bed = serializers.IntegerField(allow_null=True, required=False)
    cost_per_bed = serializers.FloatField(default=0.0)
    cost_term = serializers.CharField(max_length=44, allow_null=True, allow_blank=True, required=False)
    title = serializers.CharField(max_length=200, allow_null=True, allow_blank=True, required=False)
    fee_title = serializers.CharField(max_length=44, allow_null=True, allow_blank=True, required=False)
    description = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)


class HostelRoomCreateSerializer(serializers.Serializer):
    hostel_id = serializers.IntegerField(allow_null=True, required=False)
    room_type_id = serializers.IntegerField(allow_null=True, required=False)
    room_no = serializers.CharField(max_length=200)
    no_of_bed = serializers.IntegerField(allow_null=True, required=False)
    cost_per_bed = serializers.FloatField(default=0.0, required=False)
    cost_term = serializers.CharField(max_length=44, allow_null=True, allow_blank=True, required=False)
    title = serializers.CharField(max_length=200, allow_null=True, allow_blank=True, required=False)
    fee_title = serializers.CharField(max_length=44, allow_null=True, allow_blank=True, required=False)
    description = serializers.CharField(allow_null=True, allow_blank=True, required=False)


class HostelRoomUpdateSerializer(serializers.Serializer):
    hostel_id = serializers.IntegerField(allow_null=True, required=False)
    room_type_id = serializers.IntegerField(allow_null=True, required=False)
    room_no = serializers.CharField(max_length=200, required=False)
    no_of_bed = serializers.IntegerField(allow_null=True, required=False)
    cost_per_bed = serializers.FloatField(required=False)
    cost_term = serializers.CharField(max_length=44, allow_null=True, allow_blank=True, required=False)
    title = serializers.CharField(max_length=200, allow_null=True, allow_blank=True, required=False)
    fee_title = serializers.CharField(max_length=44, allow_null=True, allow_blank=True, required=False)
    description = serializers.CharField(allow_null=True, allow_blank=True, required=False)


class RoomTypeSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    room_type = serializers.CharField(max_length=200)
    description = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateField(read_only=True)


class RoomTypeCreateSerializer(serializers.Serializer):
    room_type = serializers.CharField(max_length=200)
    description = serializers.CharField(allow_null=True, allow_blank=True, required=False)


class RoomTypeUpdateSerializer(serializers.Serializer):
    room_type = serializers.CharField(max_length=200, required=False)
    description = serializers.CharField(allow_null=True, allow_blank=True, required=False)


class HostelRoomBedSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    hostel_id = serializers.IntegerField()
    room_id = serializers.IntegerField(allow_null=True, required=False)
    room_number = serializers.CharField(max_length=44, allow_null=True, allow_blank=True, required=False)
    bed_code = serializers.CharField(max_length=44)
    bed_status = serializers.IntegerField(default=1)


class HostelRoomBedCreateSerializer(serializers.Serializer):
    hostel_id = serializers.IntegerField()
    room_id = serializers.IntegerField(allow_null=True, required=False)
    room_number = serializers.CharField(max_length=44, allow_null=True, allow_blank=True, required=False)
    bed_code = serializers.CharField(max_length=44)
    bed_status = serializers.IntegerField(default=1, required=False)


class HostelRoomBedUpdateSerializer(serializers.Serializer):
    hostel_id = serializers.IntegerField(required=False)
    room_id = serializers.IntegerField(allow_null=True, required=False)
    room_number = serializers.CharField(max_length=44, allow_null=True, allow_blank=True, required=False)
    bed_code = serializers.CharField(max_length=44, required=False)
    bed_status = serializers.IntegerField(required=False)

