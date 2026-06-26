from django.db import models


class CbseObservationTerms(models.Model):
    """Maps to `cbse_observation_terms` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_exam_observation_id = models.IntegerField(blank=False, null=False, db_index=True)
    cbse_term_id = models.IntegerField(blank=False, null=False, db_index=True)
    session_id = models.IntegerField(blank=False, null=False, db_index=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "cbse_observation_terms"

    def __str__(self):
        return f"CbseObservationTerms {self.pk}"
