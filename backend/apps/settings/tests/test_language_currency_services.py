from unittest.mock import MagicMock, patch

import pytest

from apps.settings.domain.settings_exceptions import (
    SettingsConflictError,
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.services.currency_service import CurrencyService
from apps.settings.services.language_service import LanguageService


@pytest.fixture
def language_service():
    return LanguageService()


@pytest.fixture
def currency_service():
    return CurrencyService()


def test_create_language_requires_fields(language_service):
    with pytest.raises(SettingsValidationError, match="required"):
        language_service.create_language({"language": "English"})


def test_create_language_rejects_duplicate(language_service):
    with patch(
        "apps.settings.services.language_service.Languages.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.exists.return_value = True
        with pytest.raises(SettingsConflictError, match="already exists"):
            language_service.create_language(
                {
                    "language": "English",
                    "short_code": "en",
                    "country_code": "US",
                }
            )


def test_delete_language_requires_inactive(language_service):
    language = MagicMock(is_active="yes")
    with patch(
        "apps.settings.services.language_service.selectors.get_language",
        return_value=language,
    ):
        with pytest.raises(SettingsValidationError, match="Deactivate"):
            language_service.delete_language(1)


def test_get_currency_not_found(currency_service):
    with patch(
        "apps.settings.services.currency_service.selectors.get_currency",
        return_value=None,
    ):
        with pytest.raises(SettingsNotFoundError):
            currency_service.get_currency(999)


def test_create_currency_requires_fields(currency_service):
    with pytest.raises(SettingsValidationError, match="required"):
        currency_service.create_currency({"name": "Indian Rupee"})


def test_delete_active_currency_rejected(currency_service):
    currency = MagicMock(is_active=1, name="INR")
    with patch(
        "apps.settings.services.currency_service.selectors.get_currency",
        return_value=currency,
    ):
        with pytest.raises(SettingsValidationError, match="active currency"):
            currency_service.delete_currency(1)
