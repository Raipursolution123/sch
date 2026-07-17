from rest_framework import serializers


class EnquirySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    contact = serializers.CharField(max_length=20)
    address = serializers.CharField(allow_blank=True, required=False)
    reference = serializers.CharField(max_length=20, allow_blank=True, required=False)
    date = serializers.DateField()
    description = serializers.CharField(
        max_length=500, allow_blank=True, required=False
    )
    follow_up_date = serializers.DateField()
    note = serializers.CharField(allow_blank=True, required=False)
    source = serializers.CharField(max_length=50, allow_blank=True, required=False)
    email = serializers.CharField(
        max_length=50, allow_blank=True, required=False, allow_null=True
    )
    assigned = serializers.IntegerField(required=False, allow_null=True)
    class_id = serializers.IntegerField(required=False, allow_null=True)
    no_of_child = serializers.CharField(
        max_length=11, allow_blank=True, required=False, allow_null=True
    )
    status = serializers.CharField(max_length=100, allow_blank=True, required=False)
    created_by = serializers.IntegerField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    referral_staff = serializers.CharField(
        max_length=44, allow_blank=True, required=False, allow_null=True
    )
    is_converted_to_admission = serializers.IntegerField(required=False)


class EnquiryCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    contact = serializers.CharField(max_length=20)
    address = serializers.CharField(allow_blank=True, required=False, default="")
    reference = serializers.CharField(
        max_length=20, allow_blank=True, required=False, default=""
    )
    date = serializers.DateField(required=False)
    description = serializers.CharField(
        max_length=500, allow_blank=True, required=False, default=""
    )
    follow_up_date = serializers.DateField(required=False)
    note = serializers.CharField(allow_blank=True, required=False, default="")
    source = serializers.CharField(
        max_length=50, allow_blank=True, required=False, default=""
    )
    email = serializers.CharField(
        max_length=50, allow_blank=True, required=False, allow_null=True
    )
    assigned = serializers.IntegerField(required=False, allow_null=True)
    class_id = serializers.IntegerField(required=False, allow_null=True)
    no_of_child = serializers.CharField(
        max_length=11, allow_blank=True, required=False, allow_null=True
    )
    status = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default="active"
    )
    referral_staff = serializers.CharField(
        max_length=44, allow_blank=True, required=False, allow_null=True
    )
    is_converted_to_admission = serializers.IntegerField(required=False, default=0)


class EnquiryUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100, required=False)
    contact = serializers.CharField(max_length=20, required=False)
    address = serializers.CharField(allow_blank=True, required=False)
    reference = serializers.CharField(max_length=20, allow_blank=True, required=False)
    date = serializers.DateField(required=False)
    description = serializers.CharField(
        max_length=500, allow_blank=True, required=False
    )
    follow_up_date = serializers.DateField(required=False)
    note = serializers.CharField(allow_blank=True, required=False)
    source = serializers.CharField(max_length=50, allow_blank=True, required=False)
    email = serializers.CharField(
        max_length=50, allow_blank=True, required=False, allow_null=True
    )
    assigned = serializers.IntegerField(required=False, allow_null=True)
    class_id = serializers.IntegerField(required=False, allow_null=True)
    no_of_child = serializers.CharField(
        max_length=11, allow_blank=True, required=False, allow_null=True
    )
    status = serializers.CharField(max_length=100, allow_blank=True, required=False)
    referral_staff = serializers.CharField(
        max_length=44, allow_blank=True, required=False, allow_null=True
    )
    is_converted_to_admission = serializers.IntegerField(required=False)
