from django.db import models


class ItemIssue(models.Model):
    """Maps to `item_issue` in db_current."""

    id = models.AutoField(primary_key=True)
    issue_type = models.CharField(max_length=15, blank=True, null=True)
    issue_to = models.IntegerField(blank=False, null=False, db_index=True)
    issue_by = models.IntegerField(blank=True, null=True, db_index=True)
    issue_date = models.DateField(blank=True, null=True)
    return_date = models.DateField(blank=True, null=True)
    item_category_id = models.IntegerField(blank=True, null=True, db_index=True)
    item_id = models.IntegerField(blank=True, null=True, db_index=True)
    quantity = models.IntegerField()
    issue_category = models.CharField(max_length=44)
    note = models.TextField()
    is_returned = models.IntegerField(default=1)
    created_at = models.DateTimeField()
    is_active = models.CharField(max_length=10, blank=True, null=True, default='no')

    class Meta:
        managed = False
        db_table = "item_issue"

    def __str__(self):
        return f"ItemIssue {self.pk}"
