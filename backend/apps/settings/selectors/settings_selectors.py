from typing import Any

from django.utils import timezone

from apps.settings.models.currencies import Currencies
from apps.settings.models.languages import Languages
from common.text_encoding import repair_utf8_cp1252_mojibake


def now_datetime():
    return timezone.now()


def today_date():
    return timezone.now().date()


def language_to_dict(language: Languages) -> dict[str, Any]:
    return {
        "id": language.id,
        "language": language.language,
        "short_code": language.short_code,
        "country_code": language.country_code,
        "is_rtl": language.is_rtl,
        "is_active": language.is_active,
        "is_deleted": language.is_deleted,
        "created_at": (
            language.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if language.created_at
            else None
        ),
        "updated_at": (
            language.updated_at.strftime("%Y-%m-%d") if language.updated_at else None
        ),
    }


def currency_to_dict(currency: Currencies) -> dict[str, Any]:
    return {
        "id": currency.id,
        "name": currency.name,
        "short_name": currency.short_name,
        "symbol": repair_utf8_cp1252_mojibake(currency.symbol),
        "base_price": currency.base_price,
        "is_active": currency.is_active,
        "created_at": (
            currency.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if currency.created_at
            else None
        ),
    }


def list_languages(*, active_only: bool = False):
    qs = Languages.objects.filter(is_deleted="no").order_by("language")
    if active_only:
        qs = qs.filter(is_active="yes")
    return qs


def get_language(language_id: int) -> Languages | None:
    return Languages.objects.filter(id=language_id, is_deleted="no").first()


def list_currencies(*, active_only: bool = False):
    qs = Currencies.objects.all().order_by("name")
    if active_only:
        qs = qs.filter(is_active=1)
    return qs


def get_currency(currency_id: int) -> Currencies | None:
    return Currencies.objects.filter(id=currency_id).first()
