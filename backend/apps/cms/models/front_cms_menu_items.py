from django.db import models


class FrontCmsMenuItems(models.Model):
    """Maps to `front_cms_menu_items` in db_current."""

    id = models.AutoField(primary_key=True)
    menu_id = models.IntegerField(blank=False, null=False, db_index=True)
    menu = models.CharField(max_length=100, blank=True, null=True)
    page_id = models.IntegerField()
    parent_id = models.IntegerField()
    level = models.IntegerField()
    ext_url = models.TextField(blank=True, null=True)
    open_new_tab = models.IntegerField(blank=True, null=True, default=0)
    ext_url_link = models.TextField(blank=True, null=True)
    slug = models.CharField(max_length=200, blank=True, null=True)
    weight = models.IntegerField(blank=True, null=True)
    publish = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=10, blank=True, null=True, default='no')
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "front_cms_menu_items"

    def __str__(self):
        return f"FrontCmsMenuItems {self.pk}"
