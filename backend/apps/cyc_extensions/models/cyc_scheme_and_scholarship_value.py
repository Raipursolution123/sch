from django.db import models


class CycSchemeAndScholarshipValue(models.Model):
    """Maps to `cyc_scheme_and_scholarship_value` in db_current."""

    ssv_id = models.AutoField(primary_key=True)
    ss_id = models.IntegerField(db_index=True)
    fee_concession_type = models.CharField(max_length=255)
    fee_concession = models.TextField()
    applicable_class = models.IntegerField(blank=True, null=True)
    ssv_status = models.IntegerField(default=1, db_index=True)

    class Meta:
        managed = False
        db_table = "cyc_scheme_and_scholarship_value"

    def __str__(self):
        return f"CycSchemeAndScholarshipValue {self.pk}"
