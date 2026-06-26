from django.db import models


class FollowUp(models.Model):
    """Maps to `follow_up` in db_current."""

    id = models.AutoField(primary_key=True)
    enquiry_id = models.IntegerField(blank=False, null=False, db_index=True)
    date = models.DateField()
    next_date = models.DateField()
    response = models.TextField()
    note = models.TextField()
    followup_by = models.IntegerField(blank=False, null=False, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "follow_up"

    def __str__(self):
        return f"FollowUp {self.pk}"
