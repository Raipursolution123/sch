from django.db import models


class CbseObservationTermStudentSubparameter(models.Model):
    """Maps to `cbse_observation_term_student_subparameter` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_ovservation_term_id = models.IntegerField(blank=True, null=True, db_index=True)
    cbse_observation_subparameter_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    obtain_marks = models.FloatField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_observation_term_student_subparameter"

    def __str__(self):
        return f"CbseObservationTermStudentSubparameter {self.pk}"
