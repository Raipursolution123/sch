from django.db import models


class IncomeHead(models.Model):
    """Maps to `income_head` in db_current."""

    id = models.AutoField(primary_key=True)
    income_category = models.CharField(max_length=255, blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.CharField(max_length=255, default="yes")
    is_deleted = models.CharField(max_length=255, default="no")
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "income_head"

    def __str__(self):
        return f"IncomeHead {self.pk}"
