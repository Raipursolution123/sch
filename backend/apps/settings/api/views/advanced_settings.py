from pathlib import Path

from django.http import FileResponse

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.settings.api.views.common import SETTINGS_MODULE, settings_error_response
from apps.settings.domain.settings_exceptions import SettingsError
from apps.settings.services.backup_service import BackupService
from apps.settings.services.captcha_service import CaptchaService, captcha_to_dict
from apps.settings.services.custom_fields_service import (
    CustomFieldsService,
    custom_field_to_dict,
)
from apps.settings.services.filetypes_service import FileTypesService
from apps.settings.services.modules_service import ModulesService, module_to_dict
from apps.settings.services.sidebar_menu_service import (
    SidebarMenuService,
    menu_to_dict,
    submenu_to_dict,
)
from apps.settings.services.system_fields_service import (
    OnlineAdmissionSettingsService,
    SystemFieldsService,
)
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.base import IsSuperAdmin
from core.permissions.legacy_privilege import HasLegacyPrivilege

VIEW_ONLY_ACTIONS = {
    "GET": "can_view",
    "POST": "can_view",
    "PUT": "can_view",
    "PATCH": "can_view",
    "DELETE": "can_view",
}


def _paginated(request, view, qs, serializer):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(qs, request, view=view)
    rows = page if page is not None else list(qs)
    data = [serializer(row) for row in rows]
    if page is not None:
        return paginator.get_paginated_response(data)
    return APIResponse.success(
        data={"results": data}, message="Retrieved successfully."
    )


class ModulesListView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        qs = ModulesService().list_modules(
            search=request.query_params.get("search", "")
        )
        return _paginated(request, self, qs, module_to_dict)


class ModulesDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def patch(self, request, pk):
        try:
            data = ModulesService().update_module(pk, request.data)
            return APIResponse.success(
                data=data, message="Module updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        return self.patch(request, pk)


class CustomFieldsListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "custom_fields"
    legacy_method_actions = VIEW_ONLY_ACTIONS

    def get(self, request):
        qs = CustomFieldsService().list_fields(
            search=request.query_params.get("search", ""),
            belong_to=request.query_params.get("belong_to", ""),
        )
        return _paginated(request, self, qs, custom_field_to_dict)

    def post(self, request):
        try:
            data = CustomFieldsService().create_field(request.data)
            return APIResponse.success(
                data=data,
                message="Custom field created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class CustomFieldsDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "custom_fields"
    legacy_method_actions = VIEW_ONLY_ACTIONS

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=CustomFieldsService().get_field(pk),
                message="Custom field retrieved successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def patch(self, request, pk):
        try:
            data = CustomFieldsService().update_field(pk, request.data)
            return APIResponse.success(
                data=data, message="Custom field updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        return self.patch(request, pk)

    def delete(self, request, pk):
        try:
            CustomFieldsService().delete_field(pk)
            return APIResponse.success(data=None, message="Custom field deleted.")
        except SettingsError as exc:
            return settings_error_response(exc)


class CaptchaListView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        qs = CaptchaService().list_captchas()
        return _paginated(request, self, qs, captcha_to_dict)


class CaptchaDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def patch(self, request, pk):
        try:
            data = CaptchaService().update_captcha(pk, request.data)
            return APIResponse.success(
                data=data, message="Captcha setting updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        return self.patch(request, pk)


class SystemFieldsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "system_fields"
    legacy_method_actions = VIEW_ONLY_ACTIONS

    def get(self, request):
        return APIResponse.success(
            data=SystemFieldsService().get_fields(),
            message="System fields retrieved successfully.",
        )

    def patch(self, request):
        try:
            data = SystemFieldsService().update_fields(request.data)
            return APIResponse.success(
                data=data, message="System fields updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request):
        return self.patch(request)


class OnlineAdmissionSettingsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "online_admission"
    legacy_permission_category = "online_admission"

    def get(self, request):
        return APIResponse.success(
            data=OnlineAdmissionSettingsService().get_settings(),
            message="Online admission settings retrieved successfully.",
        )

    def patch(self, request):
        try:
            data = OnlineAdmissionSettingsService().update_settings(request.data)
            return APIResponse.success(
                data=data, message="Online admission settings updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request):
        return self.patch(request)


class OnlineAdmissionFieldsListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "online_admission"
    legacy_permission_category = "online_admission"

    def get(self, request):
        service = OnlineAdmissionSettingsService()
        qs = service.list_fields()
        return _paginated(request, self, qs, service.field_to_dict)

    def post(self, request):
        try:
            data = OnlineAdmissionSettingsService().create_field(request.data)
            return APIResponse.success(
                data=data,
                message="Online admission field created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class OnlineAdmissionFieldsDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "online_admission"
    legacy_permission_category = "online_admission"

    def patch(self, request, pk):
        try:
            data = OnlineAdmissionSettingsService().update_field(pk, request.data)
            return APIResponse.success(
                data=data, message="Online admission field updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        return self.patch(request, pk)


class SidebarMenusListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "sidebar_menu"
    legacy_method_actions = VIEW_ONLY_ACTIONS

    def get(self, request):
        qs = SidebarMenuService().list_menus()
        return _paginated(request, self, qs, menu_to_dict)


class SidebarMenusDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "sidebar_menu"
    legacy_method_actions = VIEW_ONLY_ACTIONS

    def patch(self, request, pk):
        try:
            data = SidebarMenuService().update_menu(pk, request.data)
            return APIResponse.success(
                data=data, message="Sidebar menu updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        return self.patch(request, pk)


class SidebarSubMenusListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "sidebar_menu"
    legacy_method_actions = VIEW_ONLY_ACTIONS

    def get(self, request):
        menu_id = request.query_params.get("menu_id")
        parsed = int(menu_id) if menu_id else None
        qs = SidebarMenuService().list_submenus(menu_id=parsed)
        return _paginated(request, self, qs, submenu_to_dict)


class SidebarSubMenusDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "sidebar_menu"
    legacy_method_actions = VIEW_ONLY_ACTIONS

    def patch(self, request, pk):
        try:
            data = SidebarMenuService().update_submenu(pk, request.data)
            return APIResponse.success(
                data=data, message="Sidebar submenu updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        return self.patch(request, pk)


class FileTypesView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        try:
            return APIResponse.success(
                data=FileTypesService().get_settings(),
                message="File types retrieved successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def patch(self, request):
        try:
            data = FileTypesService().update_settings(request.data)
            return APIResponse.success(
                data=data, message="File types updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request):
        return self.patch(request)


class BackupListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "backup"

    def get(self, request):
        service = BackupService()
        return APIResponse.success(
            data={
                "results": service.list_backups(),
                "restore_allowed": service.restore_allowed(),
            },
            message="Backups retrieved successfully.",
        )

    def post(self, request):
        try:
            data = BackupService().create_backup()
            return APIResponse.success(
                data=data,
                message="Backup created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class BackupDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "backup"

    def get(self, request, filename):
        try:
            path = BackupService().resolve_path(filename)
            return FileResponse(
                path.open("rb"),
                as_attachment=True,
                filename=Path(filename).name,
                content_type="application/sql",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def delete(self, request, filename):
        try:
            BackupService().delete_backup(filename)
            return APIResponse.success(
                data=None, message="Backup deleted successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class BackupRestoreView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "backup"
    legacy_method_actions = {"POST": "can_add"}

    def post(self, request, filename):
        try:
            data = BackupService().restore_backup(filename)
            return APIResponse.success(
                data=data, message="Database restored successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)
