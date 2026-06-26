from django.db import models


class Role(models.Model):
    """Maps to existing `roles` table in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    slug = models.CharField(max_length=150, blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    is_system = models.IntegerField(default=0)
    is_superadmin = models.IntegerField(default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "roles"
        verbose_name = "role"
        verbose_name_plural = "roles"

    def __str__(self):
        return self.name or self.slug or str(self.id)


class RolePermission(models.Model):
    """Maps to existing `roles_permissions` table in db_current."""

    id = models.AutoField(primary_key=True)
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        db_column="role_id",
        related_name="roles_permissions",
        blank=True,
        null=True,
    )
    permission_category = models.ForeignKey(
        "accounts.PermissionCategory",
        on_delete=models.CASCADE,
        db_column="perm_cat_id",
        related_name="roles_permissions",
        blank=True,
        null=True,
    )
    can_view = models.IntegerField(blank=True, null=True)
    can_add = models.IntegerField(blank=True, null=True)
    can_edit = models.IntegerField(blank=True, null=True)
    can_delete = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()
    is_central = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "roles_permissions"
        verbose_name = "role permission"
        verbose_name_plural = "role permissions"

    def __str__(self):
        return f"{self.role_id} -> {self.permission_category_id}"


class StaffRole(models.Model):
    """Maps to existing `staff_roles` table in db_current."""

    id = models.AutoField(primary_key=True)
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        db_column="role_id",
        related_name="staff_roles",
        blank=True,
        null=True,
    )
    staff_id = models.IntegerField(blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "staff_roles"
        verbose_name = "staff role"
        verbose_name_plural = "staff roles"

    def __str__(self):
        return f"staff={self.staff_id} role={self.role_id}"
