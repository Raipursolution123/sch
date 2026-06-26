from django.db import models


class Reference(models.Model):
    """Maps to `reference` in db_current."""

    id = models.AutoField(primary_key=True)
    reference = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        managed = False
        db_table = "reference"

    def __str__(self):
        return f"Reference {self.pk}"
