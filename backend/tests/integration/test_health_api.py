from unittest.mock import patch

from rest_framework import status


def test_health_liveness(client):
    response = client.get("/health/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "healthy"


def test_readiness_endpoint_responds(client):
    with patch("core.health.urls.check_onboarding") as check_mock:
        check_mock.return_value.database_connected = True
        check_mock.return_value.ready_for_development = True
        check_mock.return_value.as_dict.return_value = {"schema_loaded": True}
        response = client.get("/health/ready/")
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["database"] == "ok"
    assert "onboarding" in body
