from django.db import models


class OnlineCourseClassSections(models.Model):
    """Maps to `online_course_class_sections` in db_current."""

    id = models.AutoField(primary_key=True)
    course_id = models.IntegerField(blank=True, null=True, db_index=True)
    class_section_id = models.IntegerField(blank=True, null=True, db_index=True)
    created_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "online_course_class_sections"

    def __str__(self):
        return f"OnlineCourseClassSections {self.pk}"
