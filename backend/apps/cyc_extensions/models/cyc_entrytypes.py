from django.db import models


class CycEntrytypes(models.Model):
    """Maps to `cyc_entrytypes` in db_current."""

    id = models.AutoField(primary_key=True)
    label = models.CharField(max_length=255, db_index=True)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    base_type = models.IntegerField(default=0)
    numbering = models.IntegerField(default=1)
    prefix = models.CharField(max_length=255)
    suffix = models.CharField(max_length=255)
    zero_padding = models.IntegerField(default=0)
    restriction_bankcash = models.IntegerField(default=1)

    class Meta:
        managed = False
        db_table = "cyc_entrytypes"

    def __str__(self):
        return f"CycEntrytypes {self.pk}"
