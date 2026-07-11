from django.db import models


class FeeGroupsFeetype(models.Model):
    """Maps to `fee_groups_feetype` in db_current."""

    id = models.AutoField(primary_key=True)
    parent_id = models.IntegerField(blank=True, null=True)
    fee_session_group_id = models.IntegerField(blank=True, null=True, db_index=True)
    fee_groups_id = models.IntegerField(blank=True, null=True, db_index=True)
    feetype_id = models.IntegerField(blank=True, null=True, db_index=True)
    session_id = models.IntegerField(blank=True, null=True, db_index=True)
    class_id = models.IntegerField(blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    fine_type = models.CharField(max_length=50, default="none")
    due_date = models.DateField(blank=True, null=True)
    fine_percentage = models.FloatField(default=0.00)
    fine_amount = models.FloatField(default=0.00)
    collection_type = models.IntegerField()
    is_active = models.CharField(max_length=10, default="no")
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "fee_groups_feetype"

    def __str__(self):
        return f"FeeGroupsFeetype {self.pk}"
