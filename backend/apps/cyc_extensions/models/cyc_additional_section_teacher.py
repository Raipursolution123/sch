from django.db import models


class CycAdditionalSectionTeacher(models.Model):
    """Maps to `cyc_additional_section_teacher` in db_current."""

    at_id = models.AutoField(primary_key=True)
    class_id = models.IntegerField()
    section_id = models.IntegerField()
    staff_id = models.IntegerField()
    from_date = models.DateField()
    to_date = models.DateField()
    session_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = "cyc_additional_section_teacher"

    def __str__(self):
        return f"CycAdditionalSectionTeacher {self.pk}"
