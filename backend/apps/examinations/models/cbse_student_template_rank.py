from django.db import models


class CbseStudentTemplateRank(models.Model):
    """Maps to `cbse_student_template_rank` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_template_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    rank = models.IntegerField(blank=True, null=True, db_index=True)
    rank_percentage = models.FloatField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_student_template_rank"

    def __str__(self):
        return f"CbseStudentTemplateRank {self.pk}"
