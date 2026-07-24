from rest_framework import serializers

from apps.cyc_extensions.models.cyc_tags import CycTags


class CycTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycTags
        fields = "__all__"
