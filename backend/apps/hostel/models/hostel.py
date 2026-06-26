from django.db import models


class Hostel(models.Model):
    """Maps to `hostel` in db_current."""

    id = models.AutoField(primary_key=True)
    hostel_name = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    intake = models.IntegerField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    hostel_incharge = models.CharField(max_length=44)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)
    meal_type = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "hostel"

    def __str__(self):
        return f"Hostel {self.pk}"
