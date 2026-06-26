from django.db import models


class CycLeadsFollowup(models.Model):
    """Maps to `cyc_leads_followup` in db_current."""

    f_id = models.AutoField(primary_key=True)
    c_id = models.IntegerField(blank=True, null=True)
    l_id = models.IntegerField()
    followup_date = models.DateField()
    followup_time = models.TimeField()
    next_followup_date = models.DateField()
    next_followup_time = models.TimeField()
    followup_remark = models.TextField()
    call_status = models.CharField(max_length=44)
    followup_by = models.IntegerField()
    followup_status = models.IntegerField(blank=True, null=True, default=0)
    followup_priority = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = "cyc_leads_followup"

    def __str__(self):
        return f"CycLeadsFollowup {self.pk}"
