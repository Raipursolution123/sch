import datetime
import logging
from typing import Any

from apps.settings.domain.general_settings_exceptions import SchSettingsNotFoundError
from apps.settings.domain.general_settings_validators import validate_and_normalize
from apps.settings.selectors import general_settings_selectors as selectors
from common.text_encoding import repair_utf8_cp1252_mojibake

logger = logging.getLogger(__name__)


class GeneralSettingsService:
    """Business logic for school general settings (sch_settings id=1)."""

    def get_settings(self) -> dict[str, Any]:
        settings = selectors.get_sch_settings()
        if settings is None:
            raise SchSettingsNotFoundError()
        return selectors.settings_to_dict(settings)

    def update_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        settings = selectors.get_sch_settings()
        if settings is None:
            raise SchSettingsNotFoundError()

        cleaned = validate_and_normalize(payload)
        if "currency_symbol" in cleaned:
            cleaned["currency_symbol"] = repair_utf8_cp1252_mojibake(
                cleaned["currency_symbol"]
            )
        for field, value in cleaned.items():
            setattr(settings, field, value)

        settings.updated_at = datetime.date.today()
        update_fields = [*cleaned.keys(), "updated_at"]
        settings.save(update_fields=update_fields)

        logger.info(
            "General settings updated (fields=%s).",
            ", ".join(sorted(cleaned.keys())),
        )
        return selectors.settings_to_dict(settings)
