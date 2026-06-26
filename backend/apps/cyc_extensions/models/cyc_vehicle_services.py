from django.db import models


class CycVehicleServices(models.Model):
    """Maps to `cyc_vehicle_services` in db_current."""

    srv_id = models.AutoField(primary_key=True)
    vehicle_id = models.IntegerField()
    driver_id = models.IntegerField()
    vendor = models.CharField(max_length=255)
    service_details = models.TextField(blank=True, null=True)
    total_cost = models.FloatField()
    date = models.DateField()
    entry_by = models.IntegerField()

    class Meta:
        managed = False
        db_table = "cyc_vehicle_services"

    def __str__(self):
        return f"CycVehicleServices {self.pk}"
