from django.contrib import admin

from apps.accounts.models import (
    PermissionCategory,
    PermissionGroup,
    PermissionStudent,
    Role,
    RolePermission,
    StaffRole,
    User,
    UserAuthentication,
    UserLog,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "role", "is_active", "created_at")
    list_filter = ("role", "is_active")
    search_fields = ("username",)
    ordering = ("-id",)
    readonly_fields = [f.name for f in User._meta.fields]


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "is_active", "is_superadmin", "is_system")
    list_filter = ("is_active", "is_superadmin", "is_system")
    search_fields = ("name", "slug")
    readonly_fields = [f.name for f in Role._meta.fields]


@admin.register(PermissionGroup)
class PermissionGroupAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "short_code", "is_active", "system")
    search_fields = ("name", "short_code")
    readonly_fields = [f.name for f in PermissionGroup._meta.fields]


@admin.register(PermissionCategory)
class PermissionCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "short_code", "permission_group_id")
    search_fields = ("name", "short_code")
    readonly_fields = [f.name for f in PermissionCategory._meta.fields]


@admin.register(PermissionStudent)
class PermissionStudentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "short_code", "group_id")
    search_fields = ("name", "short_code")
    readonly_fields = [f.name for f in PermissionStudent._meta.fields]


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "role_id",
        "permission_category_id",
        "can_view",
        "can_add",
        "can_edit",
        "can_delete",
    )
    list_filter = ("role",)
    readonly_fields = [f.name for f in RolePermission._meta.fields]


@admin.register(StaffRole)
class StaffRoleAdmin(admin.ModelAdmin):
    list_display = ("id", "staff_id", "role_id", "is_active")
    list_filter = ("is_active", "role")
    readonly_fields = [f.name for f in StaffRole._meta.fields]


@admin.register(UserAuthentication)
class UserAuthenticationAdmin(admin.ModelAdmin):
    list_display = ("id", "users_id", "staff_id", "expired_at")
    readonly_fields = [f.name for f in UserAuthentication._meta.fields]


@admin.register(UserLog)
class UserLogAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "role", "ipaddress", "login_datetime")
    readonly_fields = [f.name for f in UserLog._meta.fields]
