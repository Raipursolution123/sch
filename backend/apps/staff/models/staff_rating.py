from django.db import models


class StaffRating(models.Model):
    """Maps to `staff_rating` in db_current."""

    id = models.AutoField(primary_key=True)
    staff_id = models.IntegerField(blank=False, null=False, db_index=True)
    comment = models.TextField()
    rate = models.IntegerField()
    user_id = models.IntegerField()
    role = models.CharField(max_length=255)
    status = models.IntegerField()
    entrydt = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "staff_rating"

    def __str__(self):
        return f"StaffRating {self.pk}"
