from rest_framework.permissions import BasePermission


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
        return True
