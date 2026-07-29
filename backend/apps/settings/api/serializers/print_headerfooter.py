from rest_framework import serializers

from apps.settings.models.print_headerfooter import PrintHeaderfooter


class PrintHeaderfooterSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrintHeaderfooter
        fields = "__all__"
        read_only_fields = ["id", "created_by", "entry_date", "created_at"]
