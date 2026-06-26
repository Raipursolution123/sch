from django.db import models


class StudentIncidentComments(models.Model):
    """Maps to `student_incident_comments` in db_current."""

    id = models.AutoField(primary_key=True)
    student_incident_id = models.IntegerField(blank=False, null=False, db_index=True)
    comment = models.TextField()
    type = models.CharField(max_length=50)
    staff_id = models.IntegerField()
    student_id = models.IntegerField()
    created_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "student_incident_comments"

    def __str__(self):
        return f"StudentIncidentComments {self.pk}"
