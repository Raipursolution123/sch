from django.db import models


class StudentDoc(models.Model):
    """Maps to `student_doc` in db_current."""

    id = models.AutoField(primary_key=True)
    student_id = models.IntegerField(blank=True, null=True)
    title = models.CharField(max_length=200, blank=True, null=True)
    doc = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "student_doc"

    def __str__(self):
        return f"StudentDoc {self.pk}"
