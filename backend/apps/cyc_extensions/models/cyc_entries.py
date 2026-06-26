from django.db import models


class CycEntries(models.Model):
    """Maps to `cyc_entries` in db_current."""

    id = models.AutoField(primary_key=True)
    tag_id = models.IntegerField(blank=True, null=True, db_index=True)
    entrytype_id = models.IntegerField(blank=False, null=False, db_index=True)
    number = models.BigIntegerField(blank=True, null=True)
    date = models.DateField()
    dr_total = models.DecimalField(max_digits=25, decimal_places=2, default=0.00)
    cr_total = models.DecimalField(max_digits=25, decimal_places=2, default=0.00)
    notes = models.CharField(max_length=500)
    transaction_id = models.TextField()

    class Meta:
        managed = False
        db_table = "cyc_entries"

    def __str__(self):
        return f"CycEntries {self.pk}"
