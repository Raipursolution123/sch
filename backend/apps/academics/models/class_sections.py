from django.db import models


class ClassSections(models.Model):
    """Maps to `class_sections` in db_current."""

    id = models.AutoField(primary_key=True)
    class_id = models.IntegerField(blank=True, null=True, db_index=True)
    section_id = models.IntegerField(blank=True, null=True, db_index=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default="no")
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "class_sections"

    def __str__(self):
        return f"ClassSections {self.pk}"
