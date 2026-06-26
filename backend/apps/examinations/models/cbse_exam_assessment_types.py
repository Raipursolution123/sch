from django.db import models


class CbseExamAssessmentTypes(models.Model):
    """Maps to `cbse_exam_assessment_types` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_exam_assessment_id = models.IntegerField(blank=False, null=False, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    code = models.CharField(max_length=100, db_index=True)
    maximum_marks = models.TextField()
    pass_percentage = models.TextField()
    description = models.TextField()
    created_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()
    scholastic_area = models.IntegerField(blank=True, null=True)
    is_for_grade = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "cbse_exam_assessment_types"

    def __str__(self):
        return f"CbseExamAssessmentTypes {self.pk}"
