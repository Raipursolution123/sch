from django.db import models


class StudentSession(models.Model):
    """Maps to `student_session` in db_current."""

    id = models.AutoField(primary_key=True)
    session_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_id = models.IntegerField(blank=True, null=True, db_index=True)
    class_id = models.IntegerField(blank=True, null=True, db_index=True)
    section_id = models.IntegerField(blank=True, null=True, db_index=True)
    subject_group_id = models.IntegerField(blank=True, null=True)
    program_id = models.IntegerField(blank=True, null=True)
    batch_id = models.IntegerField(blank=True, null=True)
    batch_period_id = models.IntegerField(blank=True, null=True)
    program_period_course_id = models.IntegerField(blank=True, null=True)
    hostel_room_id = models.IntegerField(blank=True, null=True, db_index=True)
    vehroute_id = models.IntegerField(blank=True, null=True, db_index=True)
    route_pickup_point_id = models.IntegerField(blank=True, null=True, db_index=True)
    transport_fees = models.FloatField(default='0.00')
    fees_discount = models.FloatField(default='0.00')
    is_leave = models.IntegerField(default=0)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    is_alumni = models.IntegerField()
    default_login = models.IntegerField(default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)
    department_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "student_session"

    def __str__(self):
        return f"StudentSession {self.pk}"
