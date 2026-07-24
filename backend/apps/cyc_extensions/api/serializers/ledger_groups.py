from rest_framework import serializers

from apps.cyc_extensions.models.cyc_groups import CycGroups


class CycGroupsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycGroups
        fields = "__all__"
