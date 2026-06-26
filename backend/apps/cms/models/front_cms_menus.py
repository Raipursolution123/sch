from django.db import models


class FrontCmsMenus(models.Model):
    """Maps to `front_cms_menus` in db_current."""

    id = models.AutoField(primary_key=True)
    menu = models.CharField(max_length=100, blank=True, null=True)
    slug = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    open_new_tab = models.IntegerField(default=0)
    ext_url = models.TextField()
    ext_url_link = models.TextField()
    publish = models.IntegerField(default=0)
    content_type = models.CharField(max_length=10, default='manual')
    is_active = models.CharField(max_length=10, blank=True, null=True, default='no')
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "front_cms_menus"

    def __str__(self):
        return f"FrontCmsMenus {self.pk}"
