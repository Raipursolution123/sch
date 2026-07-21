from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.accounts.services.role_service import RoleService, role_to_dict
from apps.accounts.services.user_account_service import UserAccountService
from apps.settings.api.views.common import SETTINGS_MODULE, settings_error_response
from apps.settings.domain.settings_exceptions import SettingsError
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "user_status"


class UsersListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        q = request.query_params.get("q", "")
        rows = UserAccountService().search_users(q=q)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(rows, request, view=self)
        data = page if page is not None else rows
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(
            data=data,
            message="Users retrieved successfully.",
        )


class UserRoleOptionsView(APIView):
    """Assignable roles for the user-edit form (gated by user_status, not roles)."""

    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        qs = RoleService().list_roles(active_only=True)
        data = [role_to_dict(row) for row in qs]
        return APIResponse.success(
            data=data,
            message="Role options retrieved successfully.",
        )


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY
    # user_status category typically only has can_view in seed data.
    legacy_method_actions = {
        "GET": "can_view",
        "PUT": "can_view",
        "PATCH": "can_view",
    }

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=UserAccountService().get_user_detail(pk),
                message="User details retrieved successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        try:
            data = UserAccountService().update_user(pk, request.data)
            return APIResponse.success(
                data=data,
                message="User updated successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    patch = put
