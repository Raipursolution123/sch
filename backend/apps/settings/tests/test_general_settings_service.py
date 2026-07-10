from unittest.mock import MagicMock, patch

import pytest

from apps.settings.domain.general_settings_exceptions import (
    GeneralSettingsReadOnlyError,
    GeneralSettingsValidationError,
    SchSettingsNotFoundError,
)
from apps.settings.services.general_settings_service import GeneralSettingsService


@pytest.fixture
def service():
    return GeneralSettingsService()


def test_get_settings_not_found(service):
    with patch(
        "apps.settings.services.general_settings_service.selectors.get_sch_settings",
        return_value=None,
    ):
        with pytest.raises(SchSettingsNotFoundError):
            service.get_settings()


def test_get_settings_returns_dict(service):
    settings = MagicMock(id=1, session_id=5)
    with patch(
        "apps.settings.services.general_settings_service.selectors.get_sch_settings",
        return_value=settings,
    ):
        with patch(
            "apps.settings.services.general_settings_service.selectors.settings_to_dict",
            return_value={"id": 1, "session_id": 5, "name": "Demo"},
        ):
            result = service.get_settings()
    assert result["id"] == 1
    assert result["session_id"] == 5


def test_update_rejects_missing_row(service):
    with patch(
        "apps.settings.services.general_settings_service.selectors.get_sch_settings",
        return_value=None,
    ):
        with pytest.raises(SchSettingsNotFoundError):
            service.update_settings({"name": "School"})


def test_update_saves_allowlisted_fields(service):
    settings = MagicMock(id=1)
    with patch(
        "apps.settings.services.general_settings_service.selectors.get_sch_settings",
        return_value=settings,
    ):
        with patch(
            "apps.settings.services.general_settings_service.validate_and_normalize",
            return_value={"name": "Demo School"},
        ):
            with patch(
                "apps.settings.services.general_settings_service.selectors.settings_to_dict",
                return_value={"id": 1, "name": "Demo School"},
            ):
                result = service.update_settings({"name": "Demo School"})

    assert settings.name == "Demo School"
    settings.save.assert_called_once()
    kwargs = settings.save.call_args.kwargs
    assert "name" in kwargs["update_fields"]
    assert "updated_at" in kwargs["update_fields"]
    assert result["name"] == "Demo School"


def test_update_rejects_session_id(service):
    settings = MagicMock(id=1)
    with patch(
        "apps.settings.services.general_settings_service.selectors.get_sch_settings",
        return_value=settings,
    ):
        with pytest.raises(GeneralSettingsReadOnlyError):
            service.update_settings({"session_id": 99})


def test_update_rejects_unknown_field(service):
    settings = MagicMock(id=1)
    with patch(
        "apps.settings.services.general_settings_service.selectors.get_sch_settings",
        return_value=settings,
    ):
        with pytest.raises(GeneralSettingsValidationError) as exc:
            service.update_settings({"zoom_api_key": "secret"})
    assert "Unknown fields" in exc.value.message
