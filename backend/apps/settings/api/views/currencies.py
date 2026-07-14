from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.settings.api.views.common import SETTINGS_MODULE, settings_error_response
from apps.settings.domain.settings_exceptions import SettingsError
from apps.settings.selectors.settings_selectors import currency_to_dict
from apps.settings.services.currency_service import CurrencyService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "currency"


class CurrenciesListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        active_only = request.query_params.get("active_only", "false").lower() == "true"
        qs = CurrencyService().list_currencies(active_only=active_only)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else qs
        currencies_data = [currency_to_dict(row) for row in rows]

        if page is not None:
            return paginator.get_paginated_response({"currencies": currencies_data})

        return APIResponse.success(
            data={"currencies": currencies_data},
            message="Currencies retrieved successfully.",
        )

    def post(self, request):
        try:
            data = CurrencyService().create_currency(request.data)
            return APIResponse.success(
                data=data,
                message=f"Currency '{data.get('name')}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class CurrenciesDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=CurrencyService().get_currency(pk),
                message="Currency retrieved successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        try:
            data = CurrencyService().update_currency(pk, request.data)
            return APIResponse.success(
                data=data, message="Currency updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def delete(self, request, pk):
        try:
            CurrencyService().delete_currency(pk)
            return APIResponse.success(
                data=None, message="Currency deleted successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class CurrenciesActivateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"POST": "can_edit"}

    def post(self, request, pk):
        try:
            data = CurrencyService().activate_currency(pk)
            return APIResponse.success(
                data=data, message="Currency activated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)
