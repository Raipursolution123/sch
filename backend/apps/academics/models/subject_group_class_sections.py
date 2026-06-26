from django.db import models


class SubjectGroupClassSections(models.Model):
    """Maps to `subject_group_class_sections` in db_current."""

    id = models.AutoField(primary_key=True)
    subject_group_id = models.IntegerField(blank=True, null=True, db_index=True)
    class_section_id = models.IntegerField(blank=True, null=True, db_index=True)
    session_id = models.IntegerField(blank=True, null=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "subject_group_class_sections"

    def __str__(self):
        return f"SubjectGroupClassSections {self.pk}"
