from django.db import models


class Currencies(models.Model):
    """Maps to `currencies` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    short_name = models.CharField(max_length=100, blank=True, null=True)
    symbol = models.CharField(max_length=10, blank=True, null=True)
    base_price = models.CharField(max_length=10, default=1)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "currencies"

    def __str__(self):
        return f"Currencies {self.pk}"
