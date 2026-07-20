from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.settings.api.views.common import SETTINGS_MODULE, settings_error_response
from apps.settings.domain.settings_exceptions import SettingsError
from apps.settings.selectors.settings_selectors import language_to_dict
from apps.settings.services.language_service import LanguageService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "languages"


class LanguagesListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        active_only = request.query_params.get("active_only", "false").lower() == "true"
        qs = LanguageService().list_languages(active_only=active_only)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else qs
        languages_data = [language_to_dict(row) for row in rows]

        if page is not None:
            return paginator.get_paginated_response(languages_data)

        return APIResponse.success(
            data={"languages": languages_data},
            message="Languages retrieved successfully.",
        )

    def post(self, request):
        try:
            data = LanguageService().create_language(request.data)
            return APIResponse.success(
                data=data,
                message=f"Language '{data.get('language')}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class LanguagesDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=LanguageService().get_language(pk),
                message="Language details retrieved successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def put(self, request, pk):
        try:
            data = LanguageService().update_language(pk, request.data)
            return APIResponse.success(
                data=data, message="Language updated successfully."
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    patch = put

    def delete(self, request, pk):
        try:
            LanguageService().delete_language(pk)
            return APIResponse.success(message="Language successfully deleted.")
        except SettingsError as exc:
            return settings_error_response(exc)
