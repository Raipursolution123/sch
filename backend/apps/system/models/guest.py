from django.db import models


class Guest(models.Model):
    """Maps to `guest` in db_current."""

    id = models.AutoField(primary_key=True)
    guest_name = models.CharField(max_length=200)
    guest_unique_id = models.CharField(max_length=200)
    lang_id = models.IntegerField(db_index=True)
    currency_id = models.IntegerField(db_index=True)
    email = models.CharField(max_length=200, db_index=True)
    mobileno = models.CharField(max_length=100)
    password = models.CharField(max_length=200)
    dob = models.CharField(max_length=200)
    gender = models.CharField(max_length=10, blank=True, null=True)
    note = models.TextField()
    address = models.CharField(max_length=200)
    guest_image = models.CharField(max_length=200)
    verification_code = models.CharField(max_length=200)
    created_at = models.DateField()
    is_active = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = "guest"

    def __str__(self):
        return f"Guest {self.pk}"
