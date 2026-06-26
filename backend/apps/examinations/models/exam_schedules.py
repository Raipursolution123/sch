from django.db import models


class ExamSchedules(models.Model):
    """Maps to `exam_schedules` in db_current."""

    id = models.AutoField(primary_key=True)
    session_id = models.IntegerField(blank=False, null=False, db_index=True)
    exam_id = models.IntegerField(blank=True, null=True, db_index=True)
    teacher_subject_id = models.IntegerField(blank=True, null=True, db_index=True)
    date_of_exam = models.DateField(blank=True, null=True)
    start_to = models.CharField(max_length=50, blank=True, null=True)
    end_from = models.CharField(max_length=50, blank=True, null=True)
    room_no = models.CharField(max_length=50, blank=True, null=True)
    full_marks = models.IntegerField(blank=True, null=True)
    passing_marks = models.IntegerField(blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "exam_schedules"

    def __str__(self):
        return f"ExamSchedules {self.pk}"
