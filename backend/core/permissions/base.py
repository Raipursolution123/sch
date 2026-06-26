from rest_framework.permissions import BasePermission

from apps.accounts.models import Role


class IsSuperAdmin(BasePermission):
    """Allow access only to users mapped to a superadmin role in `roles`."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not getattr(user, "is_authenticated", False):
            return False
        return Role.objects.filter(slug=user.role, is_superadmin=1).exists()


class HasRolePermission(BasePermission):
    """
    Role check against legacy `users.role` slug values.
    Set `required_role_slugs` on the view.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not getattr(user, "is_authenticated", False):
            return False

        if Role.objects.filter(slug=user.role, is_superadmin=1).exists():
            return True

        required_roles = getattr(view, "required_role_slugs", None)
        if not required_roles:
            return True

        return user.role in set(required_roles)
