from django.db import models


class Categories(models.Model):
    """Maps to `categories` in db_current."""

    id = models.AutoField(primary_key=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "categories"

    def __str__(self):
        return f"Categories {self.pk}"
