from rest_framework import serializers


class OnlineAdmissionSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    admission_no = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    roll_no = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    reference_no = serializers.CharField(max_length=50)
    admission_date = serializers.DateField(required=False, allow_null=True)
    firstname = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    middlename = serializers.CharField(max_length=255, allow_blank=True, required=False)
    lastname = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    rte = serializers.CharField(max_length=20, required=False, default="No")
    image = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    mobileno = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    email = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    state = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    city = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    pincode = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    religion = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    cast = serializers.CharField(max_length=50, allow_blank=True, required=False)
    dob = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    current_address = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    permanent_address = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    category_id = serializers.IntegerField(required=False, allow_null=True)
    class_section_id = serializers.IntegerField(required=False, allow_null=True)
    route_id = serializers.IntegerField(required=False, default=0)
    school_house_id = serializers.IntegerField(required=False, allow_null=True)
    blood_group = serializers.CharField(
        max_length=200, allow_blank=True, required=False
    )
    vehroute_id = serializers.IntegerField(required=False, default=0)
    hostel_room_id = serializers.IntegerField(required=False, allow_null=True)
    adhar_no = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    samagra_id = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    bank_account_no = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    bank_name = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    ifsc_code = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    guardian_is = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default="father"
    )
    father_name = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    father_phone = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    father_occupation = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    mother_name = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    mother_phone = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    mother_occupation = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    guardian_name = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    guardian_relation = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    guardian_phone = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    guardian_occupation = serializers.CharField(
        max_length=150, allow_blank=True, required=False
    )
    guardian_address = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    guardian_email = serializers.CharField(
        max_length=100, allow_blank=True, required=False
    )
    father_pic = serializers.CharField(max_length=255, allow_blank=True, required=False)
    mother_pic = serializers.CharField(max_length=255, allow_blank=True, required=False)
    guardian_pic = serializers.CharField(
        max_length=255, allow_blank=True, required=False
    )
    is_enroll = serializers.IntegerField(required=False, default=0)
    previous_school = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    height = serializers.CharField(max_length=100, allow_blank=True, required=False)
    weight = serializers.CharField(max_length=100, allow_blank=True, required=False)
    note = serializers.CharField(allow_blank=True, required=False)
    form_status = serializers.IntegerField(required=False, default=0)
    paid_status = serializers.IntegerField(required=False, default=0)
    measurement_date = serializers.DateField(required=False, allow_null=True)
    app_key = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    document = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    submit_date = serializers.DateField(required=False, allow_null=True)
    disable_at = serializers.DateField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateField(required=False, allow_null=True)


class OnlineAdmissionCreateSerializer(serializers.Serializer):
    admission_no = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    roll_no = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    reference_no = serializers.CharField(max_length=50)
    admission_date = serializers.DateField(required=False, allow_null=True)
    firstname = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    middlename = serializers.CharField(
        max_length=255, allow_blank=True, required=False, default=""
    )
    lastname = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    rte = serializers.CharField(max_length=20, required=False, default="No")
    image = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    mobileno = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    email = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    state = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    city = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    pincode = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    religion = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    cast = serializers.CharField(
        max_length=50, allow_blank=True, required=False, default=""
    )
    dob = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    current_address = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    permanent_address = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    category_id = serializers.IntegerField(required=False, allow_null=True)
    class_section_id = serializers.IntegerField(required=False, allow_null=True)
    route_id = serializers.IntegerField(required=False, default=0)
    school_house_id = serializers.IntegerField(required=False, allow_null=True)
    blood_group = serializers.CharField(
        max_length=200, allow_blank=True, required=False, default=""
    )
    vehroute_id = serializers.IntegerField(required=False, default=0)
    hostel_room_id = serializers.IntegerField(required=False, allow_null=True)
    adhar_no = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    samagra_id = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    bank_account_no = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    bank_name = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    ifsc_code = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    guardian_is = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default="father"
    )
    father_name = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    father_phone = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    father_occupation = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    mother_name = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    mother_phone = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    mother_occupation = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    guardian_name = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    guardian_relation = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    guardian_phone = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    guardian_occupation = serializers.CharField(
        max_length=150, allow_blank=True, required=False, default=""
    )
    guardian_address = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    guardian_email = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    father_pic = serializers.CharField(
        max_length=255, allow_blank=True, required=False, default=""
    )
    mother_pic = serializers.CharField(
        max_length=255, allow_blank=True, required=False, default=""
    )
    guardian_pic = serializers.CharField(
        max_length=255, allow_blank=True, required=False, default=""
    )
    is_enroll = serializers.IntegerField(required=False, default=0)
    previous_school = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    height = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    weight = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    note = serializers.CharField(allow_blank=True, required=False, default="")
    form_status = serializers.IntegerField(required=False, default=0)
    paid_status = serializers.IntegerField(required=False, default=0)
    measurement_date = serializers.DateField(required=False, allow_null=True)
    app_key = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    document = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    submit_date = serializers.DateField(required=False, allow_null=True)
    disable_at = serializers.DateField(required=False, allow_null=True)


class OnlineAdmissionUpdateSerializer(OnlineAdmissionCreateSerializer):
    reference_no = serializers.CharField(max_length=50, required=False)


class OnlineAdmissionConvertSerializer(serializers.Serializer):
    admission_no = serializers.CharField(
        max_length=100, required=False, allow_blank=True
    )
    roll_no = serializers.CharField(
        max_length=100, required=False, allow_blank=True, allow_null=True
    )
    admission_date = serializers.DateField(required=False, allow_null=True)
    class_id = serializers.IntegerField(required=False, allow_null=True)
    section_id = serializers.IntegerField(required=False, allow_null=True)
