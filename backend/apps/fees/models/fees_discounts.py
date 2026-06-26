from django.db import models


class FeesDiscounts(models.Model):
    """Maps to `fees_discounts` in db_current."""

    id = models.AutoField(primary_key=True)
    session_id = models.IntegerField(blank=True, null=True, db_index=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    code = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=20, blank=True, null=True)
    percentage = models.FloatField(blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=10, default='no')
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "fees_discounts"

    def __str__(self):
        return f"FeesDiscounts {self.pk}"
