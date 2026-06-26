from django.db import models


class StudentAttendencesHostel(models.Model):
    """Maps to `student_attendences_hostel` in db_current."""

    id = models.AutoField(primary_key=True)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    biometric_attendence = models.IntegerField(default=0)
    date = models.DateField(blank=True, null=True)
    attendence_type_id = models.IntegerField(blank=True, null=True, db_index=True)
    remark = models.CharField(max_length=200)
    biometric_device_data = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "student_attendences_hostel"

    def __str__(self):
        return f"StudentAttendencesHostel {self.pk}"
