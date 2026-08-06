import pytest
from unittest.mock import MagicMock, patch
from django.utils import timezone

from apps.students.services.student_behaviour_service import StudentBehaviourService
from apps.students.models.student_behaviour import StudentBehaviour
from apps.students.models.student_incidents import StudentIncidents
from apps.students.models.student_incident_comments import StudentIncidentComments
from apps.settings.models.behaviour_settings import BehaviourSettings


@pytest.mark.django_db
def test_create_incident():
    service = StudentBehaviourService()
    
    with patch("apps.students.models.student_behaviour.StudentBehaviour.save") as mock_save:
        payload = {
            "title": "Excellent performance",
            "point": 10,
            "description": "Scored top marks in math."
        }
        incident = service.create_incident(payload)
        assert incident.title == "Excellent performance"
        assert incident.point == 10
        assert incident.description == "Scored top marks in math."
        assert mock_save.called


@pytest.mark.django_db
def test_list_incidents():
    service = StudentBehaviourService()
    
    with patch("apps.students.models.student_behaviour.StudentBehaviour.objects.all") as mock_all:
        mock_all.return_value.order_by.return_value = [
            StudentBehaviour(id=1, title="A", point=5, description="desc"),
            StudentBehaviour(id=2, title="B", point=-3, description="desc")
        ]
        
        incidents = service.list_incidents()
        assert len(incidents) == 2
        assert incidents[0].title == "A"
        assert incidents[1].point == -3


@pytest.mark.django_db
def test_get_incident_not_found():
    service = StudentBehaviourService()
    
    with patch("apps.students.models.student_behaviour.StudentBehaviour.objects.get") as mock_get:
        mock_get.side_effect = StudentBehaviour.DoesNotExist()
        with pytest.raises(ValueError, match="Incident not found"):
            service.get_incident(999)


@pytest.mark.django_db
def test_get_setting_default_creation():
    service = StudentBehaviourService()
    
    with patch("apps.settings.models.behaviour_settings.BehaviourSettings.objects.all") as mock_all:
        # Mock empty database, meaning first() returns None
        mock_all.return_value.first.return_value = None
        
        with patch("apps.settings.models.behaviour_settings.BehaviourSettings.save") as mock_save:
            setting = service.get_setting()
            assert setting.comment_option == "[]"
            assert mock_save.called
