from django.db import models


class ItemStock(models.Model):
    """Maps to `item_stock` in db_current."""

    id = models.AutoField(primary_key=True)
    item_id = models.IntegerField(blank=True, null=True, db_index=True)
    supplier_id = models.IntegerField(blank=True, null=True, db_index=True)
    store_id = models.IntegerField(blank=True, null=True, db_index=True)
    symbol = models.CharField(max_length=10, default='+')
    quantity = models.IntegerField(blank=True, null=True)
    purchase_price = models.FloatField()
    date = models.DateField()
    attachment = models.CharField(max_length=250, blank=True, null=True)
    description = models.TextField()
    is_active = models.CharField(max_length=10, blank=True, null=True, default='yes')
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "item_stock"

    def __str__(self):
        return f"ItemStock {self.pk}"
