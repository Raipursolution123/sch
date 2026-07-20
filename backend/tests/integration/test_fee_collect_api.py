from unittest.mock import MagicMock, patch

from apps.fees.domain.fee_exceptions import FeeValidationError


def test_fee_collect_roster_api_requires_authentication(api_client):
    response = api_client.get(
        "/api/v1/fees/collect/roster/", {"class_id": 1, "section_id": 1}
    )
    assert response.status_code == 401


def test_fee_collect_roster_api_returns_roster(api_client):
    user = MagicMock()
    user.is_authenticated = True
    user.is_superadmin = True
    api_client.force_authenticate(user=user)

    roster = {
        "class_id": 1,
        "class_name": "Class 5",
        "section_id": 2,
        "section_name": "A",
        "session_name": "2025-26",
        "students": [],
    }
    with patch("core.permissions.legacy_privilege.is_module_active", return_value=True):
        with patch(
            "apps.fees.api.views.fee_collect.FeeCollectService.get_roster",
            return_value=roster,
        ):
            response = api_client.get(
                "/api/v1/fees/collect/roster/",
                {"class_id": 1, "section_id": 2},
            )

    assert response.status_code == 200
    assert response.json()["data"]["class_name"] == "Class 5"


def test_fee_collect_roster_api_validation_error(api_client):
    user = MagicMock()
    user.is_authenticated = True
    user.is_superadmin = True
    api_client.force_authenticate(user=user)

    with patch("core.permissions.legacy_privilege.is_module_active", return_value=True):
        with patch(
            "apps.fees.api.views.fee_collect.FeeCollectService.get_roster",
            side_effect=FeeValidationError("No active academic session found."),
        ):
            response = api_client.get(
                "/api/v1/fees/collect/roster/",
                {"class_id": 1, "section_id": 2},
            )

    assert response.status_code == 400
