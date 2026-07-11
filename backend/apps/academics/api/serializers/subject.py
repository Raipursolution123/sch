from rest_framework import serializers


class SubjectCreateUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=True, max_length=100)
    code = serializers.CharField(required=False, allow_blank=True, max_length=100)
    type = serializers.CharField(required=False, allow_blank=True, max_length=100)
    is_active = serializers.CharField(required=False, allow_blank=True)
    linked_class_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_empty=True
    )
    linked_class = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
