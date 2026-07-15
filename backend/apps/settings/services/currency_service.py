import logging
from typing import Any

from django.db import transaction

from apps.settings.domain.settings_exceptions import (
    SettingsConflictError,
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.models.currencies import Currencies
from apps.settings.selectors import settings_selectors as selectors
from common.text_encoding import repair_utf8_cp1252_mojibake

logger = logging.getLogger(__name__)


class CurrencyService:
    def list_currencies(self, *, active_only: bool = False):
        return selectors.list_currencies(active_only=active_only)

    def get_currency(self, currency_id: int) -> dict[str, Any]:
        currency = selectors.get_currency(currency_id)
        if currency is None:
            raise SettingsNotFoundError("Currency not found.")
        return selectors.currency_to_dict(currency)

    def create_currency(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name") or "").strip()
        short_name = str(payload.get("short_name") or "").strip()
        symbol = str(payload.get("symbol") or "").strip()
        base_price = payload.get("base_price", "1")
        is_active = payload.get("is_active", 0)

        if not name or not short_name or not symbol:
            raise SettingsValidationError("Name, short_name, and symbol are required.")

        try:
            is_active = int(is_active)
        except (TypeError, ValueError) as exc:
            raise SettingsValidationError("is_active must be an integer.") from exc

        if Currencies.objects.filter(name__iexact=name).exists():
            raise SettingsConflictError(f"Currency '{name}' already exists.")

        created = Currencies.objects.create(
            name=name,
            short_name=short_name,
            symbol=repair_utf8_cp1252_mojibake(symbol),
            base_price=str(base_price).strip(),
            is_active=is_active,
            created_at=selectors.now_datetime(),
        )
        logger.info("Created currency id=%s name=%s", created.id, created.name)
        return selectors.currency_to_dict(created)

    def update_currency(
        self, currency_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        currency = selectors.get_currency(currency_id)
        if currency is None:
            raise SettingsNotFoundError("Currency not found.")

        if "name" in payload:
            name = str(payload.get("name") or "").strip()
            if not name:
                raise SettingsValidationError("Currency name cannot be empty.")
            if (
                Currencies.objects.filter(name__iexact=name)
                .exclude(pk=currency_id)
                .exists()
            ):
                raise SettingsConflictError(f"Currency '{name}' already exists.")
            currency.name = name

        if "short_name" in payload:
            currency.short_name = str(payload.get("short_name") or "").strip()
        if "symbol" in payload:
            currency.symbol = repair_utf8_cp1252_mojibake(
                str(payload.get("symbol") or "").strip()
            )
        if "base_price" in payload:
            currency.base_price = str(payload.get("base_price") or "").strip()
        if "is_active" in payload:
            try:
                currency.is_active = int(payload["is_active"])
            except (TypeError, ValueError) as exc:
                raise SettingsValidationError("is_active must be an integer.") from exc

        currency.save()
        return selectors.currency_to_dict(currency)

    def delete_currency(self, currency_id: int) -> None:
        currency = selectors.get_currency(currency_id)
        if currency is None:
            raise SettingsNotFoundError("Currency not found.")
        if currency.is_active == 1:
            raise SettingsValidationError(
                "Cannot delete an active currency. Activate another currency first."
            )
        name = currency.name
        currency.delete()
        logger.info("Deleted currency id=%s name=%s", currency_id, name)

    def activate_currency(self, currency_id: int) -> dict[str, Any]:
        currency = selectors.get_currency(currency_id)
        if currency is None:
            raise SettingsNotFoundError("Currency not found.")

        with transaction.atomic():
            Currencies.objects.all().update(is_active=0)
            currency.is_active = 1
            currency.save()

        logger.info("Activated currency id=%s", currency_id)
        return selectors.currency_to_dict(currency)
