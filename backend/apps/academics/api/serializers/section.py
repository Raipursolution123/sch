from rest_framework import serializers


class SectionCreateSerializer(serializers.Serializer):
    section_name = serializers.CharField(max_length=60)


class SectionUpdateSerializer(serializers.Serializer):
    section_name = serializers.CharField(
        required=False, allow_blank=True, max_length=60
    )
    is_active = serializers.CharField(required=False, allow_blank=True)
