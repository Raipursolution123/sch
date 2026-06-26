from django.db import models


class CyVehicleTicket(models.Model):
    """Maps to `cy_vehicle_ticket` in db_current."""

    vt_id = models.AutoField(primary_key=True)
    vehicle_id = models.IntegerField()
    driver_id = models.IntegerField()
    ticket_type = models.CharField(max_length=44)
    ticket_description = models.TextField()
    ticket_date = models.DateField()
    ticket_by = models.IntegerField()
    ticket_status = models.CharField(max_length=44)
    ticket_updates = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "cy_vehicle_ticket"

    def __str__(self):
        return f"CyVehicleTicket {self.pk}"
