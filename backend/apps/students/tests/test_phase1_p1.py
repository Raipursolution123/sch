"""Phase 1 unit coverage: behaviour, staff ratings, delivery stubs."""

from unittest.mock import MagicMock, patch

import pytest

from apps.communications.services.delivery_service import DeliveryService
from apps.staff.services.staff_rating_service import StaffRatingService
from apps.students.services.behaviour_service import BehaviourService


class TestBehaviourService:
    @patch("apps.students.services.behaviour_service.StudentBehaviour")
    def test_list_incident_types(self, mock_model):
        row = MagicMock(
            id=1,
            title="Late",
            point=-1,
            description="Late to class",
            created_at=None,
        )
        mock_model.objects.all.return_value.order_by.return_value = [row]
        data = BehaviourService().list_incident_types()
        assert data == [
            {
                "id": 1,
                "title": "Late",
                "point": -1,
                "description": "Late to class",
                "created_at": None,
            }
        ]

    def test_create_incident_type_requires_title(self):
        with pytest.raises(ValueError, match="Title"):
            BehaviourService().create_incident_type({"title": "  ", "point": 1})


class TestStaffRatingService:
    @patch("apps.staff.services.staff_rating_service.Staff")
    @patch("apps.staff.services.staff_rating_service.StaffRating")
    def test_list_ratings(self, mock_rating, mock_staff):
        row = MagicMock(
            id=5,
            staff_id=2,
            comment="Great",
            rate=5,
            user_id=9,
            role="student",
            status=1,
            entrydt=None,
        )
        mock_rating.objects.all.return_value.order_by.return_value = [row]
        staff = MagicMock()
        staff.id = 2
        staff.name = "Anita"
        staff.surname = "Sharma"
        staff.email = "a@x.com"
        mock_staff.objects.filter.return_value = [staff]
        data = StaffRatingService().list_ratings()
        assert len(data) == 1
        assert data[0]["staff_name"]
        assert data[0]["status_label"] == "approved"


class TestDeliveryService:
    @patch("apps.communications.services.delivery_service.EmailConfig")
    def test_email_without_config(self, mock_cfg):
        mock_cfg.objects.filter.return_value.order_by.return_value.first.return_value = (
            None
        )
        mock_cfg.objects.order_by.return_value.first.return_value = None
        msg = MagicMock(id=1, user_list="a@b.com", title="Hi", message="Body")
        result = DeliveryService().deliver_message(msg, channel="email")
        assert result["ok"] is False
        assert result["sent"] == 0

    @patch("apps.communications.services.delivery_service.SmsConfig")
    def test_sms_stub_with_config(self, mock_cfg):
        cfg = MagicMock()
        cfg.name = "Twilio"
        cfg.type = "twilio"
        mock_cfg.objects.filter.return_value.order_by.return_value.first.return_value = (
            cfg
        )
        msg = MagicMock(id=2, user_list="9999999999", message="Hello")
        result = DeliveryService().deliver_message(msg, channel="sms")
        assert result["ok"] is True
        assert result["sent"] == 1
        assert result.get("stub") is True
