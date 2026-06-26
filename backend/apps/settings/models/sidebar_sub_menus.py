from django.db import models


class SidebarSubMenus(models.Model):
    """Maps to `sidebar_sub_menus` in db_current."""

    id = models.AutoField(primary_key=True)
    sidebar_menu_id = models.IntegerField(blank=True, null=True, db_index=True)
    menu = models.CharField(max_length=500, blank=True, null=True)
    key = models.CharField(max_length=500, blank=True, null=True)
    lang_key = models.CharField(max_length=250, blank=True, null=True)
    url = models.TextField(blank=True, null=True)
    level = models.IntegerField(blank=True, null=True)
    access_permissions = models.CharField(max_length=1000, blank=True, null=True)
    permission_group_id = models.IntegerField(blank=True, null=True, db_index=True)
    activate_controller = models.CharField(max_length=100, blank=True, null=True)
    activate_methods = models.CharField(max_length=500, blank=True, null=True)
    addon_permission = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True, default=1)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "sidebar_sub_menus"

    def __str__(self):
        return f"SidebarSubMenus {self.pk}"
