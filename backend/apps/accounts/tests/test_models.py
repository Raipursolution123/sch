import pytest

from apps.accounts.models import Role, User


@pytest.mark.django_db(databases=["default"])
class TestLegacyUserModel:
    def test_user_maps_to_db_current_table(self):
        assert User._meta.db_table == "users"
        assert User._meta.managed is False

    def test_user_field_names_match_db_current(self):
        field_names = {field.name for field in User._meta.fields}
        expected = {
            "id",
            "user_id",
            "username",
            "password",
            "childs",
            "role",
            "lang_id",
            "currency_id",
            "verification_code",
            "is_active",
            "created_at",
            "updated_at",
        }
        assert expected == field_names


@pytest.mark.django_db(databases=["default"])
class TestLegacyRoleModel:
    def test_role_maps_to_db_current_table(self):
        assert Role._meta.db_table == "roles"
        assert Role._meta.managed is False

    def test_roles_permissions_table_name(self):
        from apps.accounts.models import RolePermission

        assert RolePermission._meta.db_table == "roles_permissions"

    def test_staff_roles_table_name(self):
        from apps.accounts.models import StaffRole

        assert StaffRole._meta.db_table == "staff_roles"


@pytest.mark.django_db(databases=["default"])
class TestHealthEndpoint:
    def test_health_check(self, client):
        response = client.get("/health/")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
