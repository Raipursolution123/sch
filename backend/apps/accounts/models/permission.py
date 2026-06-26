from django.db import models


class PermissionGroup(models.Model):
    """Maps to existing `permission_group` table in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    short_code = models.CharField(max_length=100)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    system = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "permission_group"
        verbose_name = "permission group"
        verbose_name_plural = "permission groups"

    def __str__(self):
        return self.name or self.short_code


class PermissionCategory(models.Model):
    """Maps to existing `permission_category` table in db_current."""

    id = models.AutoField(primary_key=True)
    permission_group = models.ForeignKey(
        PermissionGroup,
        on_delete=models.CASCADE,
        db_column="perm_group_id",
        related_name="permission_categories",
        blank=True,
        null=True,
    )
    name = models.CharField(max_length=100, blank=True, null=True)
    short_code = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    enable_view = models.IntegerField(blank=True, null=True, default=0)
    enable_add = models.IntegerField(blank=True, null=True, default=0)
    enable_edit = models.IntegerField(blank=True, null=True, default=0)
    enable_delete = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "permission_category"
        verbose_name = "permission category"
        verbose_name_plural = "permission categories"

    def __str__(self):
        return self.name or self.short_code or str(self.id)


class PermissionStudent(models.Model):
    """Maps to existing `permission_student` table in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    short_code = models.CharField(max_length=100, blank=True, null=True)
    system = models.IntegerField()
    student = models.IntegerField()
    parent = models.IntegerField()
    group = models.ForeignKey(
        PermissionGroup,
        on_delete=models.CASCADE,
        db_column="group_id",
        related_name="permission_students",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "permission_student"
        verbose_name = "permission student"
        verbose_name_plural = "permission students"

    def __str__(self):
        return self.name or self.short_code or str(self.id)
