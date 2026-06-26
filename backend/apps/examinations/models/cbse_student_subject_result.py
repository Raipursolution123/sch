from django.db import models


class CbseStudentSubjectResult(models.Model):
    """Maps to `cbse_student_subject_result` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_exam_timetable_id = models.IntegerField(blank=True, null=True)
    cbse_exam_student_id = models.IntegerField(blank=True, null=True)
    note = models.TextField()

    class Meta:
        managed = False
        db_table = "cbse_student_subject_result"

    def __str__(self):
        return f"CbseStudentSubjectResult {self.pk}"
