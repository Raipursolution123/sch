from rest_framework import serializers
from apps.cyc_extensions.models.cyc_fee_head_ledger import CycFeeHeadLedger

class CycFeeHeadLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycFeeHeadLedger
        fields = '__all__'
