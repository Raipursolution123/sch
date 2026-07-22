from rest_framework import serializers


class CertificateSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    certificate_name = serializers.CharField(max_length=100)
    certificate_text = serializers.CharField()
    left_header = serializers.CharField(max_length=100, allow_blank=True, required=False)
    center_header = serializers.CharField(max_length=100, allow_blank=True, required=False)
    right_header = serializers.CharField(max_length=100, allow_blank=True, required=False)
    left_footer = serializers.CharField(max_length=100, allow_blank=True, required=False)
    right_footer = serializers.CharField(max_length=100, allow_blank=True, required=False)
    center_footer = serializers.CharField(max_length=100, allow_blank=True, required=False)
    background_image = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    created_for = serializers.IntegerField()
    status = serializers.IntegerField()
    header_height = serializers.IntegerField()
    content_height = serializers.IntegerField()
    footer_height = serializers.IntegerField()
    content_width = serializers.IntegerField()
    enable_student_image = serializers.IntegerField()
    enable_image_height = serializers.IntegerField()
    created_at = serializers.DateTimeField(read_only=True, allow_null=True)
    updated_at = serializers.DateField(read_only=True, allow_null=True)


class CertificateCreateSerializer(serializers.Serializer):
    certificate_name = serializers.CharField(max_length=100)
    certificate_text = serializers.CharField()
    left_header = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    center_header = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    right_header = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    left_footer = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    right_footer = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    center_footer = serializers.CharField(
        max_length=100, allow_blank=True, required=False, default=""
    )
    background_image = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    created_for = serializers.IntegerField(required=False, default=2)
    status = serializers.IntegerField(required=False, default=1)
    header_height = serializers.IntegerField(required=False, default=100)
    content_height = serializers.IntegerField(required=False, default=250)
    footer_height = serializers.IntegerField(required=False, default=100)
    content_width = serializers.IntegerField(required=False, default=800)
    enable_student_image = serializers.IntegerField(required=False, default=0)
    enable_image_height = serializers.IntegerField(required=False, default=100)


class CertificateUpdateSerializer(serializers.Serializer):
    certificate_name = serializers.CharField(max_length=100, required=False)
    certificate_text = serializers.CharField(required=False)
    left_header = serializers.CharField(max_length=100, allow_blank=True, required=False)
    center_header = serializers.CharField(
        max_length=100, allow_blank=True, required=False
    )
    right_header = serializers.CharField(
        max_length=100, allow_blank=True, required=False
    )
    left_footer = serializers.CharField(max_length=100, allow_blank=True, required=False)
    right_footer = serializers.CharField(
        max_length=100, allow_blank=True, required=False
    )
    center_footer = serializers.CharField(
        max_length=100, allow_blank=True, required=False
    )
    background_image = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    created_for = serializers.IntegerField(required=False)
    status = serializers.IntegerField(required=False)
    header_height = serializers.IntegerField(required=False)
    content_height = serializers.IntegerField(required=False)
    footer_height = serializers.IntegerField(required=False)
    content_width = serializers.IntegerField(required=False)
    enable_student_image = serializers.IntegerField(required=False)
    enable_image_height = serializers.IntegerField(required=False)


class CertificateGenerateSerializer(serializers.Serializer):
    certificate_id = serializers.IntegerField()
    student_id = serializers.IntegerField()


class CertificatePreviewSerializer(serializers.Serializer):
    certificate_id = serializers.IntegerField()
    certificate_name = serializers.CharField()
    student_id = serializers.IntegerField()
    student_name = serializers.CharField(allow_blank=True)
    left_header = serializers.CharField(allow_blank=True)
    center_header = serializers.CharField(allow_blank=True)
    right_header = serializers.CharField(allow_blank=True)
    left_footer = serializers.CharField(allow_blank=True)
    center_footer = serializers.CharField(allow_blank=True)
    right_footer = serializers.CharField(allow_blank=True)
    certificate_text = serializers.CharField()
    background_image = serializers.CharField(allow_null=True, required=False)
    header_height = serializers.IntegerField()
    content_height = serializers.IntegerField()
    footer_height = serializers.IntegerField()
    content_width = serializers.IntegerField()
    enable_student_image = serializers.IntegerField()
    enable_image_height = serializers.IntegerField()
    student_image = serializers.CharField(allow_null=True, required=False)
