from django.db import models


class StudentTimeline(models.Model):
    """Maps to `student_timeline` in db_current."""

    id = models.AutoField(primary_key=True)
    student_id = models.IntegerField(blank=False, null=False, db_index=True)
    title = models.CharField(max_length=200)
    timeline_date = models.DateField()
    description = models.TextField()
    document = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(max_length=200)
    created_student_id = models.IntegerField()
    date = models.DateField()

    class Meta:
        managed = False
        db_table = "student_timeline"

    def __str__(self):
        return f"StudentTimeline {self.pk}"
