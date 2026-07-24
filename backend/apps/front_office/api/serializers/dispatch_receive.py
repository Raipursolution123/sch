from rest_framework import serializers


class DispatchReceiveSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    reference_no = serializers.CharField(max_length=50)
    to_title = serializers.CharField(max_length=100)
    type = serializers.CharField(max_length=10)
    address = serializers.CharField(max_length=500, allow_blank=True, required=False)
    note = serializers.CharField(max_length=500, allow_blank=True, required=False)
    from_title = serializers.CharField(max_length=200, allow_blank=True, required=False)
    date = serializers.DateField(required=False, allow_null=True)
    image = serializers.CharField(max_length=100, allow_blank=True, required=False, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)


class DispatchReceiveCreateSerializer(serializers.Serializer):
    reference_no = serializers.CharField(max_length=50)
    to_title = serializers.CharField(max_length=100)
    type = serializers.ChoiceField(choices=["dispatch", "receive"])
    address = serializers.CharField(max_length=500, allow_blank=True, required=False, default="")
    note = serializers.CharField(max_length=500, allow_blank=True, required=False, default="")
    from_title = serializers.CharField(max_length=200, allow_blank=True, required=False, default="")
    date = serializers.DateField(required=False, allow_null=True)
    image = serializers.CharField(max_length=100, allow_blank=True, required=False, allow_null=True)


class DispatchReceiveUpdateSerializer(serializers.Serializer):
    reference_no = serializers.CharField(max_length=50, required=False)
    to_title = serializers.CharField(max_length=100, required=False)
    type = serializers.ChoiceField(choices=["dispatch", "receive"], required=False)
    address = serializers.CharField(max_length=500, allow_blank=True, required=False)
    note = serializers.CharField(max_length=500, allow_blank=True, required=False)
    from_title = serializers.CharField(max_length=200, allow_blank=True, required=False)
    date = serializers.DateField(required=False, allow_null=True)
    image = serializers.CharField(max_length=100, allow_blank=True, required=False, allow_null=True)
