from django.db import models


class CycTags(models.Model):
    """Maps to `cyc_tags` in db_current."""

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255, db_index=True)
    color = models.TextField()
    background = models.TextField()

    class Meta:
        managed = False
        db_table = "cyc_tags"

    def __str__(self):
        return f"CycTags {self.pk}"
