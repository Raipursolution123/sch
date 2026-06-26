from django.db import models


class TransportFeemaster(models.Model):
    """Maps to `transport_feemaster` in db_current."""

    id = models.AutoField(primary_key=True)
    session_id = models.IntegerField(blank=False, null=False, db_index=True)
    month = models.CharField(max_length=50, blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    fine_amount = models.FloatField(blank=True, null=True, default=0.00)
    fine_type = models.CharField(max_length=50, blank=True, null=True)
    fine_percentage = models.FloatField(blank=True, null=True, default=0.00)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "transport_feemaster"

    def __str__(self):
        return f"TransportFeemaster {self.pk}"
