from django.db import models


class Source(models.Model):
    """Maps to `source` in db_current."""

    id = models.AutoField(primary_key=True)
    source = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        managed = False
        db_table = "source"

    def __str__(self):
        return f"Source {self.pk}"
