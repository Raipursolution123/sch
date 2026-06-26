from django.db import models


class CbseExams(models.Model):
    """Maps to `cbse_exams` in db_current."""

    id = models.AutoField(primary_key=True)
    total_working_days = models.IntegerField(blank=True, null=True, default=0)
    cbse_term_id = models.IntegerField(blank=True, null=True, db_index=True)
    cbse_term_group_id = models.IntegerField(blank=True, null=True)
    cbse_exam_assessment_id = models.IntegerField(blank=True, null=True, db_index=True)
    cbse_exam_grade_id = models.IntegerField(blank=True, null=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    exam_code = models.CharField(max_length=200, blank=True, null=True, db_index=True)
    session_id = models.IntegerField(blank=False, null=False, db_index=True)
    description = models.TextField()
    combined_ew = models.IntegerField(blank=True, null=True)
    is_publish = models.IntegerField()
    is_active = models.IntegerField()
    created_by = models.IntegerField(blank=True, null=True)
    use_exam_roll_no = models.IntegerField(default=0)
    created_at = models.DateTimeField()
    promote_class = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "cbse_exams"

    def __str__(self):
        return f"CbseExams {self.pk}"
