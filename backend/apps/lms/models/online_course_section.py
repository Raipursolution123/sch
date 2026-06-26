from django.db import models


class OnlineCourseSection(models.Model):
    """Maps to `online_course_section` in db_current."""

    id = models.AutoField(primary_key=True)
    online_course_id = models.IntegerField(blank=True, null=True, db_index=True)
    section_title = models.CharField(max_length=255, blank=True, null=True)
    order = models.IntegerField(blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "online_course_section"

    def __str__(self):
        return f"OnlineCourseSection {self.pk}"
