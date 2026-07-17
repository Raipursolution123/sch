from rest_framework import serializers
from apps.cyc_extensions.models.cyc_ledgers import CycLedgers

class CycLedgersSerializer(serializers.ModelSerializer):
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True, allow_null=True, default="")
    is_link_to_transport_fee = serializers.IntegerField(required=False, default=0)

    class Meta:
        model = CycLedgers
        fields = '__all__'
