from django.db import models


class PickupPoint(models.Model):
    """Maps to `pickup_point` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    latitude = models.CharField(max_length=100, blank=True, null=True)
    longitude = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "pickup_point"

    def __str__(self):
        return f"PickupPoint {self.pk}"
