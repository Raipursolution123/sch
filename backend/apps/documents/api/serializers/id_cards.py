from rest_framework import serializers


class StudentIdCardSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=100)
    school_name = serializers.CharField(max_length=100, allow_blank=True)
    school_address = serializers.CharField(max_length=500, allow_blank=True)
    background = serializers.CharField(max_length=100, allow_blank=True)
    logo = serializers.CharField(max_length=100, allow_blank=True)
    sign_image = serializers.CharField(max_length=100, allow_blank=True)
    header_color = serializers.CharField(max_length=100, allow_blank=True)
    enable_vertical_card = serializers.IntegerField()
    enable_admission_no = serializers.IntegerField()
    enable_student_name = serializers.IntegerField()
    enable_class = serializers.IntegerField()
    enable_fathers_name = serializers.IntegerField()
    enable_mothers_name = serializers.IntegerField()
    enable_address = serializers.IntegerField()
    enable_phone = serializers.IntegerField()
    enable_dob = serializers.IntegerField()
    enable_blood_group = serializers.IntegerField()
    enable_student_barcode = serializers.IntegerField()
    status = serializers.IntegerField()


class StudentIdCardCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=100)
    school_name = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    school_address = serializers.CharField(
        max_length=500, allow_blank=True, required=False, default=""
    )
    background = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    logo = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    sign_image = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    header_color = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default="#0d6efd"
    )
    enable_vertical_card = serializers.IntegerField(required=False, default=0)
    enable_admission_no = serializers.IntegerField(required=False, default=1)
    enable_student_name = serializers.IntegerField(required=False, default=1)
    enable_class = serializers.IntegerField(required=False, default=1)
    enable_fathers_name = serializers.IntegerField(required=False, default=1)
    enable_mothers_name = serializers.IntegerField(required=False, default=0)
    enable_address = serializers.IntegerField(required=False, default=1)
    enable_phone = serializers.IntegerField(required=False, default=1)
    enable_dob = serializers.IntegerField(required=False, default=1)
    enable_blood_group = serializers.IntegerField(required=False, default=0)
    enable_student_barcode = serializers.IntegerField(required=False, default=1)
    status = serializers.IntegerField(required=False, default=1)


class StudentIdCardUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=100, required=False)
    school_name = serializers.CharField(max_length=100, allow_blank=True, required=False)
    school_address = serializers.CharField(
        max_length=500, allow_blank=True, required=False
    )
    background = serializers.CharField(max_length=100, allow_blank=True, required=False)
    logo = serializers.CharField(max_length=100, allow_blank=True, required=False)
    sign_image = serializers.CharField(max_length=100, allow_blank=True, required=False)
    header_color = serializers.CharField(max_length=100, allow_blank=True, required=False)
    enable_vertical_card = serializers.IntegerField(required=False)
    enable_admission_no = serializers.IntegerField(required=False)
    enable_student_name = serializers.IntegerField(required=False)
    enable_class = serializers.IntegerField(required=False)
    enable_fathers_name = serializers.IntegerField(required=False)
    enable_mothers_name = serializers.IntegerField(required=False)
    enable_address = serializers.IntegerField(required=False)
    enable_phone = serializers.IntegerField(required=False)
    enable_dob = serializers.IntegerField(required=False)
    enable_blood_group = serializers.IntegerField(required=False)
    enable_student_barcode = serializers.IntegerField(required=False)
    status = serializers.IntegerField(required=False)


class StaffIdCardSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=255)
    school_name = serializers.CharField(max_length=255, allow_blank=True)
    school_address = serializers.CharField(max_length=255, allow_blank=True)
    background = serializers.CharField(max_length=100, allow_blank=True)
    logo = serializers.CharField(max_length=100, allow_blank=True)
    sign_image = serializers.CharField(max_length=100, allow_blank=True)
    header_color = serializers.CharField(max_length=100, allow_blank=True)
    enable_vertical_card = serializers.IntegerField()
    enable_staff_role = serializers.IntegerField()
    enable_staff_id = serializers.IntegerField()
    enable_staff_department = serializers.IntegerField()
    enable_designation = serializers.IntegerField()
    enable_name = serializers.IntegerField()
    enable_fathers_name = serializers.IntegerField()
    enable_mothers_name = serializers.IntegerField()
    enable_date_of_joining = serializers.IntegerField()
    enable_permanent_address = serializers.IntegerField()
    enable_staff_dob = serializers.IntegerField()
    enable_staff_phone = serializers.IntegerField()
    enable_staff_barcode = serializers.IntegerField()
    status = serializers.IntegerField()


class StaffIdCardCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    school_name = serializers.CharField(
        max_length=255, allow_blank=True, required=False, default=""
    )
    school_address = serializers.CharField(
        max_length=255, allow_blank=True, required=False, default=""
    )
    background = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    logo = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    sign_image = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    header_color = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default="#0d6efd"
    )
    enable_vertical_card = serializers.IntegerField(required=False, default=0)
    enable_staff_role = serializers.IntegerField(required=False, default=1)
    enable_staff_id = serializers.IntegerField(required=False, default=1)
    enable_staff_department = serializers.IntegerField(required=False, default=1)
    enable_designation = serializers.IntegerField(required=False, default=1)
    enable_name = serializers.IntegerField(required=False, default=1)
    enable_fathers_name = serializers.IntegerField(required=False, default=0)
    enable_mothers_name = serializers.IntegerField(required=False, default=0)
    enable_date_of_joining = serializers.IntegerField(required=False, default=1)
    enable_permanent_address = serializers.IntegerField(required=False, default=1)
    enable_staff_dob = serializers.IntegerField(required=False, default=1)
    enable_staff_phone = serializers.IntegerField(required=False, default=1)
    enable_staff_barcode = serializers.IntegerField(required=False, default=1)
    status = serializers.IntegerField(required=False, default=1)


class StaffIdCardUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=False)
    school_name = serializers.CharField(max_length=255, allow_blank=True, required=False)
    school_address = serializers.CharField(
        max_length=255, allow_blank=True, required=False
    )
    background = serializers.CharField(max_length=100, allow_blank=True, required=False)
    logo = serializers.CharField(max_length=100, allow_blank=True, required=False)
    sign_image = serializers.CharField(max_length=100, allow_blank=True, required=False)
    header_color = serializers.CharField(max_length=100, allow_blank=True, required=False)
    enable_vertical_card = serializers.IntegerField(required=False)
    enable_staff_role = serializers.IntegerField(required=False)
    enable_staff_id = serializers.IntegerField(required=False)
    enable_staff_department = serializers.IntegerField(required=False)
    enable_designation = serializers.IntegerField(required=False)
    enable_name = serializers.IntegerField(required=False)
    enable_fathers_name = serializers.IntegerField(required=False)
    enable_mothers_name = serializers.IntegerField(required=False)
    enable_date_of_joining = serializers.IntegerField(required=False)
    enable_permanent_address = serializers.IntegerField(required=False)
    enable_staff_dob = serializers.IntegerField(required=False)
    enable_staff_phone = serializers.IntegerField(required=False)
    enable_staff_barcode = serializers.IntegerField(required=False)
    status = serializers.IntegerField(required=False)


class IdCardGenerateSerializer(serializers.Serializer):
    template_id = serializers.IntegerField()
    person_id = serializers.IntegerField()


class IdCardPreviewFieldSerializer(serializers.Serializer):
    label = serializers.CharField()
    value = serializers.CharField()


class IdCardPreviewSerializer(serializers.Serializer):
    kind = serializers.CharField()
    template_id = serializers.IntegerField()
    title = serializers.CharField()
    school_name = serializers.CharField(allow_blank=True)
    school_address = serializers.CharField(allow_blank=True)
    background = serializers.CharField(allow_blank=True)
    logo = serializers.CharField(allow_blank=True)
    sign_image = serializers.CharField(allow_blank=True)
    header_color = serializers.CharField(allow_blank=True)
    enable_vertical_card = serializers.IntegerField()
    person_id = serializers.IntegerField()
    person_name = serializers.CharField(allow_blank=True)
    photo = serializers.CharField(allow_null=True, required=False)
    barcode = serializers.CharField(allow_blank=True)
    fields = IdCardPreviewFieldSerializer(many=True)
