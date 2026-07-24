from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.settings.api.views.common import SETTINGS_MODULE, settings_error_response
from apps.settings.domain.settings_exceptions import SettingsError
from apps.settings.services.email_config_service import EmailConfigService
from apps.settings.services.notification_setting_service import (
    NotificationSettingService,
    notification_setting_to_dict,
)
from apps.settings.services.payment_methods_service import PaymentMethodsService
from apps.settings.services.print_headerfooter_service import PrintHeaderFooterService
from apps.settings.services.sms_config_service import SmsConfigService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


def _paginated_list(request, view, qs, rows_builder):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(qs, request, view=view)
    rows = page if page is not None else list(qs)
    data = rows_builder(rows)
    if page is not None:
        return paginator.get_paginated_response(data)
    return APIResponse.success(
        data={"results": data}, message="Retrieved successfully."
    )


class NotificationSettingsListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "notification_setting"

    def get(self, request):
        search = request.query_params.get("search", "")
        qs = NotificationSettingService().list_settings(search=search)
        return _paginated_list(
            request,
            self,
            qs,
            lambda rows: [notification_setting_to_dict(row) for row in rows],
        )

    def post(self, request):
        try:
            data = NotificationSettingService().create_setting(request.data)
            return APIResponse.success(
                data=data,
                message="Notification setting created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class NotificationSettingsDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "notification_setting"

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=NotificationSettingService().get_setting(pk),
                message="Notification setting retrieved successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        try:
            data = NotificationSettingService().update_setting(pk, request.data)
            return APIResponse.success(
                data=data, message="Notification setting updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def delete(self, request, pk):
        try:
            NotificationSettingService().delete_setting(pk)
            return APIResponse.success(
                data=None, message="Notification setting deleted successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class SmsConfigListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "sms_setting"

    def get(self, request):
        service = SmsConfigService()
        qs = service.list_configs()
        return _paginated_list(
            request, self, qs, lambda rows: [service.get_config(row.id) for row in rows]
        )

    def post(self, request):
        try:
            data = SmsConfigService().create_config(request.data)
            return APIResponse.success(
                data=data,
                message="SMS config created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class SmsConfigDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "sms_setting"

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=SmsConfigService().get_config(pk),
                message="SMS config retrieved successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        try:
            data = SmsConfigService().update_config(pk, request.data)
            return APIResponse.success(
                data=data, message="SMS config updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def delete(self, request, pk):
        try:
            SmsConfigService().delete_config(pk)
            return APIResponse.success(
                data=None, message="SMS config deleted successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class SmsConfigActivateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "sms_setting"
    legacy_method_actions = {"POST": "can_edit"}

    def post(self, request, pk):
        try:
            data = SmsConfigService().activate_config(pk)
            return APIResponse.success(
                data=data, message="SMS config activated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class EmailConfigListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "email_setting"

    def get(self, request):
        service = EmailConfigService()
        qs = service.list_configs()
        return _paginated_list(
            request, self, qs, lambda rows: [service.get_config(row.id) for row in rows]
        )

    def post(self, request):
        try:
            data = EmailConfigService().create_config(request.data)
            return APIResponse.success(
                data=data,
                message="Email config created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class EmailConfigDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "email_setting"

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=EmailConfigService().get_config(pk),
                message="Email config retrieved successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        try:
            data = EmailConfigService().update_config(pk, request.data)
            return APIResponse.success(
                data=data, message="Email config updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def delete(self, request, pk):
        try:
            EmailConfigService().delete_config(pk)
            return APIResponse.success(
                data=None, message="Email config deleted successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class EmailConfigActivateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "email_setting"
    legacy_method_actions = {"POST": "can_edit"}

    def post(self, request, pk):
        try:
            data = EmailConfigService().activate_config(pk)
            return APIResponse.success(
                data=data, message="Email config activated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class PaymentMethodsListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "payment_methods"

    def get(self, request):
        service = PaymentMethodsService()
        qs = service.list_methods()
        return _paginated_list(
            request, self, qs, lambda rows: [service.get_method(row.id) for row in rows]
        )

    def post(self, request):
        try:
            data = PaymentMethodsService().create_method(request.data)
            return APIResponse.success(
                data=data,
                message="Payment method created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class PaymentMethodsDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "payment_methods"

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=PaymentMethodsService().get_method(pk),
                message="Payment method retrieved successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        try:
            data = PaymentMethodsService().update_method(pk, request.data)
            return APIResponse.success(
                data=data, message="Payment method updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def delete(self, request, pk):
        try:
            PaymentMethodsService().delete_method(pk)
            return APIResponse.success(
                data=None, message="Payment method deleted successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class PaymentMethodsActivateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "payment_methods"
    legacy_method_actions = {"POST": "can_edit"}

    def post(self, request, pk):
        try:
            data = PaymentMethodsService().activate_method(pk)
            return APIResponse.success(
                data=data, message="Payment method activated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class PrintHeaderFooterListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "print_header_footer"

    def get(self, request):
        service = PrintHeaderFooterService()
        qs = service.list_items()
        return _paginated_list(
            request, self, qs, lambda rows: [service.get_item(row.id) for row in rows]
        )

    def post(self, request):
        try:
            created_by = getattr(request.user, "id", 0) or 0
            data = PrintHeaderFooterService().create_item(
                request.data, created_by=created_by
            )
            return APIResponse.success(
                data=data,
                message="Print header/footer created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class PrintHeaderFooterDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = "print_header_footer"

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=PrintHeaderFooterService().get_item(pk),
                message="Print header/footer retrieved successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        try:
            data = PrintHeaderFooterService().update_item(pk, request.data)
            return APIResponse.success(
                data=data, message="Print header/footer updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def delete(self, request, pk):
        try:
            PrintHeaderFooterService().delete_item(pk)
            return APIResponse.success(
                data=None, message="Print header/footer deleted successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)
