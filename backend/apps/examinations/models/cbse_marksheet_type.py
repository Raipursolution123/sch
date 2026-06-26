from django.db import models


class CbseMarksheetType(models.Model):
    """Maps to `cbse_marksheet_type` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, db_index=True)
    short_code = models.CharField(max_length=255, db_index=True)

    class Meta:
        managed = False
        db_table = "cbse_marksheet_type"

    def __str__(self):
        return f"CbseMarksheetType {self.pk}"
