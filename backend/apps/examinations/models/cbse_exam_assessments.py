from django.db import models


class CbseExamAssessments(models.Model):
    """Maps to `cbse_exam_assessments` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField()

    class Meta:
        managed = False
        db_table = "cbse_exam_assessments"

    def __str__(self):
        return f"CbseExamAssessments {self.pk}"
