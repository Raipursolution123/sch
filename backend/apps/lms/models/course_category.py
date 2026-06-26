from django.db import models


class CourseCategory(models.Model):
    """Maps to `course_category` in db_current."""

    id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=255, blank=True, null=True)
    slug = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "course_category"

    def __str__(self):
        return f"CourseCategory {self.pk}"
