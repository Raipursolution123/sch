from django.db import models


class Vehicles(models.Model):
    """Maps to `vehicles` in db_current."""

    id = models.AutoField(primary_key=True)
    vehicle_no = models.CharField(max_length=20, blank=True, null=True)
    vehicle_model = models.CharField(max_length=100, default='None')
    vehicle_base_average = models.FloatField(blank=True, null=True)
    vehicle_photo = models.CharField(max_length=255, blank=True, null=True)
    manufacture_year = models.CharField(max_length=4, blank=True, null=True)
    registration_number = models.CharField(max_length=50)
    chasis_number = models.CharField(max_length=100)
    max_seating_capacity = models.CharField(max_length=255)
    driver_name = models.CharField(max_length=50, blank=True, null=True)
    driver_licence = models.CharField(max_length=50, default='None')
    driver_contact = models.CharField(max_length=20, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()
    swap_with = models.CharField(max_length=44)
    swap_till = models.DateField()
    swap_status = models.IntegerField()
    swap_history = models.TextField(blank=True, null=True)
    v_name = models.CharField(max_length=255)
    v_color = models.CharField(max_length=255)
    v_group = models.CharField(max_length=255)
    v_api_url = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "vehicles"

    def __str__(self):
        return f"Vehicles {self.pk}"
