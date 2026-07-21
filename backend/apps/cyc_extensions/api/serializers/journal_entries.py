from rest_framework import serializers

from apps.cyc_extensions.models.cyc_entries import CycEntries
from apps.cyc_extensions.models.cyc_entryitems import CycEntryitems


class CycEntryitemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycEntryitems
        fields = [
            "id",
            "entry_id",
            "ledger_id",
            "amount",
            "dc",
            "reconciliation_date",
            "narration",
        ]


class CycEntriesSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = CycEntries
        fields = [
            "id",
            "tag_id",
            "entrytype_id",
            "number",
            "date",
            "dr_total",
            "cr_total",
            "notes",
            "transaction_id",
            "items",
        ]

    def get_items(self, obj):
        rows = CycEntryitems.objects.filter(entry_id=obj.id).order_by("id")
        return CycEntryitemsSerializer(rows, many=True).data


class CycEntriesCreateSerializer(serializers.Serializer):
    tag_id = serializers.IntegerField(required=False, allow_null=True)
    entrytype_id = serializers.IntegerField(required=True)
    number = serializers.IntegerField(required=False, allow_null=True)
    date = serializers.DateField(required=True)
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    transaction_id = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(child=serializers.DictField(), allow_empty=False)
