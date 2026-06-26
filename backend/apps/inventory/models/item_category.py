from django.db import models


class ItemCategory(models.Model):
    """Maps to `item_category` in db_current."""

    id = models.AutoField(primary_key=True)
    item_category = models.CharField(max_length=255)
    is_active = models.CharField(max_length=255, default='yes')
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "item_category"

    def __str__(self):
        return f"ItemCategory {self.pk}"
