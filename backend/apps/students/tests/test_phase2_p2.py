"""Phase 2 unit coverage: fee adjustments, transport, hostel, schemes, multi-class."""

from unittest.mock import MagicMock, patch

import pytest

from apps.attendance.domain.attendance_exceptions import AttendanceValidationError
from apps.attendance.services.hostel_attendance_service import HostelAttendanceService
from apps.fees.domain.fee_exceptions import FeeNotFoundError, FeeValidationError
from apps.fees.services.positive_fee_adjustment_service import (
    PositiveFeeAdjustmentService,
)
from apps.fees.services.scheme_scholarship_service import SchemeScholarshipService
from apps.students.domain.student_exceptions import StudentValidationError
from apps.students.services.multi_class_service import MultiClassService
from apps.transport.domain.transport_exceptions import TransportValidationError
from apps.transport.services.student_transport_fee_service import (
    StudentTransportFeeService,
)


class TestPositiveFeeAdjustmentService:
    def test_apply_bulk_requires_rows(self):
        with pytest.raises(FeeValidationError, match="adjustments"):
            PositiveFeeAdjustmentService().apply_bulk({"adjustments": []}, entry_by=1)

    @patch("apps.fees.services.positive_fee_adjustment_service.get_current_session")
    def test_get_roster_requires_session(self, mock_session):
        mock_session.return_value = None
        with pytest.raises(FeeValidationError, match="session"):
            PositiveFeeAdjustmentService().get_roster()


class TestSchemeScholarshipService:
    def test_create_scheme_requires_name(self):
        with pytest.raises(FeeValidationError, match="name"):
            SchemeScholarshipService().create_scheme({})

    @patch("apps.fees.services.scheme_scholarship_service.CycSchemeAndScholarship")
    def test_get_scheme_config_not_found(self, mock_model):
        mock_model.objects.filter.return_value.first.return_value = None
        with pytest.raises(FeeNotFoundError, match="not found"):
            SchemeScholarshipService().get_scheme_config(99)

    @patch("apps.fees.services.scheme_scholarship_service.CycSchemeAndScholarship")
    def test_list_schemes(self, mock_model):
        row = MagicMock(
            ss_id=1,
            ss_name="Merit",
            ss_type="scholarship",
            ss_applicable_on="fee",
            ss_status=1,
        )
        mock_model.objects.all.return_value.order_by.return_value = [row]
        with patch(
            "apps.fees.services.scheme_scholarship_service.CycSchemeAndScholarshipValue"
        ) as mock_values:
            mock_values.objects.filter.return_value = []
            data = SchemeScholarshipService().list_schemes()
        assert len(data) == 1
        assert data[0]["ss_name"] == "Merit"


class TestStudentTransportFeeService:
    def test_assign_requires_ids(self):
        with pytest.raises(TransportValidationError):
            StudentTransportFeeService().assign({}, generated_by=1)


class TestHostelAttendanceService:
    def test_get_roster_requires_hostel_and_date(self):
        with pytest.raises(AttendanceValidationError, match="hostel_id"):
            HostelAttendanceService().get_roster(hostel_id=0, date_str="")

    def test_get_roster_invalid_date(self):
        with pytest.raises(AttendanceValidationError, match="date"):
            HostelAttendanceService().get_roster(hostel_id=1, date_str="bad-date")


class TestMultiClassService:
    def test_save_requires_student_id(self):
        with pytest.raises(StudentValidationError):
            MultiClassService().save_enrollments({})
