from django.db import models


class GmeetSections(models.Model):
    """Maps to `gmeet_sections` in db_current."""

    id = models.AutoField(primary_key=True)
    gmeet_id = models.IntegerField(blank=False, null=False, db_index=True)
    cls_section_id = models.IntegerField(blank=False, null=False, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "gmeet_sections"

    def __str__(self):
        return f"GmeetSections {self.pk}"
