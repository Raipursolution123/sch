from django.db import models


class Expenses(models.Model):
    """Maps to `expenses` in db_current."""

    id = models.AutoField(primary_key=True)
    exp_head_id = models.IntegerField(blank=True, null=True, db_index=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    invoice_no = models.CharField(max_length=200, blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    amount = models.FloatField(blank=True, null=True)
    documents = models.CharField(max_length=255, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default="yes")
    is_deleted = models.CharField(max_length=255, blank=True, null=True, default="no")
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "expenses"

    def __str__(self):
        return f"Expenses {self.pk}"
