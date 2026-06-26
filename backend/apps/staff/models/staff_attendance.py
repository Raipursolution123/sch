from django.db import models


class StaffAttendance(models.Model):
    """Maps to `staff_attendance` in db_current."""

    id = models.AutoField(primary_key=True)
    date = models.DateField()
    staff_id = models.IntegerField(blank=False, null=False, db_index=True)
    staff_attendance_type_id = models.IntegerField(blank=False, null=False, db_index=True)
    biometric_attendence = models.IntegerField(blank=True, null=True, default=0)
    biometric_device_data = models.TextField(blank=True, null=True)
    remark = models.CharField(max_length=200)
    is_active = models.IntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "staff_attendance"

    def __str__(self):
        return f"StaffAttendance {self.pk}"
