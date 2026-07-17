from contextlib import nullcontext
from unittest.mock import MagicMock, patch

import pytest

from apps.admissions.domain.admissions_exceptions import (
    AdmissionsConflictError,
    AdmissionsNotFoundError,
    AdmissionsValidationError,
)
from apps.admissions.services.online_admission_service import OnlineAdmissionService
from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeNotFoundError,
    FrontOfficeValidationError,
)
from apps.front_office.services.enquiry_service import EnquiryService


@pytest.fixture
def enquiry_service():
    return EnquiryService()


@pytest.fixture
def online_admission_service():
    return OnlineAdmissionService()


def test_create_enquiry_requires_name(enquiry_service):
    with pytest.raises(FrontOfficeValidationError, match="Name is required"):
        enquiry_service.create_enquiry({"contact": "9999999999"}, created_by=1)


def test_create_enquiry_requires_contact(enquiry_service):
    with pytest.raises(FrontOfficeValidationError, match="Contact is required"):
        enquiry_service.create_enquiry({"name": "John Doe"}, created_by=1)


def test_get_enquiry_not_found(enquiry_service):
    with patch(
        "apps.front_office.services.enquiry_service.Enquiry.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = None
        with pytest.raises(FrontOfficeNotFoundError):
            enquiry_service.get_enquiry(999)


def test_create_enquiry_success(enquiry_service):
    with patch(
        "apps.front_office.services.enquiry_service.Enquiry.objects.create"
    ) as create_mock:
        create_mock.return_value = MagicMock(id=1, name="John Doe")
        enquiry = enquiry_service.create_enquiry(
            {"name": "John Doe", "contact": "9999999999"},
            created_by=7,
        )
        assert enquiry.id == 1
        create_mock.assert_called_once()
        assert create_mock.call_args.kwargs["created_by"] == 7


def test_get_admission_not_found(online_admission_service):
    with patch(
        "apps.admissions.services.online_admission_service.OnlineAdmissions.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = None
        with pytest.raises(AdmissionsNotFoundError):
            online_admission_service.get_admission(999)


def test_convert_to_student_already_enrolled(online_admission_service):
    admission = MagicMock(is_enroll=1)
    with patch.object(
        online_admission_service, "get_admission", return_value=admission
    ):
        with pytest.raises(AdmissionsConflictError, match="already enrolled"):
            online_admission_service.convert_to_student(1)


def test_convert_to_student_success(online_admission_service):
    admission = MagicMock(
        id=10,
        is_enroll=0,
        admission_no="ADM001",
        reference_no="REF001",
        admission_date=None,
        roll_no=None,
        class_section_id=5,
        firstname="Jane",
        middlename="",
        lastname="Doe",
        gender="Female",
        mobileno="9999999999",
        email="jane@example.com",
        state="CG",
        city="Raipur",
        pincode="492001",
        religion="Hindu",
        cast="General",
        dob=None,
        father_name="John",
        father_phone="8888888888",
        father_occupation="Engineer",
        mother_name="Mary",
        mother_phone="7777777777",
        mother_occupation="Teacher",
        guardian_name="John",
        guardian_relation="Father",
        guardian_phone="8888888888",
        guardian_occupation="Engineer",
        guardian_address="Raipur",
        guardian_email="john@example.com",
        guardian_is="father",
        current_address="Raipur",
        permanent_address="Raipur",
        blood_group="O+",
        school_house_id=1,
        hostel_room_id=0,
        adhar_no=None,
        samagra_id=None,
        bank_account_no=None,
        bank_name=None,
        ifsc_code=None,
        previous_school=None,
        height="150",
        weight="45",
        measurement_date=None,
        note="",
        rte="No",
        category_id=1,
    )
    mapping = MagicMock(class_id=2, section_id=3)
    student_result = {"id": 99, "admission_no": "ADM001"}

    with (
        patch.object(online_admission_service, "get_admission", return_value=admission),
        patch(
            "apps.admissions.services.online_admission_service.ClassSections.objects.filter"
        ) as class_sections_filter,
        patch(
            "apps.admissions.services.online_admission_service.StudentService"
        ) as student_service_cls,
        patch(
            "apps.admissions.services.online_admission_service.transaction.atomic",
            return_value=nullcontext(),
        ),
    ):
        class_sections_filter.return_value.first.return_value = mapping
        student_service_cls.return_value.admit_student.return_value = student_result

        result = online_admission_service.convert_to_student(10)

        assert result["online_admission_id"] == 10
        assert result["student"] == student_result
        student_service_cls.return_value.admit_student.assert_called_once()
        assert admission.is_enroll == 1
        admission.save.assert_called_once()


def test_convert_to_student_requires_class_section(online_admission_service):
    admission = MagicMock(
        is_enroll=0, class_section_id=None, admission_no="ADM001", reference_no="REF001"
    )
    with patch.object(
        online_admission_service, "get_admission", return_value=admission
    ):
        with pytest.raises(AdmissionsValidationError, match="Class and section"):
            online_admission_service.convert_to_student(10)
