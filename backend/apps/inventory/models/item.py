from django.db import models


class Item(models.Model):
    """Maps to `item` in db_current."""

    id = models.AutoField(primary_key=True)
    item_category_id = models.IntegerField(blank=True, null=True, db_index=True)
    item_store_id = models.IntegerField(blank=True, null=True, db_index=True)
    item_supplier_id = models.IntegerField(blank=True, null=True, db_index=True)
    name = models.CharField(max_length=255)
    unit = models.CharField(max_length=100)
    item_photo = models.CharField(max_length=225, blank=True, null=True)
    description = models.TextField()
    quantity = models.IntegerField()
    date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "item"

    def __str__(self):
        return f"Item {self.pk}"
