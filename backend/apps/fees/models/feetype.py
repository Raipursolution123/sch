from django.db import models


class Feetype(models.Model):
    """Maps to `feetype` in db_current."""

    id = models.AutoField(primary_key=True)
    is_system = models.IntegerField(default=0)
    feecategory_id = models.IntegerField(blank=True, null=True)
    type = models.CharField(max_length=50, blank=True, null=True)
    code = models.CharField(max_length=100)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "feetype"

    def __str__(self):
        return f"Feetype {self.pk}"
