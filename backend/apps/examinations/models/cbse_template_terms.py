from django.db import models


class CbseTemplateTerms(models.Model):
    """Maps to `cbse_template_terms` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_template_id = models.IntegerField(blank=False, null=False, db_index=True)
    cbse_term_id = models.IntegerField(blank=False, null=False, db_index=True)
    weightage = models.TextField(db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_template_terms"

    def __str__(self):
        return f"CbseTemplateTerms {self.pk}"
