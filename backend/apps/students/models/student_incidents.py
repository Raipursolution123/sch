from django.db import models


class StudentIncidents(models.Model):
    """Maps to `student_incidents` in db_current."""

    id = models.AutoField(primary_key=True)
    session_id = models.IntegerField()
    student_id = models.IntegerField(blank=False, null=False, db_index=True)
    incident_id = models.IntegerField(blank=False, null=False, db_index=True)
    assign_by = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "student_incidents"

    def __str__(self):
        return f"StudentIncidents {self.pk}"
