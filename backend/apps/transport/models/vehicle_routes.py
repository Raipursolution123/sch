from django.db import models


class VehicleRoutes(models.Model):
    """Maps to `vehicle_routes` in db_current."""

    id = models.AutoField(primary_key=True)
    route_id = models.IntegerField(blank=True, null=True, db_index=True)
    vehicle_id = models.IntegerField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "vehicle_routes"

    def __str__(self):
        return f"VehicleRoutes {self.pk}"
