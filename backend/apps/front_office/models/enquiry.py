from django.db import models


class Enquiry(models.Model):
    """Maps to `enquiry` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=20)
    address = models.TextField()
    reference = models.CharField(max_length=20)
    date = models.DateField()
    description = models.CharField(max_length=500)
    follow_up_date = models.DateField()
    note = models.TextField()
    source = models.CharField(max_length=50)
    email = models.CharField(max_length=50, blank=True, null=True)
    assigned = models.IntegerField(blank=True, null=True, db_index=True)
    class_id = models.IntegerField(blank=True, null=True, db_index=True)
    no_of_child = models.CharField(max_length=11, blank=True, null=True)
    status = models.CharField(max_length=100)
    created_by = models.IntegerField(blank=False, null=False, db_index=True)
    created_at = models.DateTimeField()
    referral_staff = models.CharField(max_length=44, blank=True, null=True)
    is_converted_to_admission = models.IntegerField(default=0)

    class Meta:
        managed = False
        db_table = "enquiry"

    def __str__(self):
        return f"Enquiry {self.pk}"
