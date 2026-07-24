from unittest.mock import MagicMock, patch

import pytest

from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)
from apps.settings.services.backup_service import BackupService
from apps.settings.services.captcha_service import CaptchaService
from apps.settings.services.custom_fields_service import CustomFieldsService
from apps.settings.services.filetypes_service import FileTypesService
from apps.settings.services.modules_service import ModulesService
from apps.settings.services.sidebar_menu_service import SidebarMenuService


def test_modules_require_is_active():
    with patch(
        "apps.settings.services.modules_service.PermissionGroup.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = MagicMock(system=0)
        with pytest.raises(SettingsValidationError, match="is_active"):
            ModulesService().update_module(1, {})


def test_modules_cannot_disable_system():
    row = MagicMock(system=1, is_active=1)
    with patch(
        "apps.settings.services.modules_service.PermissionGroup.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = row
        with pytest.raises(SettingsValidationError, match="system module"):
            ModulesService().update_module(1, {"is_active": 0})


def test_custom_fields_create_requires_fields():
    with pytest.raises(SettingsValidationError, match="required"):
        CustomFieldsService().create_field({"name": "Blood Group"})


def test_captcha_requires_status():
    with patch(
        "apps.settings.services.captcha_service.Captcha.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = MagicMock()
        with pytest.raises(SettingsValidationError, match="status"):
            CaptchaService().update_captcha(1, {})


def test_filetypes_not_found():
    with patch(
        "apps.settings.services.filetypes_service.Filetypes.objects.order_by"
    ) as order_mock:
        order_mock.return_value.first.return_value = None
        with pytest.raises(SettingsNotFoundError):
            FileTypesService().get_settings()


def test_sidebar_menu_requires_fields():
    with patch(
        "apps.settings.services.sidebar_menu_service.SidebarMenus.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = MagicMock()
        with pytest.raises(SettingsValidationError, match="No sidebar menu"):
            SidebarMenuService().update_menu(1, {})


def test_backup_rejects_bad_filename():
    with pytest.raises(SettingsValidationError, match="Invalid backup"):
        BackupService().resolve_path("../evil.sql")


def test_backup_restore_disabled_by_default(settings):
    settings.ALLOW_DATABASE_RESTORE = False
    with pytest.raises(SettingsValidationError, match="disabled"):
        BackupService().restore_backup("backup_20260101_120000.sql")
