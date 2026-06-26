from django.db import models


class CyPtmTimeSlot(models.Model):
    """Maps to `cy_ptm_time_slot` in db_current."""

    pts_id = models.AutoField(primary_key=True)
    ptm_id = models.IntegerField()
    time_from = models.CharField(max_length=44)
    time_to = models.CharField(max_length=44)

    class Meta:
        managed = False
        db_table = "cy_ptm_time_slot"

    def __str__(self):
        return f"CyPtmTimeSlot {self.pk}"
