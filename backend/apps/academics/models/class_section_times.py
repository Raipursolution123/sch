from django.db import models


class ClassSectionTimes(models.Model):
    """Maps to `class_section_times` in db_current."""

    id = models.AutoField(primary_key=True)
    class_section_id = models.IntegerField(blank=True, null=True, db_index=True)
    time = models.TimeField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "class_section_times"

    def __str__(self):
        return f"ClassSectionTimes {self.pk}"
