from django.db import models


class CycGroups(models.Model):
    """Maps to `cyc_groups` in db_current."""

    id = models.AutoField(primary_key=True)
    parent_id = models.IntegerField(blank=True, null=True, db_index=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    affects_gross = models.IntegerField(default=0)

    class Meta:
        managed = False
        db_table = "cyc_groups"

    def __str__(self):
        return f"CycGroups {self.pk}"
