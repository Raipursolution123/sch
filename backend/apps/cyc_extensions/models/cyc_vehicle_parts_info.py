from django.db import models


class CycVehiclePartsInfo(models.Model):
    """Maps to `cyc_vehicle_parts_info` in db_current."""

    vp_id = models.AutoField(primary_key=True)
    vehicle_id = models.IntegerField()
    battery_number = models.CharField(max_length=255)
    battery_amp = models.CharField(max_length=255)
    battery_warranty = models.DateField()
    tyre_number = models.CharField(max_length=255)
    tyre_size = models.CharField(max_length=255)
    tool_box = models.CharField(max_length=255)
    cctv = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "cyc_vehicle_parts_info"

    def __str__(self):
        return f"CycVehiclePartsInfo {self.pk}"
