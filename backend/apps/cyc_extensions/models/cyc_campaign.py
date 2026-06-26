from django.db import models


class CycCampaign(models.Model):
    """Maps to `cyc_campaign` in db_current."""

    c_id = models.AutoField(primary_key=True)
    c_title = models.CharField(max_length=255)
    c_description = models.TextField()
    c_date = models.DateField()
    c_by = models.IntegerField()
    c_manager = models.IntegerField()
    c_manager_data = models.TextField(blank=True, null=True)
    c_status = models.CharField(max_length=44, default='Active')

    class Meta:
        managed = False
        db_table = "cyc_campaign"

    def __str__(self):
        return f"CycCampaign {self.pk}"
