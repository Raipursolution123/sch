from django.db import models


class OnlineexamAttempts(models.Model):
    """Maps to `onlineexam_attempts` in db_current."""

    id = models.AutoField(primary_key=True)
    onlineexam_student_id = models.IntegerField(blank=False, null=False, db_index=True)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "onlineexam_attempts"

    def __str__(self):
        return f"OnlineexamAttempts {self.pk}"
