from django.db import models


class FeeGroups(models.Model):
    """Maps to `fee_groups` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    is_system = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=10, default='no')
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "fee_groups"

    def __str__(self):
        return f"FeeGroups {self.pk}"
