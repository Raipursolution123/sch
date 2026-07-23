import pytest

from apps.cms.services.cms_service import CmsEventService, CmsValidationError
from apps.cyc_extensions.services.lead_service import LeadService, LeadValidationError


def test_lead_requires_name():
    with pytest.raises(LeadValidationError, match="l_name"):
        LeadService().create({"c_id": 1, "l_phone_number": "999"}, manager_id=1)


def test_lead_requires_campaign():
    with pytest.raises(LeadValidationError, match="c_id"):
        LeadService().create({"l_name": "A", "l_phone_number": "999"}, manager_id=1)


def test_cms_event_requires_title():
    with pytest.raises(CmsValidationError, match="event_title"):
        CmsEventService().create(
            {
                "event_title": " ",
                "start_date": "2026-07-01T10:00:00",
                "end_date": "2026-07-01T12:00:00",
            }
        )


def test_cms_event_date_order():
    with pytest.raises(CmsValidationError, match="end_date"):
        CmsEventService().create(
            {
                "event_title": "Meet",
                "start_date": "2026-07-10T10:00:00",
                "end_date": "2026-07-01T12:00:00",
            }
        )
