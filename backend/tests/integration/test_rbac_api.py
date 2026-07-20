from unittest.mock import MagicMock, patch

from rest_framework import status


def test_student_list_requires_authentication(api_client):
    response = api_client.get("/api/v1/students/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_student_list_denies_without_privilege(api_client):
    user = MagicMock()
    user.is_authenticated = True
    user.is_superadmin = False
    user.role = "guest"
    user.role_slug = "guest"
    api_client.force_authenticate(user=user)

    with patch("core.permissions.legacy_privilege.is_module_active", return_value=True):
        with patch(
            "apps.accounts.services.legacy_rbac.get_user_legacy_permissions",
            return_value={},
        ):
            response = api_client.get("/api/v1/students/")

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_student_list_allows_with_view_privilege(api_client):
    user = MagicMock()
    user.is_authenticated = True
    user.is_superadmin = False
    user.role = "admin"
    user.role_slug = "admin"
    api_client.force_authenticate(user=user)

    with patch("core.permissions.legacy_privilege.is_module_active", return_value=True):
        with patch(
            "apps.accounts.services.legacy_rbac.get_user_legacy_permissions",
            return_value={
                "student": {
                    "can_view": True,
                    "can_add": False,
                    "can_edit": False,
                    "can_delete": False,
                }
            },
        ):
            with patch(
                "apps.students.services.student_service.StudentService.list_students",
                return_value=[],
            ):
                with patch(
                    "apps.students.services.student_service.StudentService.enrich_list_page",
                    return_value=[],
                ):
                    response = api_client.get("/api/v1/students/")

    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body.get("success") is True or "results" in body
