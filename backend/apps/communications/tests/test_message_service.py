from unittest.mock import MagicMock, patch

import pytest

from apps.communications.domain.notification_exceptions import (
    NotificationValidationError,
)
from apps.communications.services.message_service import MessageService


def test_compose_requires_title():
    with pytest.raises(NotificationValidationError, match="Title"):
        MessageService().compose({"title": "  ", "message": "Hello"}, channel="email")


def test_compose_requires_message():
    with pytest.raises(NotificationValidationError, match="Message body"):
        MessageService().compose({"title": "Hello", "message": ""}, channel="sms")


def test_compose_rejects_bad_channel():
    with pytest.raises(NotificationValidationError, match="channel"):
        MessageService().compose({"title": "T", "message": "M"}, channel="push")


def test_compose_individual_requires_user_list():
    with pytest.raises(NotificationValidationError, match="user_list"):
        MessageService().compose(
            {"title": "T", "message": "M", "audience": "individual"},
            channel="email",
        )


@patch("apps.communications.services.message_service.Messages.objects")
def test_compose_email_persists_queued(objects):
    row = MagicMock()
    row.id = 9
    row.title = "Exam notice"
    row.message = "Body"
    row.send_through = "email"
    row.send_mail = "1"
    row.send_sms = "0"
    row.is_group = "1"
    row.is_individual = "0"
    row.is_class = 0
    row.is_schedule = 0
    row.sent = 0
    row.group_list = "students,staff,parent"
    row.user_list = None
    row.schedule_class = None
    row.schedule_section = None
    row.created_at = None
    row.updated_at = None
    objects.create.return_value = row

    data = MessageService().compose(
        {"title": "Exam notice", "message": "Body", "audience": "group"},
        channel="email",
    )
    assert data["id"] == 9
    assert data["delivery_status"] == "queued"
    assert data["send_mail"] is True
    kwargs = objects.create.call_args.kwargs
    assert kwargs["send_mail"] == "1"
    assert kwargs["sent"] == 0


def test_bulk_email_requires_class():
    with pytest.raises(NotificationValidationError, match="session_id and class_id"):
        MessageService().bulk_email_to_students(
            {"title": "T", "message": "M", "session_id": 1}
        )
