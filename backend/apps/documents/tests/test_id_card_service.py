from unittest.mock import MagicMock, patch

import pytest

from apps.documents.domain.certificate_exceptions import CertificateValidationError
from apps.documents.services.id_card_service import (
    StaffIdCardService,
    StudentIdCardService,
)


def test_student_id_card_requires_title():
    with pytest.raises(CertificateValidationError, match="Title"):
        StudentIdCardService().create({"title": "  "})


def test_staff_id_card_requires_title():
    with pytest.raises(CertificateValidationError, match="Title"):
        StaffIdCardService().create({"title": ""})


def test_student_preview_includes_enabled_fields_only():
    template = MagicMock(
        id=1,
        title="Student Card",
        school_name="Demo School",
        school_address="City",
        background="",
        logo="",
        sign_image="",
        header_color="#000",
        enable_vertical_card=0,
        enable_admission_no=1,
        enable_student_name=1,
        enable_class=0,
        enable_fathers_name=0,
        enable_mothers_name=0,
        enable_address=0,
        enable_phone=0,
        enable_dob=0,
        enable_blood_group=0,
        enable_student_barcode=1,
    )
    with patch.object(StudentIdCardService, "get", return_value=template), patch(
        "apps.documents.services.id_card_service.StudentService.get_student",
        return_value={
            "full_name": "Ada Lovelace",
            "admission_no": "A1",
            "class_name": "10",
            "section_name": "A",
            "father_name": "G",
            "mother_name": "A",
            "current_address": "London",
            "mobileno": "999",
            "dob": "1815-12-10",
            "blood_group": "O+",
            "image": None,
        },
    ):
        preview = StudentIdCardService().preview(template_id=1, student_id=5)

    labels = {f["label"] for f in preview["fields"]}
    assert labels == {"Admission No", "Name"}
    assert preview["barcode"] == "A1"
    assert preview["person_name"] == "Ada Lovelace"


def test_staff_preview_barcode_fallback():
    template = MagicMock(
        id=2,
        title="Staff Card",
        school_name="Demo",
        school_address="",
        background="",
        logo="",
        sign_image="",
        header_color="#111",
        enable_vertical_card=1,
        enable_staff_role=0,
        enable_staff_id=1,
        enable_staff_department=0,
        enable_designation=0,
        enable_name=1,
        enable_fathers_name=0,
        enable_mothers_name=0,
        enable_date_of_joining=0,
        enable_permanent_address=0,
        enable_staff_dob=0,
        enable_staff_phone=0,
        enable_staff_barcode=1,
    )
    with patch.object(StaffIdCardService, "get", return_value=template), patch(
        "apps.documents.services.id_card_service.StaffService.get_staff",
        return_value={
            "name": "Grace",
            "surname": "Hopper",
            "employee_id": None,
            "department_name": "CS",
            "designation_name": "Teacher",
            "role_name": "Teacher",
            "father_name": None,
            "mother_name": None,
            "date_of_joining": None,
            "permanent_address": None,
            "dob": None,
            "contact_no": None,
            "image": None,
        },
    ):
        preview = StaffIdCardService().preview(template_id=2, staff_id=9)

    assert preview["barcode"] == "9"
    assert preview["person_name"] == "Grace Hopper"
    assert any(f["label"] == "Name" for f in preview["fields"])
