from django.db import models


class CycLedgers(models.Model):
    """Maps to `cyc_ledgers` in db_current."""

    id = models.AutoField(primary_key=True)
    group_id = models.BigIntegerField(db_index=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    op_balance = models.DecimalField(max_digits=25, decimal_places=2, default=0.00)
    op_balance_dc = models.TextField()
    type = models.IntegerField(default=0)
    reconciliation = models.IntegerField(default=0)
    feetype_id = models.IntegerField(blank=True, null=True, db_index=True)
    fee_types = models.TextField(blank=True, null=True)
    is_link_to_transport_fee = models.IntegerField()
    income_head_id = models.IntegerField(blank=True, null=True)
    expenses_head_id = models.IntegerField(blank=True, null=True)
    is_link_to_payroll = models.IntegerField(blank=True, null=True)
    notes = models.CharField(max_length=500)

    class Meta:
        managed = False
        db_table = "cyc_ledgers"

    def __str__(self):
        return f"CycLedgers {self.pk}"
