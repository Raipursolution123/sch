from django.db import models


class VisitorsBook(models.Model):
    """Maps to `visitors_book` in db_current."""

    id = models.AutoField(primary_key=True)
    staff_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    source = models.CharField(max_length=100, blank=True, null=True)
    purpose = models.CharField(max_length=255)
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=100, blank=True, null=True)
    contact = models.CharField(max_length=12)
    id_proof = models.CharField(max_length=50)
    no_of_people = models.IntegerField()
    date = models.DateField()
    in_time = models.CharField(max_length=20)
    out_time = models.CharField(max_length=20)
    note = models.TextField()
    image = models.CharField(max_length=100, blank=True, null=True)
    meeting_with = models.CharField(max_length=20)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "visitors_book"

    def __str__(self):
        return f"VisitorsBook {self.pk}"
