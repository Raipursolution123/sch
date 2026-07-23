from unittest.mock import patch

import pytest

from apps.alumni.services.alumni_service import (
    AlumniEventService,
    AlumniStudentService,
    AlumniValidationError,
)


def test_alumni_create_requires_student_id():
    with pytest.raises(AlumniValidationError, match="student_id"):
        AlumniStudentService().create({})


def test_alumni_create_student_missing():
    with patch("apps.alumni.services.alumni_service.Students.objects") as students:
        students.filter.return_value.first.return_value = None
        with pytest.raises(AlumniValidationError, match="Student not found"):
            AlumniStudentService().create({"student_id": 1})


def test_event_requires_title():
    with pytest.raises(AlumniValidationError, match="title"):
        AlumniEventService().create(
            {
                "title": "",
                "from_date": "2026-07-01T09:00:00",
                "to_date": "2026-07-01T17:00:00",
            }
        )


def test_event_date_order():
    with pytest.raises(AlumniValidationError, match="to_date"):
        AlumniEventService().create(
            {
                "title": "Meetup",
                "from_date": "2026-07-10T09:00:00",
                "to_date": "2026-07-01T17:00:00",
            }
        )
