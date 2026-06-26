from django.db import models


class FeeSessionGroups(models.Model):
    """Maps to `fee_session_groups` in db_current."""

    id = models.AutoField(primary_key=True)
    fee_groups_id = models.IntegerField(blank=True, null=True, db_index=True)
    session_id = models.IntegerField(blank=True, null=True, db_index=True)
    is_active = models.CharField(max_length=10, default='no')
    created_at = models.DateTimeField()
    class_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "fee_session_groups"

    def __str__(self):
        return f"FeeSessionGroups {self.pk}"
