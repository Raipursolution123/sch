from django.db import models


class AlumniStudents(models.Model):
    """Maps to `alumni_students` in db_current."""

    id = models.AutoField(primary_key=True)
    student_id = models.IntegerField(blank=False, null=False, db_index=True)
    current_email = models.CharField(max_length=255)
    current_phone = models.CharField(max_length=255)
    occupation = models.TextField()
    address = models.TextField()
    photo = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "alumni_students"

    def __str__(self):
        return f"AlumniStudents {self.pk}"
