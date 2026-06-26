from django.db import models


class FrontCmsPages(models.Model):
    """Maps to `front_cms_pages` in db_current."""

    id = models.AutoField(primary_key=True)
    page_type = models.CharField(max_length=10, default='manual')
    is_homepage = models.IntegerField(blank=True, null=True, default=0)
    title = models.CharField(max_length=250, blank=True, null=True)
    url = models.CharField(max_length=250, blank=True, null=True)
    type = models.CharField(max_length=50, blank=True, null=True)
    slug = models.CharField(max_length=200, blank=True, null=True)
    meta_title = models.TextField(blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    meta_keyword = models.TextField(blank=True, null=True)
    feature_image = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    publish_date = models.DateField(blank=True, null=True)
    publish = models.IntegerField(blank=True, null=True, default=0)
    sidebar = models.IntegerField(blank=True, null=True, default=0)
    is_active = models.CharField(max_length=10, blank=True, null=True, default='no')
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "front_cms_pages"

    def __str__(self):
        return f"FrontCmsPages {self.pk}"
