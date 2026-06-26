from django.db import models


class CbseExamGradesRange(models.Model):
    """Maps to `cbse_exam_grades_range` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_exam_grade_id = models.IntegerField(blank=True, null=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    minimum_percentage = models.TextField()
    maximum_percentage = models.TextField()
    description = models.TextField()
    created_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_exam_grades_range"

    def __str__(self):
        return f"CbseExamGradesRange {self.pk}"
