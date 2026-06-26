from django.db import models


class Positions(models.Model):
    """Maps to `positions` in db_current."""

    id = models.AutoField(primary_key=True)
    time = models.DateTimeField()
    v_id = models.IntegerField(db_index=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    altitude = models.FloatField(blank=True, null=True)
    speed = models.FloatField(blank=True, null=True)
    bearing = models.FloatField(blank=True, null=True)
    accuracy = models.IntegerField(blank=True, null=True)
    provider = models.CharField(max_length=100, blank=True, null=True)
    comment = models.CharField(max_length=255, blank=True, null=True)
    created_date = models.DateTimeField()
    traccar_pos_id = models.CharField(max_length=100, blank=True, null=True)
    battery_level = models.CharField(max_length=100, blank=True, null=True)
    motion = models.CharField(max_length=256, blank=True, null=True)
    address = models.CharField(max_length=256, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "positions"

    def __str__(self):
        return f"Positions {self.pk}"
