from django.db import models


class CbseObservationClassSection(models.Model):
    """Maps to `cbse_observation_class_section` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_observation_parameter_id = models.IntegerField()
    class_section_id = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_observation_class_section"

    def __str__(self):
        return f"CbseObservationClassSection {self.pk}"
