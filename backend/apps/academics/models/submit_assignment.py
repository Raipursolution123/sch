from django.db import models


class SubmitAssignment(models.Model):
    """Maps to `submit_assignment` in db_current."""

    id = models.AutoField(primary_key=True)
    homework_id = models.IntegerField(blank=False, null=False, db_index=True)
    student_id = models.IntegerField(blank=False, null=False, db_index=True)
    message = models.TextField()
    docs = models.CharField(max_length=225)
    file_name = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "submit_assignment"

    def __str__(self):
        return f"SubmitAssignment {self.pk}"
