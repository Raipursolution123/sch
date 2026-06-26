from django.db import models


class CycSchemeAndScholarship(models.Model):
    """Maps to `cyc_scheme_and_scholarship` in db_current."""

    ss_id = models.AutoField(primary_key=True)
    ss_name = models.CharField(max_length=255)
    ss_type = models.CharField(max_length=255)
    ss_applicable_on = models.CharField(max_length=255)
    ss_status = models.IntegerField(default=1, db_index=True)
    created_at = models.IntegerField()

    class Meta:
        managed = False
        db_table = "cyc_scheme_and_scholarship"

    def __str__(self):
        return f"CycSchemeAndScholarship {self.pk}"
