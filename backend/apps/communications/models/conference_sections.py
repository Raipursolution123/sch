from django.db import models


class ConferenceSections(models.Model):
    """Maps to `conference_sections` in db_current."""

    id = models.AutoField(primary_key=True)
    conference_id = models.IntegerField(blank=True, null=True, db_index=True)
    cls_section_id = models.IntegerField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "conference_sections"

    def __str__(self):
        return f"ConferenceSections {self.pk}"
