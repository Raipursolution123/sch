from django.db import models


class Lesson(models.Model):
    """Maps to `lesson` in db_current."""

    id = models.AutoField(primary_key=True)
    session_id = models.IntegerField(blank=False, null=False, db_index=True)
    subject_group_subject_id = models.IntegerField(
        blank=False, null=False, db_index=True
    )
    subject_group_class_sections_id = models.IntegerField(
        blank=False, null=False, db_index=True
    )
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "lesson"

    def __str__(self):
        return f"Lesson {self.pk}"
