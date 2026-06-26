from django.db import models


class CbseExamStudents(models.Model):
    """Maps to `cbse_exam_students` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_exam_id = models.IntegerField(blank=False, null=False, db_index=True)
    student_session_id = models.IntegerField(blank=False, null=False, db_index=True)
    staff_id = models.IntegerField(blank=True, null=True)
    roll_no = models.CharField(max_length=20, blank=True, null=True)
    remark = models.TextField(blank=True, null=True)
    total_present_days = models.IntegerField(blank=True, null=True)
    delete_student_id = models.IntegerField()
    created_at = models.DateTimeField()
    room_number = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "cbse_exam_students"

    def __str__(self):
        return f"CbseExamStudents {self.pk}"
