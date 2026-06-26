from django.db import models


class OnlineexamStudents(models.Model):
    """Maps to `onlineexam_students` in db_current."""

    id = models.AutoField(primary_key=True)
    onlineexam_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    is_attempted = models.IntegerField(default=0)
    rank = models.IntegerField(blank=True, null=True, default=0)
    quiz_attempted = models.IntegerField(default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "onlineexam_students"

    def __str__(self):
        return f"OnlineexamStudents {self.pk}"
