from django.db import models


class FrontCmsPrograms(models.Model):
    """Maps to `front_cms_programs` in db_current."""

    id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=50, blank=True, null=True)
    slug = models.CharField(max_length=255, blank=True, null=True)
    url = models.TextField(blank=True, null=True)
    title = models.CharField(max_length=200, blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    event_start = models.DateField(blank=True, null=True)
    event_end = models.DateField(blank=True, null=True)
    event_venue = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=10, blank=True, null=True, default='no')
    created_at = models.DateTimeField()
    meta_title = models.TextField()
    meta_description = models.TextField()
    meta_keyword = models.TextField()
    feature_image = models.TextField()
    publish_date = models.DateField(blank=True, null=True)
    publish = models.CharField(max_length=10, blank=True, null=True, default=0)
    sidebar = models.IntegerField(blank=True, null=True, default=0)

    class Meta:
        managed = False
        db_table = "front_cms_programs"

    def __str__(self):
        return f"FrontCmsPrograms {self.pk}"
