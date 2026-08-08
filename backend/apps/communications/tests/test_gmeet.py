from unittest.mock import MagicMock, patch
import pytest
from apps.communications.services.gmeet_service import GmeetService


@patch("apps.communications.services.gmeet_service.GmeetSettings.objects")
def test_get_settings_creates_default(mock_settings_objects):
    mock_settings_objects.first.return_value = None
    mock_settings_objects.create.return_value = MagicMock(id=1, use_api=0)

    service = GmeetService()
    settings = service.get_settings()
    assert settings.id == 1
    assert settings.use_api == 0


@patch("apps.communications.services.gmeet_service.transaction.atomic")
@patch("apps.communications.services.gmeet_service.Gmeet.objects")
@patch("apps.communications.services.gmeet_service.GmeetSections.objects")
def test_create_class(mock_sections_objects, mock_gmeet_objects, mock_atomic):
    gmeet_mock = MagicMock(id=10)
    mock_gmeet_objects.create.return_value = gmeet_mock

    service = GmeetService()
    data = {
        "title": "Maths Live Class",
        "date": "2026-08-08 12:00:00",
        "duration": 40,
        "url": "https://meet.google.com/abc-defg-hij",
        "staff_id": 2,
    }
    class_sections = [1, 2]
    
    gmeet = service.create_class(data, class_sections, created_by_staff_id=1, session_id=1)
    
    assert gmeet.id == 10
    mock_gmeet_objects.create.assert_called_once()
    assert mock_sections_objects.create.call_count == 2

