from rest_framework import serializers

from apps.cyc_extensions.models.cyc_entrytypes import CycEntrytypes


class CycEntrytypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycEntrytypes
        fields = "__all__"
