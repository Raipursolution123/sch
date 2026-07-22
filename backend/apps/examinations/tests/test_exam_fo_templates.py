from unittest.mock import patch

import pytest

from apps.examinations.domain.examination_exceptions import ExaminationValidationError
from apps.examinations.services.exam_template_service import (
    AdmitCardTemplateService,
    MarksheetTemplateService,
)
from apps.front_office.domain.front_office_exceptions import FrontOfficeValidationError
from apps.front_office.services.phone_call_purpose_service import (
    PhoneCallLogService,
    VisitorsPurposeService,
)


def test_admit_card_requires_heading_or_title():
    with pytest.raises(ExaminationValidationError, match="Heading or title"):
        AdmitCardTemplateService().create({"heading": "  ", "title": ""})


def test_marksheet_requires_heading_or_title():
    with pytest.raises(ExaminationValidationError, match="Heading or title"):
        MarksheetTemplateService().create({"heading": "", "title": "  "})


def test_phone_call_requires_name():
    with pytest.raises(FrontOfficeValidationError, match="Name"):
        PhoneCallLogService().create(
            {
                "name": "",
                "contact": "999",
                "date": "2026-07-22",
                "call_type": "Incoming",
            }
        )


def test_phone_call_rejects_bad_type():
    with pytest.raises(FrontOfficeValidationError, match="call_type"):
        PhoneCallLogService().create(
            {
                "name": "Parent",
                "contact": "999",
                "date": "2026-07-22",
                "call_type": "Missed",
            }
        )


def test_visitor_purpose_requires_name():
    with pytest.raises(FrontOfficeValidationError, match="Purpose"):
        VisitorsPurposeService().create({"visitors_purpose": "  "})


def test_admit_card_delete_not_found():
    with patch(
        "apps.examinations.services.exam_template_service.TemplateAdmitcards.objects"
    ) as objects:
        objects.filter.return_value.first.return_value = None
        with pytest.raises(Exception, match="not found"):
            AdmitCardTemplateService().delete(99)
