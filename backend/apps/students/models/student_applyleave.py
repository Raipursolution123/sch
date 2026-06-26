from django.db import models


class StudentApplyleave(models.Model):
    """Maps to `student_applyleave` in db_current."""

    id = models.AutoField(primary_key=True)
    student_session_id = models.IntegerField(blank=False, null=False, db_index=True)
    from_date = models.DateField()
    to_date = models.DateField()
    apply_date = models.DateField()
    status = models.IntegerField()
    docs = models.CharField(max_length=200, blank=True, null=True)
    reason = models.TextField()
    approve_by = models.IntegerField(blank=True, null=True, db_index=True)
    approve_date = models.DateField(blank=True, null=True)
    request_type = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "student_applyleave"

    def __str__(self):
        return f"StudentApplyleave {self.pk}"
