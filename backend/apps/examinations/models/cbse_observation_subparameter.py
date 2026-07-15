from django.db import models


class CbseObservationSubparameter(models.Model):
    """Maps to `cbse_observation_subparameter` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_exam_observation_id = models.IntegerField(
        blank=False, null=False, db_index=True
    )
    cbse_observation_parameter_id = models.IntegerField(
        blank=False, null=False, db_index=True
    )
    maximum_marks = models.TextField()
    description = models.TextField(blank=True, null=True)
    created_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_observation_subparameter"

    def __str__(self):
        return f"CbseObservationSubparameter {self.pk}"
