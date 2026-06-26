from django.db import models


class StaffAttendanceType(models.Model):
    """Maps to `staff_attendance_type` in db_current."""

    id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=200)
    key_value = models.CharField(max_length=200)
    is_active = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "staff_attendance_type"

    def __str__(self):
        return f"StaffAttendanceType {self.pk}"
