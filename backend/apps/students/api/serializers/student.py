from rest_framework import serializers


class StudentCreateSerializer(serializers.Serializer):
    admission_no = serializers.CharField(max_length=100)
    admission_date = serializers.CharField(required=False, allow_blank=True)
    roll_no = serializers.IntegerField(required=False, allow_null=True)
    firstname = serializers.CharField(max_length=100)
    middlename = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, max_length=255
    )
    lastname = serializers.CharField(max_length=100)
    gender = serializers.CharField(required=False, allow_blank=True, max_length=100)
    mobileno = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    dob = serializers.CharField(required=False, allow_blank=True)
    class_id = serializers.IntegerField()
    section_id = serializers.IntegerField()
    father_name = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    mother_name = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    guardian_name = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    guardian_phone = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    current_address = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    blood_group = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    religion = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    category_id = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    rte = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.CharField(required=False, allow_blank=True)


class StudentUpdateSerializer(StudentCreateSerializer):
    admission_no = serializers.CharField(
        required=False, allow_blank=True, max_length=100
    )
    firstname = serializers.CharField(required=False, allow_blank=True, max_length=100)
    lastname = serializers.CharField(required=False, allow_blank=True, max_length=100)
    class_id = serializers.IntegerField(required=False)
    section_id = serializers.IntegerField(required=False)
