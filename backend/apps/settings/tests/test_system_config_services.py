from unittest.mock import MagicMock, patch

import pytest

from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.services.email_config_service import EmailConfigService
from apps.settings.services.notification_setting_service import NotificationSettingService
from apps.settings.services.payment_methods_service import PaymentMethodsService
from apps.settings.services.print_headerfooter_service import PrintHeaderFooterService
from apps.settings.services.secret_utils import (
    as_enabled_disabled,
    as_yes_no,
    mask_secret,
    resolve_secret,
)
from apps.settings.services.sms_config_service import SmsConfigService


def test_mask_secret_and_resolve():
    assert mask_secret("abcdef") == "**cdef"
    assert resolve_secret("****ef", "secret123") == "secret123"
    assert resolve_secret("newsecret", "old") == "newsecret"
    assert as_yes_no(True) == "yes"
    assert as_enabled_disabled(False) == "disabled"


def test_notification_create_requires_fields():
    with pytest.raises(SettingsValidationError, match="required"):
        NotificationSettingService().create_setting({"type": "student_admission"})


def test_notification_get_not_found():
    with patch(
        "apps.settings.services.notification_setting_service.NotificationSetting.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = None
        with pytest.raises(SettingsNotFoundError):
            NotificationSettingService().get_setting(999)


def test_sms_create_requires_fields():
    with pytest.raises(SettingsValidationError, match="required"):
        SmsConfigService().create_config({"name": "Twilio"})


def test_sms_delete_active_rejected():
    row = MagicMock(is_active="enabled")
    with patch(
        "apps.settings.services.sms_config_service.SmsConfig.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = row
        with pytest.raises(SettingsValidationError, match="active SMS"):
            SmsConfigService().delete_config(1)


def test_email_create_requires_type():
    with pytest.raises(SettingsValidationError, match="email_type"):
        EmailConfigService().create_config({})


def test_email_delete_active_rejected():
    row = MagicMock(is_active="yes")
    with patch(
        "apps.settings.services.email_config_service.EmailConfig.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = row
        with pytest.raises(SettingsValidationError, match="active email"):
            EmailConfigService().delete_config(1)


def test_payment_create_requires_type():
    with pytest.raises(SettingsValidationError, match="payment_type"):
        PaymentMethodsService().create_method({})


def test_payment_delete_active_rejected():
    row = MagicMock(is_active="yes")
    with patch(
        "apps.settings.services.payment_methods_service.PaymentSettings.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = row
        with pytest.raises(SettingsValidationError, match="active payment"):
            PaymentMethodsService().delete_method(1)


def test_print_create_requires_fields():
    with pytest.raises(SettingsValidationError, match="required"):
        PrintHeaderFooterService().create_item({"print_type": "receipt"})
