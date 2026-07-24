from unittest.mock import MagicMock, patch

import pytest

from apps.accounts.services.role_service import RoleService
from apps.accounts.services.user_account_service import UserAccountService
from apps.settings.domain.settings_exceptions import (
    SettingsNotFoundError,
    SettingsValidationError,
)


@pytest.fixture
def role_service():
    return RoleService()


@pytest.fixture
def user_service():
    return UserAccountService()


def test_update_role_permissions_rejects_superadmin(role_service):
    role = MagicMock(is_superadmin=1)
    with patch.object(role_service, "get_role", return_value=role):
        with pytest.raises(SettingsValidationError, match="superadmin"):
            role_service.update_role_permissions(1, {"permissions": []})


def test_update_role_permissions_requires_list(role_service):
    role = MagicMock(is_superadmin=0)
    with patch.object(role_service, "get_role", return_value=role):
        with pytest.raises(SettingsValidationError, match="permissions must be a list"):
            role_service.update_role_permissions(1, {"permissions": "bad"})


def test_get_user_not_found(user_service):
    with patch(
        "apps.accounts.services.user_account_service.User.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = None
        with pytest.raises(SettingsNotFoundError):
            user_service.get_user(999)


def test_update_user_requires_payload_fields(user_service):
    user = MagicMock(id=1, user_id=10, is_active="yes")
    with patch.object(user_service, "get_user", return_value=user):
        with pytest.raises(SettingsValidationError, match="Provide is_active"):
            user_service.update_user(1, {})
