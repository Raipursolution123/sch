from django.db import models


class CycLeadsFollowupStatus(models.Model):
    """Maps to `cyc_leads_followup_status` in db_current."""

    fws_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = "cyc_leads_followup_status"

    def __str__(self):
        return f"CycLeadsFollowupStatus {self.pk}"
