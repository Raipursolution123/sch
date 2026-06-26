from django.db import models


class ItemStore(models.Model):
    """Maps to `item_store` in db_current."""

    id = models.AutoField(primary_key=True)
    item_store = models.CharField(max_length=255)
    code = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "item_store"

    def __str__(self):
        return f"ItemStore {self.pk}"
