from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.accounts.services.role_service import RoleService, role_to_dict
from apps.settings.api.views.common import SETTINGS_MODULE, settings_error_response
from apps.settings.domain.settings_exceptions import SettingsError
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

# SPA nav uses permissionKeys: ['roles']. Category may be absent in older DBs;
# superadmin bypasses. School admins need a matching roles_permissions row.
CATEGORY = "roles"


class RolesListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        active_only = request.query_params.get("active_only", "false").lower() == "true"
        qs = RoleService().list_roles(active_only=active_only)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else list(qs)
        data = [role_to_dict(row) for row in rows]
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(
            data=data,
            message="Roles retrieved successfully.",
        )


class RoleDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=RoleService().get_role_detail(pk),
                message="Role details retrieved successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class RolePermissionsUpdateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY
    # Seed often only grants can_view for settings-style categories.
    legacy_method_actions = {
        "PUT": "can_view",
        "PATCH": "can_view",
    }

    def put(self, request, pk):
        try:
            data = RoleService().update_role_permissions(pk, request.data)
            return APIResponse.success(
                data=data,
                message="Role permissions updated successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    patch = put
