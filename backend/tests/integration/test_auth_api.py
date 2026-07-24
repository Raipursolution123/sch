from unittest.mock import MagicMock, patch

from django.test import override_settings
from rest_framework import status


def test_login_rejects_invalid_credentials(api_client):
    with patch("apps.accounts.views.auth.authenticate", return_value=None):
        response = api_client.post(
            "/api/v1/auth/login/",
            {"username": "nobody", "password": "wrong"},
            format="json",
        )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["success"] is False


def test_login_success_returns_user_and_tokens(api_client):
    user = MagicMock(is_active_user=True)
    with patch("apps.accounts.views.auth.authenticate", return_value=user):
        with patch(
            "apps.accounts.views.auth.enrich_user_payload",
            return_value={"id": 1, "username": "admin"},
        ):
            response = api_client.post(
                "/api/v1/auth/login/",
                {"username": "admin", "password": "secret"},
                format="json",
            )
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["success"] is True
    assert "tokens" in body["data"]
    assert body["data"]["tokens"]["access"]


def test_me_requires_authentication(api_client):
    response = api_client.get("/api/v1/auth/me/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_me_returns_user_when_authenticated(api_client):
    user = MagicMock(is_authenticated=True)
    api_client.force_authenticate(user=user)
    with patch(
        "apps.accounts.views.auth.enrich_user_payload",
        return_value={"id": 1, "username": "staff"},
    ):
        response = api_client.get("/api/v1/auth/me/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["data"]["username"] == "staff"


@override_settings(ALLOW_REGISTRATION=False)
def test_register_disabled_returns_403(api_client):
    response = api_client.post(
        "/api/v1/auth/register/",
        {"username": "new@test.com", "password": "pass1234", "first_name": "New"},
        format="json",
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "disabled" in response.json()["error"]["message"].lower()
