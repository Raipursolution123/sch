import logging

from apps.academics.checks.session_dependencies import find_session_dependencies
from apps.academics.domain.session_exceptions import (
    SessionCurrentError,
    SessionInUseError,
    SessionLastError,
    SessionNotFoundError,
)
from apps.academics.domain.session_validators import (
    ensure_unique_session_name,
    validate_session_name,
)
from apps.academics.models import Sessions
from apps.academics.selectors import session_selectors as selectors

logger = logging.getLogger(__name__)


class SessionService:
    """Business logic for academic session CRUD and activation."""

    def list_sessions(self, active_only: bool = False):
        return selectors.list_sessions(active_only=active_only)

    def get_session(self, session_id: int) -> dict:
        session = selectors.get_session_by_id(session_id)
        if session is None:
            raise SessionNotFoundError()
        return selectors.session_to_dict(session)

    def get_active_session(self) -> dict | None:
        session = selectors.get_current_session()
        if session is None:
            return None
        return selectors.session_to_dict(session)

    def create_session(self, raw_name: str) -> dict:
        name = validate_session_name(raw_name)
        ensure_unique_session_name(name)

        session = Sessions.objects.create(
            session=name,
            is_active="no",
            created_at=selectors.now_datetime(),
            updated_at=None,
        )
        logger.info("Academic session '%s' created (id=%s).", name, session.id)
        return selectors.session_to_dict(session)

    def update_session(self, session_id: int, raw_name: str) -> dict:
        session = selectors.get_session_by_id(session_id)
        if session is None:
            raise SessionNotFoundError()

        name = validate_session_name(raw_name)
        ensure_unique_session_name(name, exclude_id=session_id)

        session.session = name
        session.updated_at = selectors.today_date()
        session.save(update_fields=["session", "updated_at"])
        logger.info("Academic session id=%s renamed to '%s'.", session_id, name)
        return selectors.session_to_dict(session)

    def activate_session(self, session_id: int) -> dict:
        session = selectors.get_session_by_id(session_id)
        if session is None:
            raise SessionNotFoundError()

        Sessions.objects.exclude(pk=session_id).filter(is_active="yes").update(
            is_active="no",
            updated_at=selectors.today_date(),
        )
        session.is_active = "yes"
        session.updated_at = selectors.today_date()
        session.save(update_fields=["is_active", "updated_at"])

        selectors.update_sch_settings_session_id(session.id)

        logger.info(
            "Academic session '%s' activated (id=%s).", session.session, session.id
        )
        return selectors.session_to_dict(session)

    def delete_session(self, session_id: int) -> None:
        session = selectors.get_session_by_id(session_id)
        if session is None:
            raise SessionNotFoundError()

        current_id = selectors.get_current_session_id()
        if current_id == session_id:
            raise SessionCurrentError()

        if selectors.count_sessions() <= 1:
            raise SessionLastError()

        blockers = find_session_dependencies(session_id)
        if blockers:
            raise SessionInUseError(
                message="Cannot delete session in use.",
                references=blockers,
            )

        label = session.session
        session.delete()
        logger.info("Academic session '%s' deleted (id=%s).", label, session_id)
