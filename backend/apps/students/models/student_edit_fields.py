from django.db import models


class StudentEditFields(models.Model):
    """Maps to `student_edit_fields` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=250, blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "student_edit_fields"

    def __str__(self):
        return f"StudentEditFields {self.pk}"
