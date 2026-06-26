from django.db import models


class CycLeadsCounsellor(models.Model):
    """Maps to `cyc_leads_counsellor` in db_current."""

    lc_id = models.AutoField(primary_key=True)
    c_id = models.IntegerField()
    staff_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = "cyc_leads_counsellor"

    def __str__(self):
        return f"CycLeadsCounsellor {self.pk}"
