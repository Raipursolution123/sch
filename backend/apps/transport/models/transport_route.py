from django.db import models


class TransportRoute(models.Model):
    """Maps to `transport_route` in db_current."""

    id = models.AutoField(primary_key=True)
    route_title = models.CharField(max_length=100, blank=True, null=True)
    route_from = models.CharField(max_length=255, blank=True, null=True)
    route_to = models.CharField(max_length=255, blank=True, null=True)
    route_distance = models.FloatField(blank=True, null=True)
    no_of_vehicle = models.IntegerField(blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "transport_route"

    def __str__(self):
        return f"TransportRoute {self.pk}"
