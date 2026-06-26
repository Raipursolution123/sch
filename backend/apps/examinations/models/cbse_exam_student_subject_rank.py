from django.db import models


class CbseExamStudentSubjectRank(models.Model):
    """Maps to `cbse_exam_student_subject_rank` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_template_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    subject_id = models.IntegerField(blank=True, null=True, db_index=True)
    rank = models.IntegerField(blank=True, null=True, db_index=True)
    rank_percentage = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_exam_student_subject_rank"

    def __str__(self):
        return f"CbseExamStudentSubjectRank {self.pk}"
