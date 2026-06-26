from django.db import models


class GeneralCalls(models.Model):
    """Maps to `general_calls` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=12)
    date = models.DateField()
    description = models.CharField(max_length=500)
    follow_up_date = models.DateField()
    call_duration = models.CharField(max_length=50)
    note = models.TextField()
    call_type = models.CharField(max_length=20)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "general_calls"

    def __str__(self):
        return f"GeneralCalls {self.pk}"
