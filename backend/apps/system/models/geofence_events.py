from django.db import models


class GeofenceEvents(models.Model):
    """Maps to `geofence_events` in db_current."""

    ge_id = models.AutoField(primary_key=True)
    ge_v_id = models.CharField(max_length=11)
    ge_geo_id = models.CharField(max_length=11)
    ge_event = models.CharField(max_length=256)
    ge_timestamp = models.CharField(max_length=100)
    ge_created_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "geofence_events"

    def __str__(self):
        return f"GeofenceEvents {self.pk}"
