from django.db import models


class FeeReceiptNo(models.Model):
    """Maps to `fee_receipt_no` in db_current."""

    id = models.AutoField(primary_key=True)
    payment = models.IntegerField()

    class Meta:
        managed = False
        db_table = "fee_receipt_no"

    def __str__(self):
        return f"FeeReceiptNo {self.pk}"
