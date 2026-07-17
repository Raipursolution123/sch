from rest_framework.permissions import BasePermission

from apps.accounts.services.legacy_rbac import is_module_active, user_has_privilege


class HasLegacyPrivilege(BasePermission):
    """
    Check legacy permission_category + action on the view.

    Set on the view:
      - legacy_permission_category (e.g. 'session_setting')
      - legacy_permission_action (optional override for all methods)
      - legacy_module_short_code (optional, e.g. 'system_settings')
      - legacy_method_actions (optional dict mapping HTTP method -> action)
    """

    DEFAULT_METHOD_ACTIONS = {
        "GET": "can_view",
        "POST": "can_add",
        "PUT": "can_edit",
        "PATCH": "can_edit",
        "DELETE": "can_delete",
    }

    def has_permission(self, request, view):
        user = request.user
        if not user or not getattr(user, "is_authenticated", False):
            return False

        category = getattr(view, "legacy_permission_category", None)
        if not category:
            return False

        module_code = getattr(view, "legacy_module_short_code", None)
        if module_code and not is_module_active(module_code):
            return False

        action = getattr(view, "legacy_permission_action", None)
        if not action:
            method_actions = (
                getattr(view, "legacy_method_actions", None)
                or self.DEFAULT_METHOD_ACTIONS
            )
            action = method_actions.get(request.method)

        if not action:
            return False

        return user_has_privilege(user, category, action)
