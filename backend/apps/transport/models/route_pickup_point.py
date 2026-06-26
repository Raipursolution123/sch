from django.db import models


class RoutePickupPoint(models.Model):
    """Maps to `route_pickup_point` in db_current."""

    id = models.AutoField(primary_key=True)
    transport_route_id = models.IntegerField(blank=False, null=False, db_index=True)
    pickup_point_id = models.IntegerField(blank=False, null=False, db_index=True)
    fees = models.FloatField(blank=True, null=True, default=0.00)
    destination_distance = models.FloatField(blank=True, null=True, default=0.0)
    pickup_time = models.TimeField(blank=True, null=True)
    order_number = models.TextField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "route_pickup_point"

    def __str__(self):
        return f"RoutePickupPoint {self.pk}"
