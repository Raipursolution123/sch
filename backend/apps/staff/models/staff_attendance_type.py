from django.db import models


class StaffAttendanceType(models.Model):
    """Maps to `staff_attendance_type` in db_current."""

    id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=200, blank=True, null=True)
    key_value = models.CharField(max_length=200, blank=True, null=True)
    is_active = models.CharField(max_length=50, blank=True, null=True, default="yes")
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "staff_attendance_type"

    def __str__(self):
        return f"StaffAttendanceType {self.pk}"
