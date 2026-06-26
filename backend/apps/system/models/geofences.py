from django.db import models


class Geofences(models.Model):
    """Maps to `geofences` in db_current."""

    geo_id = models.AutoField(primary_key=True)
    geo_name = models.CharField(max_length=128)
    geo_description = models.CharField(max_length=128, blank=True, null=True)
    geo_area = models.CharField(max_length=4096)
    geo_vehicles = models.CharField(max_length=256)
    geo_createddate = models.DateTimeField()
    geo_modifieddate = models.DateTimeField(default='0000-00-00 00:00:00')

    class Meta:
        managed = False
        db_table = "geofences"

    def __str__(self):
        return f"Geofences {self.pk}"
