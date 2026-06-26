from django.db import models


class SubjectGroupSubjects(models.Model):
    """Maps to `subject_group_subjects` in db_current."""

    id = models.AutoField(primary_key=True)
    subject_group_id = models.IntegerField(blank=True, null=True, db_index=True)
    session_id = models.IntegerField(blank=True, null=True, db_index=True)
    subject_id = models.IntegerField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "subject_group_subjects"

    def __str__(self):
        return f"SubjectGroupSubjects {self.pk}"
