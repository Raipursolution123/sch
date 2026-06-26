from django.db import models


class DispatchReceive(models.Model):
    """Maps to `dispatch_receive` in db_current."""

    id = models.AutoField(primary_key=True)
    reference_no = models.CharField(max_length=50)
    to_title = models.CharField(max_length=100)
    type = models.CharField(max_length=10)
    address = models.CharField(max_length=500)
    note = models.CharField(max_length=500)
    from_title = models.CharField(max_length=200)
    date = models.DateField(blank=True, null=True)
    image = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "dispatch_receive"

    def __str__(self):
        return f"DispatchReceive {self.pk}"
