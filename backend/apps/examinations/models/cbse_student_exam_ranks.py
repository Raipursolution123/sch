from django.db import models


class CbseStudentExamRanks(models.Model):
    """Maps to `cbse_student_exam_ranks` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_exam_id = models.IntegerField(blank=False, null=False, db_index=True)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    rank = models.IntegerField(blank=True, null=True, db_index=True)
    rank_percentage = models.IntegerField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_student_exam_ranks"

    def __str__(self):
        return f"CbseStudentExamRanks {self.pk}"
