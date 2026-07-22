from unittest.mock import patch

import pytest

from apps.documents.domain.certificate_exceptions import (
    CertificateValidationError,
)
from apps.documents.services.certificate_service import (
    CertificateGenerateService,
    CertificateTemplateService,
)


def test_template_requires_name():
    with pytest.raises(CertificateValidationError, match="Certificate name"):
        CertificateTemplateService().create(
            {"certificate_name": "  ", "certificate_text": "Hello [name]"}
        )


def test_template_requires_text():
    with pytest.raises(CertificateValidationError, match="Certificate text"):
        CertificateTemplateService().create(
            {"certificate_name": "TC", "certificate_text": ""}
        )


def test_template_rejects_bad_created_for():
    with pytest.raises(CertificateValidationError, match="created_for"):
        CertificateTemplateService().create(
            {
                "certificate_name": "TC",
                "certificate_text": "Hi",
                "created_for": 9,
            }
        )


def test_merge_replaces_bracket_and_mustache_tokens():
    tokens = CertificateGenerateService._student_tokens(
        {
            "full_name": "Ada Lovelace",
            "firstname": "Ada",
            "middlename": None,
            "lastname": "Lovelace",
            "admission_no": "A1",
            "class_name": "10",
            "section_name": "A",
        }
    )
    assert tokens["name"] == "Ada Lovelace"
    assert tokens["admission_no"] == "A1"

    service = CertificateGenerateService()
    with patch.object(
        CertificateTemplateService,
        "get",
        return_value=type(
            "T",
            (),
            {
                "id": 1,
                "certificate_name": "TC",
                "created_for": 2,
                "left_header": "[name]",
                "center_header": "",
                "right_header": "",
                "left_footer": "",
                "center_footer": "",
                "right_footer": "",
                "certificate_text": "Cert for {{name}} ({{admission_no}})",
                "background_image": None,
                "header_height": 10,
                "content_height": 20,
                "footer_height": 10,
                "content_width": 800,
                "enable_student_image": 0,
                "enable_image_height": 0,
            },
        )(),
    ), patch(
        "apps.documents.services.certificate_service.StudentService.get_student",
        return_value={
            "full_name": "Ada Lovelace",
            "firstname": "Ada",
            "middlename": None,
            "lastname": "Lovelace",
            "admission_no": "A1",
            "class_name": "10",
            "section_name": "A",
            "image": None,
        },
    ):
        preview = service.preview(certificate_id=1, student_id=5)
    assert preview["left_header"] == "Ada Lovelace"
    assert preview["certificate_text"] == "Cert for Ada Lovelace (A1)"
