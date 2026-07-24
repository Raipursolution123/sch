from rest_framework import serializers


class ComplaintSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    complaint_type = serializers.CharField(max_length=255, allow_blank=True, required=False)
    source = serializers.CharField(max_length=255, allow_blank=True, required=False)
    name = serializers.CharField(max_length=100)
    contact = serializers.CharField(max_length=15, allow_blank=True, required=False)
    email = serializers.CharField(max_length=200, allow_blank=True, required=False)
    date = serializers.DateField()
    description = serializers.CharField(allow_blank=True, required=False)
    action_taken = serializers.CharField(max_length=200, allow_blank=True, required=False)
    assigned = serializers.CharField(max_length=50, allow_blank=True, required=False)
    note = serializers.CharField(allow_blank=True, required=False)
    image = serializers.CharField(max_length=100, allow_blank=True, required=False, allow_null=True)


class ComplaintCreateSerializer(serializers.Serializer):
    complaint_type = serializers.CharField(max_length=255, allow_blank=True, required=False, default="")
    source = serializers.CharField(max_length=255, allow_blank=True, required=False, default="")
    name = serializers.CharField(max_length=100)
    contact = serializers.CharField(max_length=15, allow_blank=True, required=False, default="")
    email = serializers.CharField(max_length=200, allow_blank=True, required=False, default="")
    date = serializers.DateField()
    description = serializers.CharField(allow_blank=True, required=False, default="")
    action_taken = serializers.CharField(max_length=200, allow_blank=True, required=False, default="")
    assigned = serializers.CharField(max_length=50, allow_blank=True, required=False, default="")
    note = serializers.CharField(allow_blank=True, required=False, default="")
    image = serializers.CharField(max_length=100, allow_blank=True, required=False, allow_null=True)


class ComplaintUpdateSerializer(serializers.Serializer):
    complaint_type = serializers.CharField(max_length=255, allow_blank=True, required=False)
    source = serializers.CharField(max_length=255, allow_blank=True, required=False)
    name = serializers.CharField(max_length=100, required=False)
    contact = serializers.CharField(max_length=15, allow_blank=True, required=False)
    email = serializers.CharField(max_length=200, allow_blank=True, required=False)
    date = serializers.DateField(required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    action_taken = serializers.CharField(max_length=200, allow_blank=True, required=False)
    assigned = serializers.CharField(max_length=50, allow_blank=True, required=False)
    note = serializers.CharField(allow_blank=True, required=False)
    image = serializers.CharField(max_length=100, allow_blank=True, required=False, allow_null=True)
