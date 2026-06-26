from django.db import models


class CycEntryitems(models.Model):
    """Maps to `cyc_entryitems` in db_current."""

    id = models.AutoField(primary_key=True)
    entry_id = models.IntegerField(blank=False, null=False, db_index=True)
    ledger_id = models.IntegerField(blank=False, null=False, db_index=True)
    amount = models.DecimalField(max_digits=25, decimal_places=2, default=0.00)
    dc = models.TextField()
    reconciliation_date = models.DateField(blank=True, null=True)
    narration = models.CharField(max_length=500)

    class Meta:
        managed = False
        db_table = "cyc_entryitems"

    def __str__(self):
        return f"CycEntryitems {self.pk}"
