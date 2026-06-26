from django.db import models


class CbseExamGrades(models.Model):
    """Maps to `cbse_exam_grades` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_exam_grades"

    def __str__(self):
        return f"CbseExamGrades {self.pk}"
