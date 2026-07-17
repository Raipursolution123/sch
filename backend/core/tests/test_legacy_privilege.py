from unittest.mock import MagicMock, patch

from core.permissions.legacy_privilege import HasLegacyPrivilege


def _request(method="GET", authenticated=True):
    user = MagicMock(is_authenticated=authenticated)
    request = MagicMock(method=method, user=user)
    return request


def _view(category="student", module=None, action=None, method_actions=None):
    view = MagicMock()
    view.legacy_permission_category = category
    view.legacy_module_short_code = module
    view.legacy_permission_action = action
    view.legacy_method_actions = method_actions
    return view


@patch("core.permissions.legacy_privilege.user_has_privilege", return_value=True)
@patch("core.permissions.legacy_privilege.is_module_active", return_value=True)
def test_grants_when_user_has_privilege(_module_active, user_has_privilege):
    permission = HasLegacyPrivilege()
    request = _request("POST")
    view = _view(category="student", module="student_information")

    assert permission.has_permission(request, view) is True
    user_has_privilege.assert_called_once_with(request.user, "student", "can_add")


@patch("core.permissions.legacy_privilege.user_has_privilege", return_value=False)
@patch("core.permissions.legacy_privilege.is_module_active", return_value=True)
def test_denies_when_user_lacks_privilege(_module_active, _user_has_privilege):
    permission = HasLegacyPrivilege()
    request = _request("DELETE")
    view = _view(category="student", module="student_information")

    assert permission.has_permission(request, view) is False


@patch("core.permissions.legacy_privilege.is_module_active", return_value=False)
def test_denies_when_module_inactive(_module_active):
    permission = HasLegacyPrivilege()
    request = _request("GET")
    view = _view(category="student", module="student_information")

    assert permission.has_permission(request, view) is False


def test_denies_unauthenticated_user():
    permission = HasLegacyPrivilege()
    request = _request(authenticated=False)
    view = _view(category="student")

    assert permission.has_permission(request, view) is False


def test_denies_when_category_missing():
    permission = HasLegacyPrivilege()
    request = _request("GET")
    view = _view(category=None)

    assert permission.has_permission(request, view) is False
