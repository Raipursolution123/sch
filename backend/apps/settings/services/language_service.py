import logging
from typing import Any

from apps.settings.domain.settings_exceptions import (
    SettingsConflictError,
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.models.languages import Languages
from apps.settings.selectors import settings_selectors as selectors

logger = logging.getLogger(__name__)


class LanguageService:
    def list_languages(self, *, active_only: bool = False):
        return selectors.list_languages(active_only=active_only)

    def get_language(self, language_id: int) -> dict[str, Any]:
        language = selectors.get_language(language_id)
        if language is None:
            raise SettingsNotFoundError("Language not found.")
        return selectors.language_to_dict(language)

    def create_language(self, payload: dict[str, Any]) -> dict[str, Any]:
        language = str(payload.get("language") or "").strip()
        short_code = str(payload.get("short_code") or "").strip()
        country_code = str(payload.get("country_code") or "").strip()
        is_rtl = payload.get("is_rtl", 0)

        if not language or not short_code or not country_code:
            raise SettingsValidationError(
                "Language, short_code, and country_code are required."
            )

        try:
            is_rtl = int(is_rtl)
        except (TypeError, ValueError) as exc:
            raise SettingsValidationError("is_rtl must be an integer.") from exc

        if Languages.objects.filter(
            language__iexact=language, is_deleted="no"
        ).exists():
            raise SettingsConflictError(f"Language '{language}' already exists.")

        created = Languages.objects.create(
            language=language,
            short_code=short_code,
            country_code=country_code,
            is_rtl=is_rtl,
            is_active="no",
            is_deleted="no",
            created_at=selectors.now_datetime(),
        )
        logger.info("Created language id=%s name=%s", created.id, created.language)
        data = selectors.language_to_dict(created)
        data.pop("is_deleted", None)
        return data

    def update_language(
        self, language_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        language_obj = selectors.get_language(language_id)
        if language_obj is None:
            raise SettingsNotFoundError("Language not found.")

        if "language" in payload:
            language_name = str(payload.get("language") or "").strip()
            if not language_name:
                raise SettingsValidationError("Language name cannot be empty.")
            if (
                Languages.objects.filter(
                    language__iexact=language_name, is_deleted="no"
                )
                .exclude(pk=language_id)
                .exists()
            ):
                raise SettingsConflictError(
                    f"Language '{language_name}' already exists."
                )
            language_obj.language = language_name

        if "short_code" in payload:
            language_obj.short_code = str(payload.get("short_code") or "").strip()
        if "country_code" in payload:
            language_obj.country_code = str(payload.get("country_code") or "").strip()
        if "is_rtl" in payload:
            try:
                language_obj.is_rtl = int(payload["is_rtl"])
            except (TypeError, ValueError) as exc:
                raise SettingsValidationError("is_rtl must be an integer.") from exc
        if "is_active" in payload:
            is_active = str(payload["is_active"]).lower()
            if is_active not in {"yes", "no"}:
                raise SettingsValidationError("is_active must be 'yes' or 'no'.")
            language_obj.is_active = is_active

        language_obj.updated_at = selectors.today_date()
        language_obj.save()
        data = selectors.language_to_dict(language_obj)
        data.pop("is_deleted", None)
        return data

    def delete_language(self, language_id: int) -> None:
        language_obj = selectors.get_language(language_id)
        if language_obj is None:
            raise SettingsNotFoundError("Language not found.")
        if language_obj.is_active == "yes":
            raise SettingsValidationError(
                "Cannot delete an active language. Deactivate it first."
            )
        language_obj.is_deleted = "yes"
        language_obj.updated_at = selectors.today_date()
        language_obj.save()
        logger.info("Soft-deleted language id=%s", language_id)
