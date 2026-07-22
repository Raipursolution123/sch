from rest_framework import serializers


class ContentTypeSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=200, allow_blank=True, allow_null=True)
    description = serializers.CharField(allow_blank=True, allow_null=True)
    is_active = serializers.IntegerField(allow_null=True)
    created_at = serializers.DateTimeField(read_only=True, allow_null=True)


class ContentTypeCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(
        allow_blank=True, required=False, default="", allow_null=True
    )
    is_active = serializers.IntegerField(required=False, default=1)


class ContentTypeUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200, required=False)
    description = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    is_active = serializers.IntegerField(required=False)


class UploadContentSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    content_type_id = serializers.IntegerField()
    class_id = serializers.IntegerField(allow_null=True)
    section_id = serializers.IntegerField(allow_null=True)
    subject_id = serializers.IntegerField(allow_null=True)
    lesson_id = serializers.IntegerField(allow_null=True)
    image = serializers.CharField(allow_blank=True, allow_null=True)
    thumb_path = serializers.CharField(allow_blank=True, allow_null=True)
    dir_path = serializers.CharField(allow_blank=True, allow_null=True)
    real_name = serializers.CharField()
    img_name = serializers.CharField(allow_blank=True, allow_null=True)
    thumb_name = serializers.CharField(allow_blank=True, allow_null=True)
    file_type = serializers.CharField()
    mime_type = serializers.CharField()
    file_size = serializers.CharField()
    vid_url = serializers.CharField(allow_blank=True)
    vid_title = serializers.CharField(allow_blank=True)
    upload_by = serializers.IntegerField()
    created_at = serializers.DateTimeField(read_only=True, allow_null=True)


class UploadContentCreateSerializer(serializers.Serializer):
    content_type_id = serializers.IntegerField()
    real_name = serializers.CharField()
    class_id = serializers.IntegerField(required=False, allow_null=True)
    section_id = serializers.IntegerField(required=False, allow_null=True)
    subject_id = serializers.IntegerField(required=False, allow_null=True)
    lesson_id = serializers.IntegerField(required=False, allow_null=True)
    image = serializers.CharField(required=False, allow_blank=True, default="")
    thumb_path = serializers.CharField(required=False, allow_blank=True, default="")
    dir_path = serializers.CharField(required=False, allow_blank=True, default="")
    img_name = serializers.CharField(required=False, allow_blank=True, default="")
    thumb_name = serializers.CharField(required=False, allow_blank=True, default="")
    file_type = serializers.CharField(required=False, default="file")
    mime_type = serializers.CharField(required=False, default="application/octet-stream")
    file_size = serializers.CharField(required=False, default="0")
    vid_url = serializers.CharField(required=False, allow_blank=True, default="")
    vid_title = serializers.CharField(required=False, allow_blank=True, default="")
