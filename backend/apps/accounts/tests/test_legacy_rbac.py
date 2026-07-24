from unittest.mock import MagicMock, patch

from apps.accounts.services.legacy_rbac import resolve_user_role, user_has_privilege


def test_superadmin_bypasses_privilege_check():
    user = MagicMock(is_authenticated=True, is_superadmin=True, role="admin")
    with patch(
        "apps.accounts.services.legacy_rbac.is_superadmin_user", return_value=True
    ):
        assert user_has_privilege(user, "session_setting", "can_delete") is True


def test_missing_role_denies_privilege():
    user = MagicMock(
        is_authenticated=True,
        is_superadmin=False,
        role=None,
        role_slug=None,
        id=1,
    )
    with patch(
        "apps.accounts.services.legacy_rbac.is_superadmin_user", return_value=False
    ):
        with patch(
            "apps.accounts.services.legacy_rbac.get_user_legacy_permissions",
            return_value={},
        ):
            assert user_has_privilege(user, "session_setting", "can_view") is False


def test_role_permission_grants_view():
    user = MagicMock(
        is_authenticated=True,
        is_superadmin=False,
        role="accountant",
        role_slug="accountant",
        id=2,
    )

    with patch(
        "apps.accounts.services.legacy_rbac.is_superadmin_user", return_value=False
    ):
        with patch(
            "apps.accounts.services.legacy_rbac.get_user_legacy_permissions",
            return_value={
                "session_setting": {
                    "can_view": True,
                    "can_add": False,
                    "can_edit": False,
                    "can_delete": False,
                }
            },
        ):
            assert user_has_privilege(user, "session_setting", "can_view") is True
            assert user_has_privilege(user, "session_setting", "can_add") is False


def test_staff_user_resolves_role_via_role_slug():
    user = MagicMock(
        is_authenticated=True,
        is_superadmin=False,
        role="staff",
        role_slug="ADMIN",
    )
    admin_role = MagicMock(is_superadmin=0)

    with patch("apps.accounts.services.legacy_rbac.Role.objects.filter") as role_filter:
        role_filter.return_value.first.return_value = admin_role
        assert resolve_user_role(user) is admin_role
        role_filter.assert_called_once()


def test_staff_user_privilege_uses_role_slug_not_staff_literal():
    user = MagicMock(
        is_authenticated=True,
        is_superadmin=False,
        role="staff",
        role_slug="ADMIN",
        id=3,
    )
    admin_role = MagicMock(is_superadmin=0)
    category = MagicMock(short_code="class")
    role_perm = MagicMock(
        permission_category=category,
        can_view=1,
        can_add=1,
        can_edit=1,
        can_delete=0,
    )

    with patch(
        "apps.accounts.services.legacy_rbac.is_superadmin_user", return_value=False
    ):
        with patch(
            "apps.accounts.services.legacy_rbac.cache_get_or_set",
            side_effect=lambda key, factory, timeout: factory(),
        ):
            with patch(
                "apps.accounts.services.legacy_rbac.resolve_user_role",
                return_value=admin_role,
            ) as resolve_mock:
                with patch(
                    "apps.accounts.services.legacy_rbac.RolePermission.objects.filter"
                ) as rp_filter:
                    rp_filter.return_value.select_related.return_value = [role_perm]
                    assert user_has_privilege(user, "class", "can_view") is True
                    resolve_mock.assert_called_once_with(user)
