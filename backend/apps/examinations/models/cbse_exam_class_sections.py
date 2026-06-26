from django.db import models


class CbseExamClassSections(models.Model):
    """Maps to `cbse_exam_class_sections` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_exam_id = models.IntegerField(blank=False, null=False, db_index=True)
    class_section_id = models.IntegerField(blank=False, null=False, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_exam_class_sections"

    def __str__(self):
        return f"CbseExamClassSections {self.pk}"
