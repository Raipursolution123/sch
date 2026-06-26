from django.db import models


class ItemSupplier(models.Model):
    """Maps to `item_supplier` in db_current."""

    id = models.AutoField(primary_key=True)
    item_supplier = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    contact_person_name = models.CharField(max_length=255)
    contact_person_phone = models.CharField(max_length=255)
    contact_person_email = models.CharField(max_length=255)
    description = models.TextField()

    class Meta:
        managed = False
        db_table = "item_supplier"

    def __str__(self):
        return f"ItemSupplier {self.pk}"
