from unittest.mock import MagicMock, patch

import pytest

from apps.academics.domain.session_exceptions import (
    SessionCurrentError,
    SessionInUseError,
    SessionLastError,
    SessionNotFoundError,
)
from apps.academics.services.session_service import SessionService


@pytest.fixture
def service():
    return SessionService()


def test_create_session_sets_inactive(service):
    with patch("apps.academics.services.session_service.Sessions") as sessions_model:
        with patch(
            "apps.academics.services.session_service.validate_session_name",
            return_value="2028-29",
        ):
            with patch(
                "apps.academics.services.session_service.ensure_unique_session_name"
            ):
                created = MagicMock(
                    id=99,
                    session="2028-29",
                    is_active="no",
                    created_at=None,
                    updated_at=None,
                )
                sessions_model.objects.create.return_value = created
                with patch(
                    "apps.academics.services.session_service.selectors.session_to_dict",
                    return_value={"id": 99, "session": "2028-29", "is_active": "no"},
                ):
                    result = service.create_session("2028-29")
    assert result["session"] == "2028-29"
    sessions_model.objects.create.assert_called_once()
    kwargs = sessions_model.objects.create.call_args.kwargs
    assert kwargs["is_active"] == "no"


def test_get_session_not_found(service):
    with patch(
        "apps.academics.services.session_service.selectors.get_session_by_id",
        return_value=None,
    ):
        with pytest.raises(SessionNotFoundError):
            service.get_session(1)


@patch("apps.academics.services.session_service.Sessions")
def test_activate_updates_sch_settings(sessions_model, service):
    session = MagicMock(id=5, session="2026-27", is_active="no")

    with patch(
        "apps.academics.services.session_service.selectors.get_session_by_id",
        return_value=session,
    ):
        with patch(
            "apps.academics.services.session_service.selectors.update_sch_settings_session_id"
        ) as update_settings:
            with patch(
                "apps.academics.services.session_service.selectors.session_to_dict",
                return_value={"id": 5, "is_current": True},
            ):
                service.activate_session(5)

    session.save.assert_called_once()
    assert session.is_active == "yes"
    update_settings.assert_called_once_with(5)
    sessions_model.objects.exclude.assert_called()


def test_delete_current_session_raises(service):
    session = MagicMock(id=3, session="2026-27")
    with patch(
        "apps.academics.services.session_service.selectors.get_session_by_id",
        return_value=session,
    ):
        with patch(
            "apps.academics.services.session_service.selectors.get_current_session_id",
            return_value=3,
        ):
            with pytest.raises(SessionCurrentError):
                service.delete_session(3)


def test_delete_last_session_raises(service):
    session = MagicMock(id=3, session="2026-27")
    with patch(
        "apps.academics.services.session_service.selectors.get_session_by_id",
        return_value=session,
    ):
        with patch(
            "apps.academics.services.session_service.selectors.get_current_session_id",
            return_value=99,
        ):
            with patch(
                "apps.academics.services.session_service.selectors.count_sessions",
                return_value=1,
            ):
                with pytest.raises(SessionLastError):
                    service.delete_session(3)


def test_delete_in_use_session_raises(service):
    session = MagicMock(id=3, session="2026-27")
    with patch(
        "apps.academics.services.session_service.selectors.get_session_by_id",
        return_value=session,
    ):
        with patch(
            "apps.academics.services.session_service.selectors.get_current_session_id",
            return_value=99,
        ):
            with patch(
                "apps.academics.services.session_service.selectors.count_sessions",
                return_value=2,
            ):
                with patch(
                    "apps.academics.services.session_service.find_session_dependencies",
                    return_value=["Students are enrolled in this session"],
                ):
                    with pytest.raises(SessionInUseError) as exc:
                        service.delete_session(3)
    assert exc.value.references == ["Students are enrolled in this session"]
