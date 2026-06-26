from django.db import models


class CycFeeHeadLedger(models.Model):
    """Maps to `cyc_fee_head_ledger` in db_current."""

    fhl_id = models.AutoField(primary_key=True)
    ledger_id = models.IntegerField(db_index=True)
    head_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = "cyc_fee_head_ledger"

    def __str__(self):
        return f"CycFeeHeadLedger {self.pk}"
