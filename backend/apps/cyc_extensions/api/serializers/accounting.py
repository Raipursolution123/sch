from rest_framework import serializers
from apps.cyc_extensions.models.cyc_groups import CycGroups
from apps.cyc_extensions.models.cyc_ledgers import CycLedgers
from apps.cyc_extensions.models.cyc_entrytypes import CycEntrytypes
from apps.cyc_extensions.models.cyc_entries import CycEntries
from apps.cyc_extensions.models.cyc_entryitems import CycEntryitems
from apps.cyc_extensions.models.cyc_fee_head_ledger import CycFeeHeadLedger
from apps.cyc_extensions.models.cyc_tags import CycTags

class CycGroupsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycGroups
        fields = '__all__'

class CycLedgersSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycLedgers
        fields = '__all__'

class CycEntrytypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycEntrytypes
        fields = '__all__'

class CycEntryitemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycEntryitems
        fields = '__all__'

class CycEntriesSerializer(serializers.ModelSerializer):
    items = CycEntryitemsSerializer(many=True, read_only=True, source='cycentryitems_set')

    class Meta:
        model = CycEntries
        fields = '__all__'

class CycEntriesCreateSerializer(serializers.Serializer):
    tag_id = serializers.IntegerField(required=False, allow_null=True)
    entrytype_id = serializers.IntegerField(required=True)
    number = serializers.IntegerField(required=False, allow_null=True)
    date = serializers.DateField(required=True)
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    transaction_id = serializers.CharField(required=False, allow_blank=True)
    
    # Items
    items = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False
    )

class CycFeeHeadLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycFeeHeadLedger
        fields = '__all__'

class CycTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycTags
        fields = '__all__'
