from django.db import models


class StaffDesignation(models.Model):
    """Maps to `staff_designation` in db_current."""

    id = models.AutoField(primary_key=True)
    designation = models.CharField(max_length=200)
    is_active = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = "staff_designation"

    def __str__(self):
        return f"StaffDesignation {self.pk}"
