from django.db import models


class CycPtm(models.Model):
    """Maps to `cyc_ptm` in db_current."""

    ptm_id = models.AutoField(primary_key=True)
    ptm_title = models.TextField()
    from_date = models.DateField()
    to_date = models.DateField()
    remark = models.TextField()
    host_by = models.IntegerField()

    class Meta:
        managed = False
        db_table = "cyc_ptm"

    def __str__(self):
        return f"CycPtm {self.pk}"
