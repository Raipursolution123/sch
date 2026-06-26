from django.db import models


class Complaint(models.Model):
    """Maps to `complaint` in db_current."""

    id = models.AutoField(primary_key=True)
    complaint_type = models.CharField(max_length=255)
    source = models.CharField(max_length=255)
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=15)
    email = models.CharField(max_length=200)
    date = models.DateField()
    description = models.TextField()
    action_taken = models.CharField(max_length=200)
    assigned = models.CharField(max_length=50)
    note = models.TextField()
    image = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "complaint"

    def __str__(self):
        return f"Complaint {self.pk}"
