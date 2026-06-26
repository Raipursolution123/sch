from django.db import models


class CycCampaignTime(models.Model):
    """Maps to `cyc_campaign_time` in db_current."""

    ct_id = models.AutoField(primary_key=True)
    c_id = models.IntegerField()
    staff_id = models.IntegerField()
    date = models.DateField()
    time = models.TimeField()
    type = models.CharField(max_length=44)
    duration = models.FloatField()

    class Meta:
        managed = False
        db_table = "cyc_campaign_time"

    def __str__(self):
        return f"CycCampaignTime {self.pk}"
