from django.db import models


class CbseTemplateTermExams(models.Model):
    """Maps to `cbse_template_term_exams` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_template_term_id = models.IntegerField(blank=True, null=True, db_index=True)
    cbse_exam_id = models.IntegerField(blank=False, null=False, db_index=True)
    cbse_template_id = models.IntegerField(blank=False, null=False, db_index=True)
    weightage = models.TextField(default=100, db_index=True)
    combined_weightage = models.IntegerField(blank=True, null=True)
    exclude_total = models.IntegerField(default=0)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_template_term_exams"

    def __str__(self):
        return f"CbseTemplateTermExams {self.pk}"
