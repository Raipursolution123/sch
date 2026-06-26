from django.db import models


class ClassTeacher(models.Model):
    """Maps to `class_teacher` in db_current."""

    id = models.AutoField(primary_key=True)
    session_id = models.IntegerField(blank=False, null=False, db_index=True)
    class_id = models.IntegerField(blank=False, null=False, db_index=True)
    section_id = models.IntegerField(blank=False, null=False, db_index=True)
    staff_id = models.IntegerField(blank=False, null=False, db_index=True)

    class Meta:
        managed = False
        db_table = "class_teacher"

    def __str__(self):
        return f"ClassTeacher {self.pk}"
