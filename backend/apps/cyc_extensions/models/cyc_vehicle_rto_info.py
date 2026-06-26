from django.db import models


class CycVehicleRtoInfo(models.Model):
    """Maps to `cyc_vehicle_rto_info` in db_current."""

    vr_id = models.AutoField(primary_key=True)
    vehicle_id = models.IntegerField()
    permit_number = models.CharField(max_length=255)
    permit_upto = models.DateField()
    fitness_upto = models.DateField()
    road_tax_upto = models.DateField()
    insurance_company = models.CharField(max_length=255)
    insurance_upto = models.DateField()

    class Meta:
        managed = False
        db_table = "cyc_vehicle_rto_info"

    def __str__(self):
        return f"CycVehicleRtoInfo {self.pk}"
