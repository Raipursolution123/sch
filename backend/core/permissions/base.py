from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """Allow access only to users mapped to a superadmin role in `roles`."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not getattr(user, "is_authenticated", False):
            return False
        return user.is_superadmin


class HasRolePermission(BasePermission):
    """
    Role check against legacy `users.role` slug values.
    Set `required_role_slugs` on the view.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not getattr(user, "is_authenticated", False):
            return False

        if user.is_superadmin:
            return True

        required_roles = getattr(view, "required_role_slugs", None)
        if not required_roles:
            return True

        return user.role_slug in set(required_roles)
