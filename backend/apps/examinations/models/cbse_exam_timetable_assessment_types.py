from django.db import models


class CbseExamTimetableAssessmentTypes(models.Model):
    """Maps to `cbse_exam_timetable_assessment_types` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_exam_timetable_id = models.IntegerField(blank=True, null=True, db_index=True)
    cbse_exam_assessment_type_id = models.IntegerField(
        blank=True, null=True, db_index=True
    )
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_exam_timetable_assessment_types"

    def __str__(self):
        return f"CbseExamTimetableAssessmentTypes {self.pk}"
