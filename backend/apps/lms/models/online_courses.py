from django.db import models


class OnlineCourses(models.Model):
    """Maps to `online_courses` in db_current."""

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    slug = models.CharField(max_length=200)
    url = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    teacher_id = models.IntegerField(blank=True, null=True)
    category_id = models.IntegerField(db_index=True)
    outcomes = models.TextField(blank=True, null=True)
    course_thumbnail = models.CharField(max_length=100, blank=True, null=True)
    course_provider = models.CharField(max_length=100, blank=True, null=True)
    course_url = models.CharField(max_length=255, blank=True, null=True)
    video_id = models.TextField(blank=True, null=True)
    price = models.FloatField(default=0.00)
    discount = models.FloatField(default=0.00)
    free_course = models.IntegerField(blank=True, null=True)
    view_count = models.IntegerField(blank=True, null=True)
    front_side_visibility = models.CharField(max_length=10, default='yes')
    status = models.IntegerField(blank=True, null=True, default=0)
    created_by = models.IntegerField(blank=True, null=True, db_index=True)
    created_date = models.DateTimeField(blank=True, null=True)
    updated_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "online_courses"

    def __str__(self):
        return f"OnlineCourses {self.pk}"
