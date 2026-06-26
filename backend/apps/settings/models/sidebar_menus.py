from django.db import models


class SidebarMenus(models.Model):
    """Maps to `sidebar_menus` in db_current."""

    id = models.AutoField(primary_key=True)
    permission_group_id = models.IntegerField(blank=True, null=True, db_index=True)
    icon = models.CharField(max_length=100, blank=True, null=True)
    menu = models.CharField(max_length=500, blank=True, null=True)
    activate_menu = models.CharField(max_length=100, blank=True, null=True)
    lang_key = models.CharField(max_length=250)
    system_level = models.IntegerField(blank=True, null=True, default=0)
    level = models.IntegerField(blank=True, null=True)
    sidebar_display = models.IntegerField(blank=True, null=True, default=0)
    access_permissions = models.TextField(blank=True, null=True)
    is_active = models.IntegerField(default=1)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "sidebar_menus"

    def __str__(self):
        return f"SidebarMenus {self.pk}"
