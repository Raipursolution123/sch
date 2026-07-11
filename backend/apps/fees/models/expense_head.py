from django.db import models


class ExpenseHead(models.Model):
    """Maps to `expense_head` in db_current."""

    id = models.AutoField(primary_key=True)
    exp_category = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default="yes")
    is_deleted = models.CharField(max_length=255, blank=True, null=True, default="no")
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "expense_head"

    def __str__(self):
        return f"ExpenseHead {self.pk}"
