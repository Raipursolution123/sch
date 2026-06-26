from django.db import models


class StudentSubjectAttendances(models.Model):
    """Maps to `student_subject_attendances` in db_current."""

    id = models.AutoField(primary_key=True)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    subject_timetable_id = models.IntegerField(blank=True, null=True, db_index=True)
    attendence_type_id = models.IntegerField(blank=True, null=True, db_index=True)
    date = models.DateField(blank=True, null=True)
    remark = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "student_subject_attendances"

    def __str__(self):
        return f"StudentSubjectAttendances {self.pk}"
