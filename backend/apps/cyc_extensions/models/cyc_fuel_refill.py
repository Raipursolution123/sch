from django.db import models


class CycFuelRefill(models.Model):
    """Maps to `cyc_fuel_refill` in db_current."""

    fr_id = models.AutoField(primary_key=True)
    vehicle_id = models.IntegerField()
    fuel_price = models.FloatField()
    fuel_quantity = models.FloatField()
    total_cost = models.FloatField()
    date = models.DateField()
    entry_by = models.IntegerField()

    class Meta:
        managed = False
        db_table = "cyc_fuel_refill"

    def __str__(self):
        return f"CycFuelRefill {self.pk}"
