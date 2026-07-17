from rest_framework import serializers
from apps.cyc_extensions.models.cyc_entries import CycEntries
from apps.cyc_extensions.models.cyc_entryitems import CycEntryitems

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
