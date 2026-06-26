from django.db import models


class CycSchemeAndScholarshipFeetype(models.Model):
    """Maps to `cyc_scheme_and_scholarship_feetype` in db_current."""

    ssvft_id = models.AutoField(primary_key=True)
    ss_id = models.IntegerField(db_index=True)
    feetype_id = models.IntegerField()
    ssvft_status = models.IntegerField(default=1)

    class Meta:
        managed = False
        db_table = "cyc_scheme_and_scholarship_feetype"

    def __str__(self):
        return f"CycSchemeAndScholarshipFeetype {self.pk}"
