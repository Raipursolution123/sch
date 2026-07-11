"""Legacy RBAC checks against roles_permissions and permission_group."""

from django.db.models import Q

from apps.accounts.models import (
    PermissionCategory,
    PermissionGroup,
    Role,
    RolePermission,
)

PRIVILEGE_ACTIONS = frozenset({"can_view", "can_add", "can_edit", "can_delete"})


def is_superadmin_user(user) -> bool:
    if not user or not getattr(user, "is_authenticated", False):
        return False
    return bool(getattr(user, "is_superadmin", False))


def is_module_active(module_short_code: str) -> bool:
    return PermissionGroup.objects.filter(
        short_code=module_short_code, is_active=1
    ).exists()


def user_has_privilege(user, category_short_code: str, action: str) -> bool:
    if action not in PRIVILEGE_ACTIONS:
        return False
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if is_superadmin_user(user):
        return True

    role_slug = getattr(user, "role", None)
    if not role_slug:
        return False

    role = Role.objects.filter(Q(slug=role_slug) | Q(name=role_slug)).first()
    if role is None:
        return False
    if role.is_superadmin:
        return True

    category = PermissionCategory.objects.filter(short_code=category_short_code).first()
    if category is None:
        return False

    role_perm = RolePermission.objects.filter(
        role=role, permission_category=category
    ).first()
    if role_perm is None:
        return False

    return bool(getattr(role_perm, action, 0))


def get_user_legacy_permissions(user) -> dict[str, dict[str, bool]]:
    """Return {short_code: {can_view, can_add, can_edit, can_delete}} for /me."""
    if not user or not getattr(user, "is_authenticated", False):
        return {}

    if is_superadmin_user(user):
        categories = PermissionCategory.objects.all()
        return {
            cat.short_code: {
                "can_view": True,
                "can_add": True,
                "can_edit": True,
                "can_delete": True,
            }
            for cat in categories
            if cat.short_code
        }

    role_slug = getattr(user, "role", None)
    role = (
        Role.objects.filter(Q(slug=role_slug) | Q(name=role_slug)).first()
        if role_slug
        else None
    )
    if role is None:
        return {}

    perms: dict[str, dict[str, bool]] = {}
    for rp in RolePermission.objects.filter(role=role).select_related(
        "permission_category"
    ):
        cat = rp.permission_category
        if cat is None or not cat.short_code:
            continue
        perms[cat.short_code] = {
            "can_view": bool(rp.can_view),
            "can_add": bool(rp.can_add),
            "can_edit": bool(rp.can_edit),
            "can_delete": bool(rp.can_delete),
        }
    return perms
