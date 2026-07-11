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
    )
    with patch(
        "apps.accounts.services.legacy_rbac.is_superadmin_user", return_value=False
    ):
        assert user_has_privilege(user, "session_setting", "can_view") is False


def test_role_permission_grants_view():
    user = MagicMock(
        is_authenticated=True,
        is_superadmin=False,
        role="accountant",
        role_slug="accountant",
    )
    role = MagicMock(is_superadmin=0)
    category = MagicMock(short_code="session_setting")
    role_perm = MagicMock(can_view=1, can_add=0, can_edit=0, can_delete=0)

    with patch(
        "apps.accounts.services.legacy_rbac.is_superadmin_user", return_value=False
    ):
        with patch(
            "apps.accounts.services.legacy_rbac.Role.objects.filter"
        ) as role_filter:
            role_filter.return_value.first.return_value = role
            with patch(
                "apps.accounts.services.legacy_rbac.PermissionCategory.objects.filter"
            ) as cat_filter:
                cat_filter.return_value.first.return_value = category
                with patch(
                    "apps.accounts.services.legacy_rbac.RolePermission.objects.filter"
                ) as rp_filter:
                    rp_filter.return_value.first.return_value = role_perm
                    assert (
                        user_has_privilege(user, "session_setting", "can_view") is True
                    )
                    assert (
                        user_has_privilege(user, "session_setting", "can_add") is False
                    )


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
    )
    admin_role = MagicMock(is_superadmin=0)
    category = MagicMock(short_code="class")
    role_perm = MagicMock(can_view=1, can_add=1, can_edit=1, can_delete=0)

    with patch(
        "apps.accounts.services.legacy_rbac.is_superadmin_user", return_value=False
    ):
        with patch(
            "apps.accounts.services.legacy_rbac.resolve_user_role",
            return_value=admin_role,
        ):
            with patch(
                "apps.accounts.services.legacy_rbac.PermissionCategory.objects.filter"
            ) as cat_filter:
                cat_filter.return_value.first.return_value = category
                with patch(
                    "apps.accounts.services.legacy_rbac.RolePermission.objects.filter"
                ) as rp_filter:
                    rp_filter.return_value.first.return_value = role_perm
                    assert user_has_privilege(user, "class", "can_view") is True
