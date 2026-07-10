from datetime import time
from unittest.mock import MagicMock, patch

import pytest

from apps.academics.domain.timetable_exceptions import (
    TimetableConflictError,
    TimetableNotFoundError,
    TimetableValidationError,
)
from apps.academics.services.timetable_service import TimetableService


@pytest.fixture
def service():
    return TimetableService()


def test_create_requires_session(service):
    with pytest.raises(TimetableValidationError):
        service.create_period(
            {
                "class_id": 1,
                "section_id": 1,
                "subject_group_subject_id": 1,
                "staff_id": 1,
                "day": "Monday",
                "start_time": "09:00",
                "end_time": "09:45",
            }
        )


def test_get_period_not_found(service):
    with patch(
        "apps.academics.services.timetable_service.selectors.get_period_by_id",
        return_value=None,
    ):
        with pytest.raises(TimetableNotFoundError):
            service.get_period(99)


def test_create_period_success(service):
    with patch("apps.academics.services.timetable_service.Sessions") as sessions_model:
        with patch(
            "apps.academics.services.timetable_service.ClassSections"
        ) as cs_model:
            with patch(
                "apps.academics.services.timetable_service.SubjectGroupSubjects"
            ) as sgs_model:
                with patch(
                    "apps.academics.services.timetable_service."
                    "SubjectGroupClassSections"
                ) as sgcs_model:
                    with patch(
                        "apps.academics.services.timetable_service.Staff"
                    ) as staff_model:
                        with patch(
                            "apps.academics.services.timetable_service.SubjectTimetable"
                        ) as tt_model:
                            session_exists = (
                                sessions_model.objects.filter.return_value.exists
                            )
                            session_exists.return_value = True
                            cs_exists = cs_model.objects.filter.return_value.exists
                            cs_exists.return_value = True
                            sgs = MagicMock(
                                id=10,
                                subject_group_id=5,
                                session_id=3,
                            )
                            sgs_model.objects.filter.return_value.first.return_value = (
                                sgs
                            )
                            sgcs_exists = sgcs_model.objects.filter.return_value.exists
                            sgcs_exists.return_value = True
                            staff = MagicMock(is_active=1)
                            staff_first = staff_model.objects.filter.return_value.first
                            staff_first.return_value = staff
                            tt_model.objects.filter.return_value = []
                            created = MagicMock(id=1)
                            tt_model.objects.create.return_value = created
                            with patch(
                                "apps.academics.services.timetable_service.selectors."
                                "get_active_class_section",
                                return_value=MagicMock(id=99),
                            ):
                                with patch(
                                    "apps.academics.services.timetable_service."
                                    "selectors.period_to_dict",
                                    return_value={"id": 1, "day": "Monday"},
                                ):
                                    result = service.create_period(
                                        {
                                            "session_id": 3,
                                            "class_id": 1,
                                            "section_id": 2,
                                            "subject_group_subject_id": 10,
                                            "staff_id": 7,
                                            "day": "Monday",
                                            "start_time": "09:00",
                                            "end_time": "09:45",
                                            "room_no": "101",
                                        }
                                    )
    assert result["day"] == "Monday"
    tt_model.objects.create.assert_called_once()


def test_create_rejects_invalid_day(service):
    with pytest.raises(TimetableValidationError):
        service._normalize_day("Funday")


def test_parse_time_range_end_before_start(service):
    with pytest.raises(TimetableValidationError):
        service._parse_time_range("10:00", "09:00")


def test_class_conflict_detected(service):
    other = MagicMock(start_time=time(9, 0), end_time=time(10, 0))
    with patch(
        "apps.academics.services.timetable_service.SubjectTimetable"
    ) as tt_model:
        tt_model.objects.filter.return_value = [other]
        with pytest.raises(TimetableConflictError):
            service._assert_no_class_conflict(
                1, 2, 3, "Monday", time(9, 30), time(10, 30)
            )
